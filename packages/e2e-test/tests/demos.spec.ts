import { expect, test } from '@playwright/test'
import { collectConsoleErrors, OFFLINE_SAFE_DEMO_IDS, openDemo } from './helpers/playground'

/**
 * demo-registry.ts 的全部 demo id。聊天类 demo 在 e2e 环境里没有后端，
 * 因此这里只断言「能打开、不白屏」，不把关网络请求。
 */
const ALL_DEMO_IDS = [
  'quick-start',
  'quick-start-legacy',
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
  'start-with-tinyrobot',
  'tinyrobot-with-element',
  'custom-example',
  'custom-components',
  'custom-fetch',
  'ai-sdk-custom-fetch',
  'mcp-fetch',
  'upload-image',
  'custom-theme',
  'integrate-to-shop',
] as const

test.describe('全部 demo 可加载', () => {
  for (const demoId of ALL_DEMO_IDS) {
    test(`demo「${demoId}」可以打开且不白屏`, async ({ page }) => {
      await openDemo(page, demoId)

      // 面包屑与标题跟随路由
      await expect(page.locator('.breadcrumb-current')).not.toBeEmpty()

      // demo 区域必须渲染出内容。
      // 不能只看文字：TinyRobot 这类 demo 初始只有输入框、没有文字。
      await expect
        .poll(
          () =>
            page.locator('.demo-frame').evaluate((el) => {
              const text = (el.textContent || '').trim()
              const controls = el.querySelectorAll('input,textarea,button,select,svg,canvas').length
              return text.length + controls
            }),
          { message: `${demoId} 的 demo 区域是空的（白屏）` },
        )
        .toBeGreaterThan(0)
    })
  }
})

test.describe('离线 demo 控制台无错误', () => {
  for (const demoId of OFFLINE_SAFE_DEMO_IDS) {
    test(`demo「${demoId}」不产生控制台错误`, async ({ page }) => {
      const console = collectConsoleErrors(page)

      await openDemo(page, demoId)
      await page.waitForTimeout(500)

      console.stop()
      expect(console.errors, `${demoId} 产生控制台错误:\n${console.errors.join('\n')}`).toEqual([])
    })
  }
})
