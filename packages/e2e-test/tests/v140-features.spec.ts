import { expect, test } from '@playwright/test'
import { collectConsoleErrors, openDemo } from './helpers/playground'

/**
 * 针对 1.4.0 新增能力的端到端验收。
 * 这些 demo 都是静态 Schema，不依赖后端，因此可以在 CI 里稳定运行。
 */
test.describe('1.4.0 新增能力', () => {
  test('Plus 物料档：步骤条渲染 + 状态联动', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'plus-materials')

    const meta = page.locator('.meta')
    await expect(meta).toContainText(/当前物料：\s*\d+ 个组件/)
    await expect(meta).toContainText(/白名单：\s*\d+ 项/)
    await expect(meta).toContainText(/当前步骤：\s*1\s*\/\s*4/)

    // Plus 档新增的 TinySteps 真实渲染出步骤内容
    await expect(page.locator('.demo-frame')).toContainText('创建订单')
    await expect(page.locator('.demo-frame')).toContainText('风控审核')

    await page.getByRole('button', { name: '下一步' }).click()
    await expect(meta).toContainText(/当前步骤：\s*2\s*\/\s*4/)

    await page.getByRole('button', { name: '上一步' }).click()
    await expect(meta).toContainText(/当前步骤：\s*1\s*\/\s*4/)

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })

  test('主题系统：themeFactory 声明 light/dark/lite 且可切换', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'theme-switch')

    const meta = page.locator('.meta')
    await expect(meta).toContainText(/themeFactory：\s*已接入/)
    await expect(meta).toContainText(/可用主题：\s*light \/ dark \/ lite/)
    await expect(meta).toContainText(/当前 theme：\s*light/)

    // 渲染器在主题容器内正常渲染
    await expect(page.locator('.demo-frame')).toContainText('主题预览')

    await page.getByRole('button', { name: 'dark', exact: true }).click()
    await expect(meta).toContainText(/当前 theme：\s*dark/)
    await expect(page.locator('.demo-frame')).toContainText('主题预览')

    await page.getByRole('button', { name: 'lite', exact: true }).click()
    await expect(meta).toContainText(/当前 theme：\s*lite/)

    await page.getByRole('button', { name: 'auto', exact: true }).click()
    await expect(meta).toContainText(/当前 theme：\s*auto/)

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })

  test('mergeMaterials：合并 / 覆盖语义在页面上生效', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'merge-materials')

    const meta = page.locator('.meta')
    const frame = page.locator('.demo-frame')

    // 默认 preset = merged：基础物料（6 个补全选择器）+ 自定义物料（1 个）
    await expect(meta).toContainText(/组件数：\s*55/)
    await expect(meta).toContainText(/补全选择器：\s*7 项/)
    await expect(meta).toContainText(/themeFactory：\s*1 个/)
    await expect(frame).toContainText('合并后的自定义组件')

    // 仅基础物料：自定义组件消失，数量回落
    await page.getByRole('button', { name: '仅基础物料' }).click()
    await expect(meta).toContainText(/组件数：\s*54/)
    await expect(meta).toContainText(/补全选择器：\s*6 项/)

    // 覆盖同名组件：数量不变（TinyCard 被替换）
    await page.getByRole('button', { name: '覆盖同名组件' }).click()
    await expect(meta).toContainText(/组件数：\s*54/)
    await expect(frame).toContainText('合并后的自定义组件')

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })

  test('code-generator：Schema 反向生成可用的 Vue SFC', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'code-generator')

    const meta = page.locator('.meta')
    await expect(meta).toContainText(/状态：\s*待生成/)

    await page.getByRole('button', { name: '生成代码' }).click()

    await expect(meta).toContainText(/状态：\s*生成成功/)
    await expect(meta).toContainText(/错误：\s*0/)

    const generated = page.locator('.pane').nth(1).locator('pre.code')
    await expect(generated).toContainText('<template>')
    await expect(generated).toContainText('TinyCard')

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })

  test('notify：渲染器内部错误会转发给自定义处理器', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'notify')

    const meta = page.locator('.meta')
    await expect(meta).toContainText(/已捕获\s*0\s*条提示/)
    await expect(meta).toContainText(/当前：\s*自定义/)

    await page.getByRole('button', { name: '同步错误' }).click()
    await expect(meta).toContainText(/已捕获\s*1\s*条提示/)
    await expect(page.locator('.toast-stack .toast').first()).toContainText('这是一个同步错误示例')

    await page.getByRole('button', { name: '异步错误' }).click()
    await expect(meta).toContainText(/已捕获\s*2\s*条提示/)

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })

  test('legacy-config-provider：不传 materials 也能渲染，且插槽生效', async ({ page }) => {
    const console = collectConsoleErrors(page)
    await openDemo(page, 'legacy-config-provider')

    const frame = page.locator('.demo-frame')
    await expect(frame).toContainText('旧版入口直接渲染')
    await expect(frame).toContainText('无需传入 materials')
    await expect(frame).toContainText('LegacyRenderer header')
    await expect(frame).toContainText('LegacyRenderer footer')
    await expect(frame).toContainText('count = 0')

    // state / methods 在 legacy 入口下依然可用
    await page.getByRole('button', { name: '加一' }).click()
    await expect(frame).toContainText('count = 1')

    console.stop()
    expect(console.errors, console.errors.join('\n')).toEqual([])
  })
})
