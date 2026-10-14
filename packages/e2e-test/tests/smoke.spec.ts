import { expect, test } from '@playwright/test'
import { collectConsoleErrors } from './helpers/playground'

test.describe('Playground 冒烟', () => {
  test('首页正常加载并渲染默认 demo', async ({ page }) => {
    const console = collectConsoleErrors(page)

    await page.goto('/')

    // 品牌与侧边栏
    await expect(page.getByText('GenUI', { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Demo 列表' })).toBeVisible()

    // 默认 demo 是 start-with-renderer
    await expect(page.getByRole('heading', { name: 'Start with Renderer' })).toBeVisible()

    // 默认 demo 的静态 schema 已经渲染出真实组件
    await expect(page.locator('.demo-frame .tiny-select').first()).toBeVisible()

    console.stop()
    expect(console.errors, `页面加载出现控制台错误:\n${console.errors.join('\n')}`).toEqual([])
  })

  test('侧边栏列出全部 demo 且包含 1.4.0 新增 demo', async ({ page }) => {
    await page.goto('/')

    const demoLinks = page.locator('.demo-link')
    await expect(demoLinks.first()).toBeVisible()

    const count = await demoLinks.count()
    expect(count, 'demo 列表数量异常').toBeGreaterThanOrEqual(20)

    // 1.4.0 新增 demo 必须出现在列表里
    for (const title of [
      'Plus Materials',
      'Theme Switch',
      'Merge Materials',
      'Code Generator',
      'Notify',
      'Legacy Config Provider',
    ]) {
      await expect(page.getByRole('button', { name: new RegExp(title) })).toBeVisible()
    }
  })

  test('侧边栏搜索可以过滤 demo', async ({ page }) => {
    await page.goto('/')

    const search = page.getByPlaceholder('搜索 demo')
    await search.fill('theme')

    await expect(page.getByRole('button', { name: /Theme Switch/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Plus Materials/ })).toHaveCount(0)

    await search.fill('不存在的关键字')
    await expect(page.getByText('没有找到匹配的 demo')).toBeVisible()
  })

  test('hash 路由可以直接打开指定 demo', async ({ page }) => {
    await page.goto('/#/demos/notify')

    await expect(page.getByRole('heading', { name: 'Notify' })).toBeVisible()
    await expect(page.locator('.demo-frame')).toContainText('触发渲染器内部提示')
  })

  test('未知 demo id 回退到默认 demo 而不是白屏', async ({ page }) => {
    await page.goto('/#/demos/this-demo-does-not-exist')

    await expect(page.getByRole('heading', { name: 'Start with Renderer' })).toBeVisible()
    await expect(page.locator('.demo-frame')).not.toBeEmpty()
  })
})
