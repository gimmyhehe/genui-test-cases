import { Type } from '@angular/core';

export type DemoCategory = '基础入门' | '渲染器' | '数据与交互' | '高级能力' | '综合案例';

export interface DemoDefinition {
  id: string;
  title: string;
  description: string;
  category: DemoCategory;
  load: () => Promise<Type<unknown>>;
}

export const demoCategories: DemoCategory[] = ['基础入门', '渲染器', '数据与交互', '高级能力', '综合案例'];

export const demoRegistry: DemoDefinition[] = [
  {
    id: 'start-with-renderer',
    title: 'Start with Renderer',
    description: '静态 Schema 渲染 Ti 组件，含 state / methods / loop。',
    category: '基础入门',
    load: () => import('./demos/start-with-renderer/start-with-renderer').then((m) => m.StartWithRenderer),
  },
  {
    id: 'streaming-generate',
    title: 'Streaming Generate',
    description: '请求本地 GenUI server，流式生成并增量渲染。',
    category: '基础入门',
    load: () => import('./demos/streaming-generate/streaming-generate').then((m) => m.StreamingGenerate),
  },
  {
    id: 'schema-diff',
    title: 'Schema Diff',
    description: '切换 Schema，观察渲染器的增量 patch 行为。',
    category: '渲染器',
    load: () => import('./demos/schema-diff/schema-diff').then((m) => m.SchemaDiff),
  },
  {
    id: 'header-footer',
    title: 'Header / Footer Slot',
    description: '通过 ng-template 投影渲染器头部与底部插槽。',
    category: '渲染器',
    load: () => import('./demos/header-footer/header-footer').then((m) => m.HeaderFooter),
  },
  {
    id: 'required-field-selectors',
    title: 'Required Field Selectors',
    description: '控制流式渲染时的必填字段补全策略。',
    category: '渲染器',
    load: () => import('./demos/required-field-selectors/required-field-selectors').then((m) => m.RequiredFieldSelectors),
  },
  {
    id: 'form-binding',
    title: 'Form Binding',
    description: 'ngModel 指令 + Schema 双向绑定的表单示例。',
    category: '数据与交互',
    load: () => import('./demos/form-binding/form-binding').then((m) => m.FormBinding),
  },
  {
    id: 'table-pagination',
    title: 'Table + Pagination',
    description: 'TiTable / TiPagination 组合的分页表格。',
    category: '数据与交互',
    load: () => import('./demos/table-pagination/table-pagination').then((m) => m.TablePagination),
  },
  {
    id: 'refs',
    title: 'Refs & refName',
    description: '在 Schema 中通过 this.refs 与 refName 获取模板引用。',
    category: '数据与交互',
    load: () => import('./demos/refs/refs').then((m) => m.RefsDemo),
  },
  {
    id: 'custom-components',
    title: 'Custom Components',
    description: '通过 customComponents / customComponentsModule 注册组件。',
    category: '高级能力',
    load: () => import('./demos/custom-components/custom-components').then((m) => m.CustomComponents),
  },
  {
    id: 'custom-actions',
    title: 'Custom Actions',
    description: '注册 customActions，Schema 内用 callAction 调用宿主。',
    category: '高级能力',
    load: () => import('./demos/custom-actions/custom-actions').then((m) => m.CustomActions),
  },
  {
    id: 'notify',
    title: 'Notify',
    description: '1.4.0 新增：genui-config-provider 的 notify 输入。',
    category: '高级能力',
    load: () => import('./demos/notify/notify').then((m) => m.NotifyDemo),
  },
  {
    id: 'legacy-renderer',
    title: 'Legacy Renderer',
    description: '使用 GenuiLegacyRenderer 兼容旧版渲染入口。',
    category: '高级能力',
    load: () => import('./demos/legacy-renderer/legacy-renderer').then((m) => m.LegacyRendererDemo),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: '指标卡 + 表格的综合看板案例。',
    category: '综合案例',
    load: () => import('./demos/dashboard/dashboard').then((m) => m.Dashboard),
  },
];

export const defaultDemoId = 'start-with-renderer';

export const findDemo = (id: string | null | undefined): DemoDefinition =>
  demoRegistry.find((demo) => demo.id === id) ?? demoRegistry.find((demo) => demo.id === defaultDemoId)!;
