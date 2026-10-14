import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * 物料（materials）相关能力：
 * 档位（Mini / Standard / Plus）、渲染前后动态注入、响应式更新、多物料源合并。
 */
test.describe('物料档位', () => {
  test('Plus 档包含 Steps / Collapse 等扩展组件', async ({ page }) => {
    await openDemo(page, 'plus-materials')
    const frame = demoFrame(page)

    await expect(frame.locator('.meta')).toContainText('当前物料：54 个组件 · 白名单：63 项')

    // TinySteps：四个业务步骤
    for (const step of ['创建订单', '风控审核', '出库发货', '确认收货']) {
      await expect(frame.getByText(step, { exact: true })).toBeVisible()
    }

    // TinyCollapse：折叠面板
    await expect(frame.getByText('为什么新增 Plus 物料？')).toBeVisible()
  })

  test('Steps 步骤条可以前后切换', async ({ page }) => {
    await openDemo(page, 'plus-materials')
    const frame = demoFrame(page)

    await expect(frame.locator('.meta')).toContainText('当前步骤：1 / 4')

    await frame.getByRole('button', { name: '下一步' }).click()
    await expect(frame.locator('.meta')).toContainText('当前步骤：2 / 4')

    await frame.getByRole('button', { name: '上一步' }).click()
    await expect(frame.locator('.meta')).toContainText('当前步骤：1 / 4')
  })
})

test.describe('物料延后注入', () => {
  test('先来 Schema 后注入物料，已渲染的内容会补上物料组件', async ({ page }) => {
    await openDemo(page, 'change-materials')
    const frame = demoFrame(page)

    // 初始：没有物料、没有 Schema
    await expect(frame.locator('.meta')).toContainText('materials: 无 · cards: 0')
    await expect(frame.getByText('还没有 schema，按上方步骤操作')).toBeVisible()

    // 1. 无物料时先插入 Schema：内置标签（div）能渲染，物料组件（TinyButton）不能
    await frame.getByRole('button', { name: '1. 添加早期 schema（无 materials）' }).click()
    await expect(frame.locator('.meta')).toContainText('materials: 无 · cards: 1')
    await expect(frame.getByText('div content')).toHaveCount(1)
    await expect(frame.getByRole('button', { name: 'TinyButton' })).toHaveCount(0)

    // 2. 再注入物料：已经挂在页面上的这张卡片会补渲染出 TinyButton
    await frame.getByRole('button', { name: '2. 设置 materials' }).click()
    await expect(frame.locator('.meta')).toContainText('materials: 已设置 · cards: 1')
    await expect(frame.getByText('div content')).toHaveCount(1)
    await expect(frame.getByRole('button', { name: 'TinyButton' })).toHaveCount(1)

    // 3. 有新物料后再来一份 Schema
    await frame.getByRole('button', { name: '3. 添加新 schema（有 materials）' }).click()
    await expect(frame.locator('.meta')).toContainText('materials: 已设置 · cards: 2')
    await expect(frame.getByText('div content')).toHaveCount(2)
    await expect(frame.getByRole('button', { name: 'TinyButton' })).toHaveCount(2)

    // 重置
    await frame.getByRole('button', { name: '重置' }).click()
    await expect(frame.locator('.meta')).toContainText('materials: 无 · cards: 0')
  })

  test('按钮的可用状态跟随物料是否已注入', async ({ page }) => {
    await openDemo(page, 'change-materials')
    const frame = demoFrame(page)

    await expect(frame.getByRole('button', { name: '2. 设置 materials' })).toBeEnabled()
    await expect(frame.getByRole('button', { name: '3. 添加新 schema（有 materials）' })).toBeDisabled()

    await frame.getByRole('button', { name: '2. 设置 materials' }).click()

    await expect(frame.getByRole('button', { name: '2. 设置 materials' })).toBeDisabled()
    await expect(frame.getByRole('button', { name: '3. 添加新 schema（有 materials）' })).toBeEnabled()
  })
})

test.describe('物料响应式更新', () => {
  test('切换物料后 demo 自身的状态同步更新', async ({ page }) => {
    await openDemo(page, 'materials-reactive')
    const frame = demoFrame(page)

    await expect(frame.locator('.meta')).toContainText('模式: 整对象替换 · 当前: A · 已切换 0 次')

    await frame.getByRole('button', { name: '替换为 B（蓝色）' }).click()
    await expect(frame.locator('.meta')).toContainText('模式: 整对象替换 · 当前: B · 已切换 1 次')

    await frame.getByRole('button', { name: '修改 components → B（蓝色）' }).click()
    await expect(frame.locator('.meta')).toContainText('模式: 改 components · 当前: B · 已切换 2 次')
  })

  // 已知问题（beta.1）：materials 从「有」换成「另一个」时，已经挂载的 GenuiRenderer
  // 不会重新解析组件，画面上仍然是旧物料渲染出来的 [A]。demo 代码本身是对的
  // （switchByReplace 确实替换了整个 ref 对象），所以问题在渲染器侧。
  // 用 test.fails 记录：上游修好后这条会因为「预期失败却通过」而报错，提醒去掉标记。
  test.fail('替换整个 materials 对象后，已渲染的组件跟着切换（已知问题）', async ({ page }) => {
    await openDemo(page, 'materials-reactive')
    const frame = demoFrame(page)

    await expect(frame.getByText('[A] materials 动态切换测试')).toBeVisible()

    await frame.getByRole('button', { name: '替换为 B（蓝色）' }).click()

    await expect(frame.getByText('[B] materials 动态切换测试')).toBeVisible()
    await expect(frame.getByText('[A] materials 动态切换测试')).toHaveCount(0)
  })

  test.fail('修改 materials.components 后，已渲染的组件跟着切换（已知问题）', async ({ page }) => {
    await openDemo(page, 'materials-reactive')
    const frame = demoFrame(page)

    await expect(frame.getByText('[A] materials 动态切换测试')).toBeVisible()

    await frame.getByRole('button', { name: '修改 components → B（蓝色）' }).click()

    await expect(frame.getByText('[B] materials 动态切换测试')).toBeVisible()
    await expect(frame.getByText('[A] materials 动态切换测试')).toHaveCount(0)
  })
})

test.describe('物料合并', () => {
  test('默认合并自定义物料：组件数与补全选择器都增加', async ({ page }) => {
    await openDemo(page, 'merge-materials')
    const frame = demoFrame(page)

    // 基础物料 54 个组件 / 6 项选择器，合并自定义物料（DemoBanner + 1 项选择器）后各 +1
    await expect(frame.locator('.meta')).toContainText('组件数：55 · 补全选择器：7 项 · themeFactory：1 个')
    await expect(frame.getByText('合并后的自定义组件')).toBeVisible()
    await expect(frame.getByText('来自第二个物料源')).toBeVisible()
    // 基础物料的组件依然在
    await expect(frame.getByText('我来自基础物料')).toBeVisible()
  })

  test('仅基础物料时组件数与补全选择器回落到基础值', async ({ page }) => {
    await openDemo(page, 'merge-materials')
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '仅基础物料' }).click()

    await expect(frame.locator('.meta')).toContainText('组件数：54 · 补全选择器：6 项 · themeFactory：1 个')
    await expect(frame.getByText('我来自基础物料')).toBeVisible()
  })

  test('覆盖同名组件时组件数回落到基础值', async ({ page }) => {
    await openDemo(page, 'merge-materials')
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '覆盖同名组件' }).click()

    // override 只替换 TinyCard，不新增组件，所以组件数回落到基础物料的 54
    await expect(frame.locator('.meta')).toContainText('组件数：54 · 补全选择器：6 项 · themeFactory：1 个')
  })

  // 与上面 materials-reactive 同源的问题：合并结果对象换了，但已挂载的渲染器没跟着换。
  test.fail('切成仅基础物料后，自定义组件从画面上消失（已知问题）', async ({ page }) => {
    await openDemo(page, 'merge-materials')
    const frame = demoFrame(page)

    await expect(frame.getByText('合并后的自定义组件')).toBeVisible()

    await frame.getByRole('button', { name: '仅基础物料' }).click()

    await expect(frame.getByText('合并后的自定义组件')).toHaveCount(0)
  })
})
