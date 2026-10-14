import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * 综合案例：购物车主页面 + 侧边对话助手。
 * 这里只测与 SDK 无关的购物车业务逻辑，验证渲染器和自定义组件被真实项目用起来是正常的。
 *
 * 注意：窗口宽度 ≤1440 时，.cart-item 的网格列放不下数量控件，
 * 「+」会溢出到 .cart-right 下面被遮挡（点不到），所以这里用更宽的视口。
 * 这是 demo 自身的布局问题，不是 SDK 的问题。
 */
test.use({ viewport: { width: 1920, height: 1080 } })

test.beforeEach(async ({ page }) => {
  await openDemo(page, 'integrate-to-shop')
})

test.describe('购物车集成案例', () => {
  test('初始状态购物车为空', async ({ page }) => {
    const frame = demoFrame(page)

    await expect(frame.getByText('购物车还是空的')).toBeVisible()
    await expect(frame.getByText('0 件')).toBeVisible()
    await expect(frame.getByText('合计 ¥0.00')).toBeVisible()
    await expect(frame.getByRole('button', { name: '清空' })).toBeDisabled()
  })

  test('从推荐商品加入购物车后数量与金额更新', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '加入购物车' }).first().click()

    await expect(frame.getByText('1 件')).toBeVisible()
    await expect(frame.getByText('合计 ¥199.00')).toBeVisible()
    await expect(frame.getByRole('button', { name: '清空' })).toBeEnabled()
  })

  test('数量加减会联动小计与合计', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '加入购物车' }).first().click()
    await expect(frame.getByText('合计 ¥199.00')).toBeVisible()

    await frame.locator('.qty-btn').last().click() // +
    await expect(frame.getByText('2 件')).toBeVisible()
    await expect(frame.getByText('合计 ¥398.00')).toBeVisible()

    await frame.locator('.qty-btn').first().click() // -
    await expect(frame.getByText('1 件')).toBeVisible()
    await expect(frame.getByText('合计 ¥199.00')).toBeVisible()
  })

  test('移除商品与清空购物车', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '加入购物车' }).first().click()
    await expect(frame.getByText('1 件')).toBeVisible()

    await frame.getByRole('button', { name: '移除' }).click()
    await expect(frame.getByText('购物车还是空的')).toBeVisible()

    await frame.getByRole('button', { name: '加入购物车' }).first().click()
    await expect(frame.getByText('1 件')).toBeVisible()

    await frame.getByRole('button', { name: '清空' }).click()
    await expect(frame.getByText('购物车还是空的')).toBeVisible()
  })

  test('查看按钮展示商品详情', async ({ page }) => {
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '查看' }).first().click()

    await expect(frame.getByText('已选择：轻量防水通勤双肩包')).toBeVisible()
    await frame.getByRole('button', { name: '关闭' }).click()
    await expect(frame.getByText('已选择：轻量防水通勤双肩包')).toHaveCount(0)
  })
})
