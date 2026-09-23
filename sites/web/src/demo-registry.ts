import { defineAsyncComponent, markRaw, type Component } from 'vue';

export type DemoCategory = '基础入门' | '渲染器' | '聊天与数据' | '高级能力' | '综合案例';

export interface DemoDefinition {
  id: string;
  title: string;
  description: string;
  category: DemoCategory;
  component: Component;
}

const loadDemo = (loader: () => Promise<unknown>) =>
  markRaw(defineAsyncComponent(loader as () => Promise<{ default: Component }>));

export const demoRegistry: DemoDefinition[] = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    description: '使用 GenuiChat 快速接入生成式 UI。',
    category: '基础入门',
    component: loadDemo(() => import('./quick-start/App.vue')),
  },
  {
    id: 'quick-start-legacy',
    title: 'Quick Start Legacy',
    description: '兼容旧版 Chat API，并展示自定义 Schema footer。',
    category: '基础入门',
    component: loadDemo(() => import('./quick-start-legacy/App.vue')),
  },
  {
    id: 'start-with-renderer',
    title: 'Start with Renderer',
    description: '从 Schema 渲染器开始，支持流式生成和交互。',
    category: '渲染器',
    component: loadDemo(() => import('./start-with-renderer/App.vue')),
  },
  {
    id: 'start-with-web-component',
    title: 'Start with Web Component',
    description: '在非 Vue 场景中使用 GenUI Web Component。',
    category: '渲染器',
    component: loadDemo(() => import('./start-with-web-component/App.vue')),
  },
  {
    id: 'diff-test',
    title: 'Schema Diff',
    description: '切换 Schema，观察渲染器的更新行为。',
    category: '渲染器',
    component: loadDemo(() => import('./diff-test/App.vue')),
  },
  {
    id: 'change-materials',
    title: 'Change Materials',
    description: '演示渲染前后动态注入 materials。',
    category: '渲染器',
    component: loadDemo(() => import('./change-materials/App.vue')),
  },
  {
    id: 'materials-reactive',
    title: 'Reactive Materials',
    description: '演示替换和 patch materials 时的响应式更新。',
    category: '渲染器',
    component: loadDemo(() => import('./materials-reactive/App.vue')),
  },
  {
    id: 'start-with-tinyrobot',
    title: 'Start with TinyRobot',
    description: '将 TinyRobot 对话体验与 GenUI Renderer 组合。',
    category: '聊天与数据',
    component: loadDemo(() => import('./start-with-tinyrobot/App.vue')),
  },
  {
    id: 'tinyrobot-with-element',
    title: 'TinyRobot + Element Plus',
    description: '使用 Element Plus materials 的 TinyRobot 示例。',
    category: '聊天与数据',
    component: loadDemo(() => import('./tinyrobot-with-element/App.vue')),
  },
  {
    id: 'custom-example',
    title: 'Custom Examples',
    description: '向 GenuiChat 注入可复用的自定义示例。',
    category: '聊天与数据',
    component: loadDemo(() => import('./custom-example/App.vue')),
  },
  {
    id: 'custom-components',
    title: 'Custom Components',
    description: '注册 UserProfile、ProductCard 等自定义组件。',
    category: '聊天与数据',
    component: loadDemo(() => import('./custom-components/App.vue')),
  },
  {
    id: 'custom-fetch',
    title: 'Custom Fetch',
    description: '接管请求过程，增加自定义请求参数和上下文。',
    category: '聊天与数据',
    component: loadDemo(() => import('./custom-fetch/App.vue')),
  },
  {
    id: 'ai-sdk-custom-fetch',
    title: 'AI SDK Custom Fetch',
    description: '通过 AI SDK 适配 OpenAI-compatible 服务。',
    category: '高级能力',
    component: loadDemo(() => import('./ai-sdk-custom-fetch/App.vue')),
  },
  {
    id: 'mcp-fetch',
    title: 'MCP Fetch',
    description: '使用 MCP client、server 和 replay fetch 串联工具调用。',
    category: '高级能力',
    component: loadDemo(() => import('./mcp-fetch/App.vue')),
  },
  {
    id: 'upload-image',
    title: 'Upload Image',
    description: '开启图片能力，体验多模态 GenUI 对话。',
    category: '高级能力',
    component: loadDemo(() => import('./upload-image/App.vue')),
  },
  {
    id: 'custom-theme',
    title: 'Custom Theme',
    description: '通过主题变量定制 Chat、Bubble 和 Button 的视觉风格。',
    category: '高级能力',
    component: loadDemo(() => import('./custom-theme/App.vue')),
  },
  {
    id: 'integrate-to-shop',
    title: 'Integrate to Shop',
    description: '完整的购物车和 AI 助手组合案例。',
    category: '综合案例',
    component: loadDemo(() => import('./Integrate-to-shop/App.vue')),
  },
];

export const demoCategories: DemoCategory[] = [
  '基础入门',
  '渲染器',
  '聊天与数据',
  '高级能力',
  '综合案例',
];

export const defaultDemoId = 'start-with-renderer';

export const findDemo = (id: string | null | undefined) =>
  demoRegistry.find((demo) => demo.id === id) ?? demoRegistry.find((demo) => demo.id === defaultDemoId)!;
