import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const schema = {
  componentName: 'Page',
  state: {
    formData: { name: '', email: '', department: '' },
    submitted: '',
  },
  methods: {
    handleSubmit: {
      type: 'JSFunction',
      value:
        "function handleSubmit() { this.state.submitted = JSON.stringify(this.state.formData) }",
    },
    handleReset: {
      type: 'JSFunction',
      value:
        "function handleReset() { this.state.formData = { name: '', email: '', department: '' }; this.state.submitted = '' }",
    },
  },
  props: { style: 'max-width: 480px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: 'Ant Design 表单双向绑定' },
      children: [
        {
          componentName: 'AntForm',
          props: { layout: 'vertical' },
          children: [
            {
              componentName: 'AntFormItem',
              props: { label: 'Name' },
              children: [
                {
                  componentName: 'AntInput',
                  props: {
                    placeholder: 'Your name',
                    value: { type: 'JSExpression', value: 'this.state.formData.name' },
                    onChange: {
                      type: 'JSFunction',
                      value: 'function(e) { this.state.formData.name = e.target.value }',
                    },
                  },
                },
              ],
            },
            {
              componentName: 'AntFormItem',
              props: { label: 'Email' },
              children: [
                {
                  componentName: 'AntInput',
                  props: {
                    type: 'email',
                    placeholder: 'email@example.com',
                    value: { type: 'JSExpression', value: 'this.state.formData.email' },
                    onChange: {
                      type: 'JSFunction',
                      value: 'function(e) { this.state.formData.email = e.target.value }',
                    },
                  },
                },
              ],
            },
            {
              componentName: 'AntFormItem',
              props: { label: 'Department' },
              children: [
                {
                  componentName: 'AntSelect',
                  props: {
                    style: 'width: 100%;',
                    placeholder: 'Select department',
                    options: [
                      { label: 'Engineering', value: 'eng' },
                      { label: 'HR', value: 'hr' },
                      { label: 'Product', value: 'pm' },
                    ],
                    value: { type: 'JSExpression', value: 'this.state.formData.department' },
                    onChange: {
                      type: 'JSFunction',
                      value: 'function(value) { this.state.formData.department = value }',
                    },
                  },
                },
              ],
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
              children: '重置',
            },
          ],
        },
        {
          componentName: 'Text',
          props: {
            style: 'display: block; margin-top: 16px; color: #8c8c8c;',
            text: {
              type: 'JSExpression',
              value: '"submit result: " + (this.state.submitted || "-")',
            },
          },
        },
      ],
    },
  ],
};

export default function App() {
  return (
    <div className="demo-container">
      <p className="demo-hint">
        Schema 里的 <code>onChange</code> 直接写回 <code>this.state.formData</code>，配合 <code>value</code> 表达式完成双向绑定；
        「提交」把当前表单序列化后渲染回页面。
      </p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} generating={false} />
      </GenuiConfigProvider>
    </div>
  );
}
