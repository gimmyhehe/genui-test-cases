import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * 代码生成：把 Schema 反向生成可运行的 Vue SFC，并做编译校验。
 */
test.describe('代码生成', () => {
  test('初始状态为待生成，代码区给出提示', async ({ page }) => {
    await openDemo(page, 'code-generator')
    const frame = demoFrame(page)

    await expect(frame.locator('.meta')).toContainText('状态：待生成 · 文件名：- · 错误：0')
    await expect(frame.getByText('点击上方「生成代码」查看结果')).toBeVisible()
    await expect(frame.getByRole('button', { name: '复制代码' })).toBeDisabled()
  })

  test('生成的 Vue SFC 能通过编译校验且没有错误', async ({ page }) => {
    await openDemo(page, 'code-generator')
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '生成代码' }).click()

    const meta = frame.locator('.meta')
    await expect(meta).toContainText('文件名：EmployeeForm.vue')
    await expect(meta).toContainText('错误：0')

    const generated = await frame.locator('.pane').nth(1).innerText()
    expect(generated).toContain('<template>')
    expect(generated).toContain('员工入职登记')
    expect(generated).toContain('tiny-form')

    await expect(frame.getByRole('button', { name: '复制代码' })).toBeEnabled()
  })

  test('重置后回到待生成状态', async ({ page }) => {
    await openDemo(page, 'code-generator')
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '生成代码' }).click()
    await expect(frame.locator('.meta')).toContainText('文件名：EmployeeForm.vue')

    await frame.getByRole('button', { name: '重置' }).click()

    await expect(frame.locator('.meta')).toContainText('状态：待生成 · 文件名：- · 错误：0')
    await expect(frame.getByText('点击上方「生成代码」查看结果')).toBeVisible()
    await expect(frame.getByRole('button', { name: '复制代码' })).toBeDisabled()
  })
})
