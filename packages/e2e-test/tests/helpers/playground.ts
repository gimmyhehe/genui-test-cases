import type { Page } from '@playwright/test'

/** 不依赖网络的 demo，可以用来断言「控制台零错误」。 */
export const OFFLINE_SAFE_DEMO_IDS = [
  'start-with-renderer',
  'diff-test',
  'change-materials',
  'materials-reactive',
  'plus-materials',
  'theme-switch',
  'merge-materials',
  'code-generator',
  'notify',
  'legacy-config-provider',
] as const

export interface ConsoleCollector {
  errors: string[]
  stop: () => void
}

/** 收集页面 console.error 与未捕获异常。 */
export function collectConsoleErrors(page: Page): ConsoleCollector {
  const errors: string[] = []

  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() === 'error') errors.push(message.text())
  }
  const onPageError = (error: Error) => errors.push(error.message)

  page.on('console', onConsole as any)
  page.on('pageerror', onPageError)

  return {
    errors,
    stop: () => {
      page.off('console', onConsole as any)
      page.off('pageerror', onPageError)
    },
  }
}

/** 打开指定 demo（playground 使用 hash 路由）。 */
export async function openDemo(page: Page, demoId: string): Promise<void> {
  await page.goto(`/#/demos/${demoId}`)
  await page.locator('.demo-frame').waitFor({ state: 'visible' })
}

/** 在 start-with-renderer 中发送一条消息。 */
export async function sendMessage(page: Page, text: string): Promise<void> {
  await page.getByPlaceholder('请输入问题...').fill(text)
  await page.getByRole('button', { name: '发送' }).click()
}
