import { expect, test } from '@playwright/test'
import { chatInput, demoFrame, openDemo } from './helpers/playground'

/**
 * 旧版入口兼容：GenuiLegacyConfigProvider / GenuiLegacyRenderer 不传 materials 也能渲染，
 * 以及旧版 GenuiChat API 的对话页。
 */
test.describe('旧版渲染入口', () => {
  test('不显式传 materials 也能渲染 Schema', async ({ page }) => {
    await openDemo(page, 'legacy-config-provider')
    const frame = demoFrame(page)

    await expect(frame.getByText('旧版入口直接渲染')).toBeVisible()
    await expect(frame.getByText('无需传入 materials')).toBeVisible()
    await expect(frame.getByText('仍然支持 state / methods')).toBeVisible()
  })

  test('state / methods 依然生效', async ({ page }) => {
    await openDemo(page, 'legacy-config-provider')
    const frame = demoFrame(page)

    await expect(frame.getByText('count = 0')).toBeVisible()

    await frame.getByRole('button', { name: '加一' }).click()
    await expect(frame.getByText('count = 1')).toBeVisible()

    await frame.getByRole('button', { name: '加一' }).click()
    await expect(frame.getByText('count = 2')).toBeVisible()
  })

  test('头尾插槽可以定制', async ({ page }) => {
    await openDemo(page, 'legacy-config-provider')
    const frame = demoFrame(page)

    await expect(frame.getByText('LegacyRenderer header')).toBeVisible()
    await expect(frame.getByText('LegacyRenderer footer')).toBeVisible()
  })
})

test.describe('旧版对话入口', () => {
  test('兼容旧版 Chat API 的空态与输入框', async ({ page }) => {
    await openDemo(page, 'quick-start-legacy')
    const frame = demoFrame(page)

    await expect(frame.getByText('欢迎使用生成式UI')).toBeVisible()
    await expect(chatInput(page)).toBeEnabled()
  })
})
