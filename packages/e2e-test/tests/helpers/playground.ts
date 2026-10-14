import type { Locator, Page } from '@playwright/test'

/**
 * 不依赖网络（不会真的去调大模型）的 demo，可以用来断言「控制台零错误」。
 * 其余 demo 会向真实后端发请求，未配置后端时失败属于预期，不计入控制台断言。
 */
export const OFFLINE_SAFE_DEMO_IDS = [
  'start-with-renderer',
  'start-with-web-component',
  'diff-test',
  'change-materials',
  'materials-reactive',
  'plus-materials',
  'theme-switch',
  'merge-materials',
  'code-generator',
  'notify',
  'legacy-config-provider',
  'custom-components',
  'custom-theme',
  'integrate-to-shop',
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

/**
 * demo 的渲染区域。
 * 所有断言都应该限定在这个容器里 —— 左侧导航栏会渲染全部 demo 的标题和描述，
 * 不限定范围会误命中导航文案。
 */
export function demoFrame(page: Page): Locator {
  return page.locator('.demo-frame')
}

/** 打开指定 demo（playground 使用 hash 路由）。 */
export async function openDemo(page: Page, demoId: string): Promise<void> {
  await page.goto(`/#/demos/${demoId}`)
  const frame = demoFrame(page)
  await frame.waitFor({ state: 'visible' })

  // demo 组件是懒加载的：.demo-frame 先出现，此时里面还是「正在载入 xxx…」占位符。
  // 必须等占位符消失、动态 import 完成，否则断言会打在 loading 状态上。
  await frame.locator('.loading-state').waitFor({ state: 'hidden' }).catch(() => {})
  await page.waitForLoadState('networkidle').catch(() => {})
  // 动态 import 解析完成和 Vue 真正挂载之间还差一次渲染，等两帧再交给断言
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))),
  )
}

/**
 * GenuiChat / TinySender 的输入框。
 * 不能用 getByPlaceholder：TinyInput 会在真实 input 之外再渲染一个带同样
 * placeholder 属性的展示层 div，getByPlaceholder 会因为匹配到 2 个元素而报错。
 */
export function chatInput(page: Page, placeholder = '请输入您的问题～'): Locator {
  return demoFrame(page).locator(`input[placeholder="${placeholder}"]`)
}

/** 在 start-with-renderer / start-with-web-component 中发送一条消息。 */
export async function sendMessage(page: Page, text: string): Promise<void> {
  const frame = demoFrame(page)
  await frame.locator('input[placeholder="请输入问题..."]').fill(text)
  await frame.getByRole('button', { name: '发送' }).click()
}

/** 在 GenuiChat 系列 demo 中发送一条消息（发送区没有按钮，回车即发送）。 */
export async function sendChatMessage(page: Page, text: string): Promise<void> {
  const input = chatInput(page)
  await input.fill(text)
  await input.press('Enter')
}
