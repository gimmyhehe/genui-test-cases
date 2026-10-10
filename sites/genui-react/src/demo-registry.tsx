import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type DemoCategory = '基础入门' | '渲染器' | '数据与交互' | '高级能力' | '综合案例';

export interface DemoDefinition {
  id: string;
  title: string;
  description: string;
  category: DemoCategory;
  component: LazyExoticComponent<ComponentType>;
}

export const demoCategories: DemoCategory[] = ['基础入门', '渲染器', '数据与交互', '高级能力', '综合案例'];

export const demoRegistry: DemoDefinition[] = [
  {
    id: 'start-with-renderer',
    title: 'Start with Renderer',
    description: '用静态 Schema 渲染 antd 组件，支持 state / methods / JSExpression。',
    category: '基础入门',
    component: lazy(() => import('./demos/start-with-renderer/App')),
  },
  {
    id: 'streaming-generate',
    title: 'Streaming Generate',
    description: '通过 PatternExtractor 解析流式响应，边生成边渲染。',
    category: '基础入门',
    component: lazy(() => import('./demos/streaming-generate/App')),
  },
  {
    id: 'schema-diff',
    title: 'Schema Diff',
    description: '切换 Schema，观察 DeltaPatcher 的增量更新行为。',
    category: '渲染器',
    component: lazy(() => import('./demos/schema-diff/App')),
  },
  {
    id: 'change-materials',
    title: 'Change Materials',
    description: '先来 Schema 后注入 materials，验证延后绑定。',
    category: '渲染器',
    component: lazy(() => import('./demos/change-materials/App')),
  },
  {
    id: 'reactive-materials',
    title: 'Reactive Materials',
    description: '整对象替换 / 只改 components 两种动态切换方式。',
    category: '渲染器',
    component: lazy(() => import('./demos/reactive-materials/App')),
  },
  {
    id: 'required-field-selectors',
    title: 'Required Field Selectors',
    description: '通过 requiredCompleteFieldSelectors 控制流式渲染补全字段。',
    category: '渲染器',
    component: lazy(() => import('./demos/required-field-selectors/App')),
  },
  {
    id: 'form-binding',
    title: 'Form Binding',
    description: 'AntForm + AntInput + AntSelect 双向绑定与提交。',
    category: '数据与交互',
    component: lazy(() => import('./demos/form-binding/App')),
  },
  {
    id: 'table-crud',
    title: 'Table CRUD',
    description: 'AntTable 列表 + 查询 + 行内操作，配合 state/methods。',
    category: '数据与交互',
    component: lazy(() => import('./demos/table-crud/App')),
  },
  {
    id: 'custom-components',
    title: 'Custom Components',
    description: '注册自定义 React 组件（UserProfile / ProductCard）。',
    category: '数据与交互',
    component: lazy(() => import('./demos/custom-components/App')),
  },
  {
    id: 'custom-actions',
    title: 'Custom Actions',
    description: '注册 customActions，并在 Schema 中通过 callAction 触发。',
    category: '高级能力',
    component: lazy(() => import('./demos/custom-actions/App')),
  },
  {
    id: 'renderer-handle',
    title: 'Renderer Handle',
    description: '通过 ref 拿到 SchemaRendererHandle，读写 context / state。',
    category: '高级能力',
    component: lazy(() => import('./demos/renderer-handle/App')),
  },
  {
    id: 'notify',
    title: 'Notify',
    description: '通过 GenuiConfigProvider 注入 notify，再在组件中 useGenuiNotify。',
    category: '高级能力',
    component: lazy(() => import('./demos/notify/App')),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: '指标卡 + 图表占位 + 表格的综合看板案例。',
    category: '综合案例',
    component: lazy(() => import('./demos/dashboard/App')),
  },
];

export const defaultDemoId = 'start-with-renderer';

export const findDemo = (id: string | null | undefined): DemoDefinition =>
  demoRegistry.find((demo) => demo.id === id) ?? demoRegistry.find((demo) => demo.id === defaultDemoId)!;
