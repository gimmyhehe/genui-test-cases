import type { CustomRequest } from './custom-fetch';
import replayText from './replay.txt?raw';
import replayText2 from './replay2.txt?raw';

export type ReplayCustomFetchOptions = {
  /**
   * 回放速度倍数：
   * - 1: 按日志中的相对时间回放
   * - 2: 2 倍速（更快）
   * - 0.5: 0.5 倍速（更慢）
   */
  speed?: number;
  /**
   * 仅当事件里能解析到 `first_token_return_time` 时生效：
   * - 对每段延迟进行下限/上限裁剪，避免超长等待或 0ms 忙循环
   */
  minDelayMs?: number;
  maxDelayMs?: number;
  /**
   * 回放结束后是否追加 `data: [DONE]\n\n`
   */
  appendDone?: boolean;
};

function sleep(ms: number, signal?: AbortSignal) {
  if (!ms) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

function parseFirstTokenReturnTimeMs(eventBlock: string): number | null {
  // eventBlock 类似：`data: {...json...}`
  const line = eventBlock
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('data:'));
  if (!line) return null;
  const raw = line.slice('data:'.length).trim();
  if (!raw || raw === '[DONE]') return null;
  try {
    const parsed = JSON.parse(raw);
    const t = parsed?.first_token_return_time;
    return typeof t === 'number' && Number.isFinite(t) ? Math.floor(t * 1000) : null;
  } catch {
    return null;
  }
}

const replayTexts = [replayText, replayText2];
let index = 0;

/**
 * 回放 `replay.txt` 的 SSE 流。
 * - 直接复用日志中的 `data: ...\n\n` 事件块顺序
 * - 若事件里存在 `first_token_return_time`，则按相对时间差来 sleep（可调倍速）
 */
export function createReplayCustomFetch(
  text: string,
  {
    speed = 1,
    minDelayMs = 10,
    maxDelayMs = 1200,
    appendDone = true,
  }: ReplayCustomFetchOptions = {},
): CustomRequest {
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;



  return async (_url, options): Promise<Response> => {
    const rawBlocks = replayTexts[index++]
    .replace(/\r\n/g, '\n')
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          let lastTsMs: number | null = null;

          for (const block of rawBlocks) {
            if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            const tsMs = parseFirstTokenReturnTimeMs(block);
            if (tsMs != null && lastTsMs != null) {
              const rawDelay = Math.max(0, tsMs - lastTsMs);
              const scaled = rawDelay / safeSpeed;
              const clipped = Math.max(minDelayMs, Math.min(maxDelayMs, scaled));
              await sleep(clipped, options.signal);
            }
            if (tsMs != null) lastTsMs = tsMs;

            // 保证每个事件块都以双换行结尾
            controller.enqueue(encoder.encode(`${block}\n\n`));
          }

          if (appendDone) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          }
          controller.close();
        } catch (error) {
          const errorData = {
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              type: 'replay_stream_error',
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
      status: 200,
    });
  };
}

/**
 * 从 `*.txt?raw` 内容创建一个回放 customFetch（便于 replay2.txt / replay3.txt 复用）
 */
export function createReplayCustomFetchFromRaw(
  replayRawText: string,
  options?: ReplayCustomFetchOptions,
): CustomRequest {
  return createReplayCustomFetch(replayRawText, options);
}


export const replayCustomFetch = createReplayCustomFetch(replayText, { speed: 2.5 });
