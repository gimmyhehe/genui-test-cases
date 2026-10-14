import { expect, type Page } from '@playwright/test'

/**
 * 在浏览器里把 `/chat/completions` 的 fetch 换成可控的 SSE 流。
 *
 * 为什么不用本地 HTTP 服务或 page.route：
 *  - start-with-renderer 把请求硬编码到 http://localhost:3100/chat/completions，
 *    而 3100 经常被仓库自己的 `pnpm dev`（packages/server）占用；
 *  - 跨域请求还需要 mock 服务正确处理 CORS 预检；
 *  - page.route().fulfill() 无法按时间分片下发，测不出「增量渲染」。
 *
 * 直接替换 window.fetch 可以拿到真正的 ReadableStream + 分片时机，
 * 不占端口、不受 CORS 影响，也不依赖任何 API Key。
 *
 * 场景由用户输入里的标记决定（避免并行用例之间共享状态）：
 *   [slow] / [no-done] / [http-500] / [bad-sse]
 *
 * 注意：函数体会被序列化后注入页面，所以不能引用外部变量。
 */
export async function stubChatCompletions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const PHASE_1 =
      '```schemaJson\n{"componentName":"Page","children":[{"componentName":"Text","props":{"text":"第一段"}}'
    const PHASE_2 = ',{"componentName":"Text","props":{"text":"第二段"}}]}\n```'
    const SLOW_DELAY_MS = 1500

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const sseChunk = (content: string) =>
      `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`

    const w = window as any
    w.__llmRequests = []

    const originalFetch = window.fetch.bind(window)

    window.fetch = async (input: any, init?: any): Promise<Response> => {
      const url = typeof input === 'string' ? input : input?.url ?? ''
      if (!url.includes('/chat/completions')) {
        return originalFetch(input, init)
      }

      let body: any = {}
      try {
        body = JSON.parse(init?.body)
      } catch {
        body = { __unparsable: init?.body }
      }

      w.__llmRequests.push({
        url,
        method: init?.method,
        headers: init?.headers,
        body,
        completed: false,
      })
      const record = w.__llmRequests[w.__llmRequests.length - 1]

      const messages = Array.isArray(body?.messages) ? body.messages : []
      const lastUser = [...messages].reverse().find((m: any) => m && m.role === 'user')
      const text = typeof lastUser?.content === 'string' ? lastUser.content : ''

      if (text.includes('[http-500]')) {
        record.completed = true
        return new Response(JSON.stringify({ error: { message: 'mock upstream failure' } }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      }

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const encoder = new TextEncoder()
          const push = (value: string) => controller.enqueue(encoder.encode(value))

          if (text.includes('[bad-sse]')) {
            push('data: { this is not json }\n\n')
            await sleep(50)
            push('data: [DONE]\n\n')
            controller.close()
            record.completed = true
            return
          }

          if (text.includes('[slow]')) {
            push(sseChunk(PHASE_1))
            await sleep(SLOW_DELAY_MS)
            push(sseChunk(PHASE_2))
            push('data: [DONE]\n\n')
            controller.close()
            record.completed = true
            return
          }

          push(sseChunk(PHASE_1))
          await sleep(30)
          push(sseChunk(PHASE_2))
          await sleep(30)

          if (!text.includes('[no-done]')) {
            push('data: [DONE]\n\n')
          }
          controller.close()
          record.completed = true
        },
      })

      return new Response(stream, {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      })
    }
  })
}

export interface StubbedLlmRequest {
  url: string
  method?: string
  headers?: Record<string, string>
  body: any
  /** 流是否已经下发完毕（含 [DONE] / 连接关闭）。 */
  completed: boolean
}

/** 读取被拦截的 /chat/completions 请求，用于断言请求契约。 */
export async function getStubbedRequests(page: Page): Promise<StubbedLlmRequest[]> {
  return page.evaluate(() => (window as any).__llmRequests ?? [])
}

/** 等待至少收到 count 个请求。 */
export async function expectStubbedRequestCount(page: Page, count: number): Promise<void> {
  await expect
    .poll(async () => (await getStubbedRequests(page)).length, {
      message: `未收到 ${count} 个 /chat/completions 请求`,
    })
    .toBeGreaterThanOrEqual(count)
}

/** 等待所有已记录的请求都下发完毕（用于「连续生成」这类需要等上一次结束的用例）。 */
export async function expectAllStubbedRequestsCompleted(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const requests = await getStubbedRequests(page)
      return requests.length > 0 && requests.every((request) => request.completed)
    }, { message: '等待 SSE 流下发完毕超时' })
    .toBe(true)
}
