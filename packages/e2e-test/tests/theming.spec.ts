import { expect, test } from '@playwright/test'
import { demoFrame, openDemo } from './helpers/playground'

/**
 * 主题能力：materials.themeFactory 驱动的主题切换，以及宿主自定义主题变量。
 */
test.describe('主题切换', () => {
  test('物料的 themeFactory 决定可用主题', async ({ page }) => {
    await openDemo(page, 'theme-switch')
    const frame = demoFrame(page)

    const meta = frame.locator('.meta')
    await expect(meta).toContainText('已接入')
    await expect(meta).toContainText('可用主题：light / dark / lite')
  })

  test('切换主题时当前主题与根节点状态同步变化', async ({ page }) => {
    await openDemo(page, 'theme-switch')
    const frame = demoFrame(page)

    await expect(frame.locator('.meta')).toContainText('当前 theme：light')

    await frame.getByRole('button', { name: 'dark', exact: true }).click()
    await expect(frame.locator('.meta')).toContainText('当前 theme：dark')

    await frame.getByRole('button', { name: 'lite', exact: true }).click()
    await expect(frame.locator('.meta')).toContainText('当前 theme：lite')

    await frame.getByRole('button', { name: 'light', exact: true }).click()
    await expect(frame.locator('.meta')).toContainText('当前 theme：light')
  })

  test('主题下的内置组件仍然正常渲染', async ({ page }) => {
    await openDemo(page, 'theme-switch')
    const frame = demoFrame(page)

    await expect(frame.getByText('张三')).toBeVisible()
    await expect(frame.getByText('李四')).toBeVisible()
    await expect(frame.getByRole('button', { name: '主要按钮' })).toBeVisible()
    await expect(frame.getByRole('button', { name: '次要按钮' })).toBeVisible()
  })
})

test.describe('自定义主题', () => {
  test('宿主 CSS 变量覆盖渲染出来的组件样式', async ({ page }) => {
    await openDemo(page, 'custom-theme')
    const frame = demoFrame(page)

    // demo 预置了一条消息，里面用 Schema 渲染了一个主按钮
    const button = frame.getByRole('button', { name: '主要按钮' })
    await expect(button).toBeVisible()

    // #my-custom-theme .tiny-button 把主色改成了 #8b5cf6
    const styles = await button.evaluate((el) => {
      const computed = getComputedStyle(el)
      return {
        bg: computed.backgroundColor,
        radius: computed.borderRadius,
        primaryVar: getComputedStyle(el).getPropertyValue('--tv-Button-bg-color-primary').trim(),
      }
    })

    expect(styles.primaryVar).toBe('#8b5cf6')
    expect(styles.bg).toBe('rgb(139, 92, 246)')
    expect(styles.radius).toBe('16px')
  })
})
