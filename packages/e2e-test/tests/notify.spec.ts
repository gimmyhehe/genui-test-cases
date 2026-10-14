import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * notify：渲染器内部产生的提示（JSFunction 执行报错等）转发给宿主注入的处理器，
 * 不传则回退到内置的 DOM toast。
 */
test.beforeEach(async ({ page }) => {
  await openDemo(page, 'notify')
})

test.describe('渲染器提示转发', () => {
  test('默认使用自定义 notify，初始没有提示', async ({ page }) => {
    const frame = demoFrame(page)

    await expect(frame.getByText('已捕获 0 条提示 · 当前：自定义')).toBeVisible()
    await expect(frame.locator('.toast-stack .toast')).toHaveCount(0)
  })

  test('同步错误会转发给自定义处理器', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '同步错误' }).click()

    await expect(frame.locator('.toast-stack .toast').first()).toContainText('这是一个同步错误示例')
  })

  test('异步错误会转发给自定义处理器', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '异步错误' }).click()

    await expect(frame.locator('.toast-stack .toast').first()).toContainText('这是一个异步错误示例')
  })

  test('调用不存在的方法也会触发提示', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '调用不存在的方法' }).click()

    await expect(frame.locator('.toast-stack .toast').first()).toBeVisible()
  })

  test('切到内置 notify 后提示不再进入宿主的收集列表', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '使用内置 notify' }).click()
    await expect(frame.getByText('已捕获 0 条提示 · 当前：内置')).toBeVisible()

    await frame.getByRole('button', { name: '同步错误' }).click()

    // 内置 toast 由渲染器自己渲染，宿主这边始终是 0 条
    await expect(frame.getByText('这是一个同步错误示例')).toHaveCount(0)
    await expect(frame.getByText('已捕获 0 条提示 · 当前：内置')).toBeVisible()
  })
})
