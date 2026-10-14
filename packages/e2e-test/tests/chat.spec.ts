import { expect, test } from '@playwright/test'
import { stubChatCompletions } from './helpers/llm-stub'
import { chatInput, demoFrame, openDemo, sendChatMessage } from './helpers/playground'

/**
 * 对话相关能力：GenuiChat 空态与流式渲染、自定义组件注册、TinyRobot 组合、图片上传。
 */
test.describe('GenuiChat 对话', () => {
  test('空态插槽与输入框可用', async ({ page }) => {
    await openDemo(page, 'quick-start')
    const frame = demoFrame(page)

    await expect(frame.getByText('欢迎使用生成式UI')).toBeVisible()
    await expect(chatInput(page)).toBeEnabled()
  })

  test('对话返回的 SSE 分片能渲染成 Schema', async ({ page }) => {
    await stubChatCompletions(page)
    await openDemo(page, 'quick-start')
    const frame = demoFrame(page)

    await sendChatMessage(page, '生成两段文本')

    await expect(frame.getByText('第一段')).toBeVisible()
    await expect(frame.getByText('第二段')).toBeVisible()
  })
})

test.describe('自定义组件', () => {
  test('注册的自定义组件在历史消息里正常渲染', async ({ page }) => {
    await openDemo(page, 'custom-components')
    const frame = demoFrame(page)

    // 预置消息里的 schema-card 使用了自定义组件 ProductCard
    await expect(frame.getByText('轻量防水通勤双肩包')).toBeVisible()
    await expect(frame.getByText('¥199.00')).toBeVisible()
    await expect(frame.getByText('通勤', { exact: true })).toBeVisible()
    await expect(frame.getByRole('button', { name: '加入购物车' })).toBeVisible()

    // 工具调用消息按名字展示
    await expect(frame.getByText('推荐一个双肩包')).toBeVisible()
  })

  test('自定义组件的交互事件仍然可用', async ({ page }) => {
    await openDemo(page, 'custom-components')
    const frame = demoFrame(page)

    await frame.getByRole('button', { name: '查看' }).click()
    // 点击后不应产生未捕获异常，页面保持可用
    await expect(frame.getByRole('button', { name: '加入购物车' })).toBeEnabled()
  })
})

test.describe('TinyRobot 组合', () => {
  test('TinyRobot 输入区与 GenUI 渲染器共存', async ({ page }) => {
    await openDemo(page, 'start-with-tinyrobot')
    const frame = demoFrame(page)

    await expect(chatInput(page, '请输入消息')).toBeEnabled()
    // TinyRobot 的发送区 + 消息列表容器
    await expect(frame.locator('.sender-container')).toBeAttached()
    await expect(frame.locator('.messages-container')).toBeAttached()
  })
})

test.describe('图片上传能力', () => {
  test('开启 supportImage 后发送区出现上传入口', async ({ page }) => {
    await openDemo(page, 'upload-image')
    const frame = demoFrame(page)

    await expect(chatInput(page)).toBeEnabled()

    const actions = frame.locator('.action-buttons__button')
    await expect(actions.first()).toBeVisible()
  })

  test('点击上传入口会打开文件选择器', async ({ page }) => {
    await openDemo(page, 'upload-image')
    const frame = demoFrame(page)

    const actions = frame.locator('.action-buttons__button')
    const count = await actions.count()
    expect(count).toBeGreaterThan(0)

    // 逐个尝试，找到真正的图片上传按钮
    let opened = false
    for (let i = 0; i < count && !opened; i += 1) {
      const chooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null)
      await actions.nth(i).click()
      opened = (await chooserPromise) !== null
    }

    expect(opened, '发送区的按钮中没有找到会打开文件选择器的上传入口').toBe(true)
  })
})
