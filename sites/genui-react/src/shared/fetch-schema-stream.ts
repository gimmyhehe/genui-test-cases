import { useCallback, useRef, useState } from 'react';
import { PatternExtractor } from '@opentiny/genui-sdk-core';

/**
 * React 案例统一走 `packages/server` 的 antd 物料服务（端口 3200）。
 * 3100 是 tiny-vue 物料服务、3300 是 tiny-ng 物料服务，React 案例不使用。
 */
export const REACT_SERVER_URL = 'http://localhost:3200/chat/completions';

export interface StreamOptions {
  url?: string;
  model?: string;
  /** 额外的 system 提示，服务端已按 materials 注入基础 prompt。 */
  systemPrompt?: string;
}

/**
 * 请求本地 GenUI server，把 SSE chunk 交给 PatternExtractor，
 * 只把「已成型」的 schema 片段回调出去，实现边生成边渲染。
 */
export async function fetchSchemaStream(
  userInput: string,
  onSchemaUpdate: (schemaChunk: string) => void,
  options: StreamOptions = {},
): Promise<void> {
  const url = options.url ?? REACT_SERVER_URL;
  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) messages.push({ role: 'system', content: options.systemPrompt });
  messages.push({ role: 'user', content: userInput });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: options.model ?? 'deepseek-v4-flash',
      thinking: { type: 'disabled' },
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}（请确认本地 GenUI server 已启动）`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const patternExtractor = new PatternExtractor({
    onNormalWrite: () => {},
    onHandledWrite: (value) => onSchemaUpdate(value),
  });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEndIndex = buffer.indexOf('\n');
        if (lineEndIndex === -1) break;

        const line = buffer.slice(0, lineEndIndex).trim();
        buffer = buffer.slice(lineEndIndex + 1);

        if (!line.startsWith('data:')) continue;

        const dataStr = line.slice(5).trim();

        if (dataStr === '[DONE]') return;

        try {
          const chunk = JSON.parse(dataStr);
          const content = chunk.choices?.[0]?.delta?.content;
          if (!content) continue;
          patternExtractor.handleContent(content);
        } catch (e) {
          console.error('解析后端数据失败:', e, dataStr);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export interface UseSchemaStreamResult {
  inputText: string;
  schema: string;
  generating: boolean;
  error: string;
  setInputText: (value: string) => void;
  send: () => Promise<void>;
  reset: () => void;
}

/** 复用「输入 -> 流式生成 -> schema」这段逻辑的 hook。 */
export function useSchemaStream(options: StreamOptions = {}): UseSchemaStreamResult {
  const [inputText, setInputText] = useState('');
  const [schema, setSchema] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const generatingRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const send = useCallback(async () => {
    if (!inputText.trim() || generatingRef.current) return;

    generatingRef.current = true;
    setGenerating(true);
    setError('');
    setSchema('');
    const userInput = inputText;
    setInputText('');

    try {
      await fetchSchemaStream(userInput, (chunk) => setSchema((prev) => prev + chunk), optionsRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('请求失败:', err);
    } finally {
      generatingRef.current = false;
      setGenerating(false);
    }
  }, [inputText]);

  const reset = useCallback(() => {
    setSchema('');
    setError('');
  }, []);

  return { inputText, schema, generating, error, setInputText, send, reset };
}
