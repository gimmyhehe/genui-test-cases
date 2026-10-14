import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * 渲染器核心能力：Schema 更新（Diff）、非 Vue 环境下的 Web Component 渲染。
 */
test.describe('渲染器', () => {
  test('切换 Schema 后渲染结果保持一致且不报错', async ({ page }) => {
    await openDemo(page, 'diff-test')
    const frame = demoFrame(page)

    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    // 第一份 Schema：员工信息表
    await expect(frame.getByText('员工信息表')).toBeVisible()
    await expect(frame.getByText('张三')).toBeVisible()
    await expect(frame.getByText('王五')).toBeVisible()

    // 切换到第二份 Schema：表格数据保持完整
    await frame.getByRole('button', { name: '改变' }).click()
    await expect(frame.getByText('员工信息表')).toBeVisible()
    await expect(frame.getByText('赵六')).toBeVisible()
    await expect(frame.getByText('钱七')).toBeVisible()

    // 再切回第一份 Schema
    await frame.getByRole('button', { name: '改变' }).click()
    await expect(frame.getByText('张三')).toBeVisible()
    expect(pageErrors, `切换 Schema 时出现未捕获异常: ${pageErrors.join('\n')}`).toEqual([])
  })

  test('Web Component 形式把 Schema 渲染到 Shadow DOM', async ({ page }) => {
    await openDemo(page, 'start-with-web-component')
    const frame = demoFrame(page)

    // <genui-renderer> 内部使用 Shadow DOM，Playwright 的定位器可以直接穿透
    await expect(frame.locator('genui-renderer')).toBeAttached()
    await expect(frame.getByText('用户信息登记表')).toBeVisible()
    await expect(frame.getByText('姓名')).toBeVisible()
    await expect(frame.getByText('电子邮箱')).toBeVisible()
    await expect(frame.getByText('所属部门')).toBeVisible()
    await expect(frame.getByRole('button', { name: '提交表单' })).toBeVisible()
    await expect(frame.getByRole('button', { name: '重置' })).toBeVisible()
  })

  test('Web Component 内部的表单控件可以输入', async ({ page }) => {
    await openDemo(page, 'start-with-web-component')
    const frame = demoFrame(page)

    const inputs = frame.locator('input.tiny-input__inner')
    await expect(inputs).toHaveCount(3)

    await inputs.first().fill('张三')
    await expect(inputs.first()).toHaveValue('张三')

    await inputs.nth(1).fill('zhangsan@example.com')
    await expect(inputs.nth(1)).toHaveValue('zhangsan@example.com')
  })
})
