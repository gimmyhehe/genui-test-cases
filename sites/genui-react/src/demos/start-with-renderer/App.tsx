import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const schema = {
  componentName: 'Page',
  state: {
    selectValue: 'eng',
    keyword: '',
    options: [
      { label: '技术部', value: 'eng' },
      { label: '产品部', value: 'pm' },
      { label: '设计部', value: 'design' },
    ],
    allOptions: [
      { label: '技术部', value: 'eng' },
      { label: '产品部', value: 'pm' },
      { label: '设计部', value: 'design' },
      { label: '市场部', value: 'market' },
    ],
    members: [
      { name: '张三', role: '前端工程师' },
      { name: '李四', role: '后端工程师' },
      { name: '王五', role: '产品经理' },
    ],
  },
  lifeCycles: {
    onMounted: {
      type: 'JSFunction',
      value: "function onMounted() { console.log('[start-with-renderer] onMounted', this.state.members.length) }",
    },
  },
  methods: {
    handleSearch: {
      type: 'JSFunction',
      value:
        'function handleSearch(value) { this.state.keyword = value || ""; const keyword = this.state.keyword; this.state.options = this.state.allOptions.filter(function (item) { return item.label.indexOf(keyword) > -1 }) }',
    },
    handleReset: {
      type: 'JSFunction',
      value: 'function handleReset() { this.state.options = this.state.allOptions; this.state.keyword = "" }',
    },
    handleSubmit: {
      type: 'JSFunction',
      value: "function handleSubmit() { console.log('submit', this.state.selectValue, this.state.keyword) }",
    },
  },
  props: { style: 'max-width: 560px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '静态 Schema 渲染' },
      children: [
        {
          componentName: 'h4',
          props: { style: 'margin: 0 0 8px;' },
          children: '当前选择：',
        },
        {
          componentName: 'Text',
          props: { text: { type: 'JSExpression', value: 'this.state.selectValue' } },
        },
        {
          componentName: 'AntSelect',
          props: {
            style: 'width: 100%; margin: 12px 0;',
            placeholder: '请选择部门',
            showSearch: true,
            value: { type: 'JSExpression', value: 'this.state.selectValue' },
            options: { type: 'JSExpression', value: 'this.state.options' },
            onChange: { type: 'JSExpression', value: 'this.handleSearch' },
          },
        },
        {
          componentName: 'AntButton',
          props: {
            type: 'primary',
            onClick: { type: 'JSExpression', value: 'this.handleSubmit' },
          },
          children: '提交',
        },
        {
          componentName: 'AntButton',
          props: {
            style: 'margin-left: 8px;',
            onClick: { type: 'JSExpression', value: 'this.handleReset' },
          },
          children: '重置选项',
        },
        {
          componentName: 'ul',
          props: { style: 'margin: 16px 0 0; padding-left: 18px;' },
          children: [
            {
              componentName: 'li',
              loop: { type: 'JSExpression', value: 'this.state.members' },
              loopArgs: ['item'],
              children: [
                {
                  componentName: 'Text',
                  props: { text: { type: 'JSExpression', value: 'item.name + " · " + item.role' } },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function App() {
  return (
    <div className="demo-container">
      <p className="demo-hint">
        直接传入一份完整的 Schema：state / lifeCycles / methods / JSExpression / loop 都由渲染器接管，无需请求模型。
      </p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} />
      </GenuiConfigProvider>
    </div>
  );
}
