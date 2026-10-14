import { expect, test } from '@playwright/test'
import {
  expectAllStubbedRequestsCompleted,
  expectStubbedRequestCount,
  getStubbedRequests,
  stubChatCompletions,
} from './helpers/llm-stub'
import { demoFrame, openDemo, sendMessage } from './helpers/playground'

/**
 * 流式渲染：Schema 随着 SSE 分片逐步到达时如何增量渲染。
 * LLM 由注入的 fetch stub 模拟（见 helpers/llm-stub.ts）。
 */
test.beforeEach(async ({ page }) => {
  await stubChatCompletions(page)
  await openDemo(page, 'start-with-renderer')
})

test.describe('流式渲染', () => {
  test('按 OpenAI 规范发送请求', async ({ page }) => {
    await sendMessage(page, '帮我生成一个卡片')
    await expectStubbedRequestCount(page, 1)

    const [request] = await getStubbedRequests(page)
    expect(JSON.stringify(request.headers)).toContain('application/json')
    expect(request.body.stream).toBe(true)
    expect(typeof request.body.model).toBe('string')
    expect(request.body.messages).toEqual([{ role: 'user', content: '帮我生成一个卡片' }])
  })

  test('分片到达后增量渲染，最终内容完整', async ({ page }) => {
    await sendMessage(page, '生成两段文本')

    await expect(demoFrame(page).getByText('第一段')).toBeVisible()
    await expect(demoFrame(page).getByText('第二段')).toBeVisible()
  })

  test('慢速流：第一个分片先渲染，第二个分片随后追加', async ({ page }) => {
    await sendMessage(page, '[slow] 生成两段文本')

    // 第一个分片（未闭合的 JSON）已经能渲染出来 —— 证明是增量渲染而不是等流结束
    await expect(demoFrame(page).getByText('第一段')).toBeVisible()
    await expect(demoFrame(page).getByText('第二段')).toHaveCount(0)

    // 第二个分片到达后追加
    await expect(demoFrame(page).getByText('第二段')).toBeVisible()
  })

  test('流结束但没有 [DONE] 时仍能渲染已完成的分片', async ({ page }) => {
    await sendMessage(page, '[no-done] 生成两段文本')

    await expect(demoFrame(page).getByText('第一段')).toBeVisible()
    await expect(demoFrame(page).getByText('第二段')).toBeVisible()
  })

  test('后端返回 500 时页面不崩溃且保持可交互', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await sendMessage(page, '[http-500] 触发服务端错误')

    // 页面没有被破坏：输入框仍可继续使用
    await expect(demoFrame(page).locator('input[placeholder="请输入问题..."]')).toBeEnabled()
    await expect(demoFrame(page).getByRole('button', { name: '发送' })).toBeEnabled()
    await expect(demoFrame(page).getByText('第一段')).toHaveCount(0)

    // 错误被 demo 捕获并打印，而不是抛成未捕获异常
    await expect.poll(() => consoleErrors.join('\n')).toContain('请求失败')
  })

  test('非法 SSE 数据不会让页面崩溃', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await sendMessage(page, '[bad-sse] 下发非法数据')

    await expect(demoFrame(page).locator('input[placeholder="请输入问题..."]')).toBeEnabled()
    expect(pageErrors, `出现未捕获异常: ${pageErrors.join('\n')}`).toEqual([])
  })

  test('连续两次生成会替换而不是叠加旧 Schema', async ({ page }) => {
    await sendMessage(page, '第一次生成')
    await expect(demoFrame(page).getByText('第一段')).toBeVisible()

    // 等第一次的流真正结束（demo 在流结束前会忽略新的发送）
    await expectAllStubbedRequestsCompleted(page)

    await sendMessage(page, '第二次生成')
    await expectStubbedRequestCount(page, 2)
    await expect(demoFrame(page).getByText('第一段')).toBeVisible()

    // 第二次渲染的仍然是单个「第一段」而不是两份
    await expect(demoFrame(page).getByText('第一段')).toHaveCount(1)
    await expect(demoFrame(page).getByText('第二段')).toHaveCount(1)
  })
})
