import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schema = {
  componentName: 'Page',
  state: {
    formData: { name: '张三', sex: '男', department: 'HR', protocolStart: '2023-01-01', email: '' },
    submitted: '',
  },
  methods: {
    departChange: {
      type: 'JSFunction',
      value: "function departChange(value) { console.log('department changed:', value) }",
    },
    handleSubmit: {
      type: 'JSFunction',
      value: 'function handleSubmit() { this.state.submitted = JSON.stringify(this.state.formData) }',
    },
    handleReset: {
      type: 'JSFunction',
      value:
        'function handleReset() { this.state.formData = { name: "", sex: "男", department: "HR", protocolStart: "2023-01-01", email: "" }; this.state.submitted = "" }',
    },
  },
  props: { style: 'width: 460px;' },
  children: [
    {
      componentName: 'h3',
      children: '更新员工信息（ngModel 双向绑定）',
    },
    {
      componentName: 'div',
      props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            { componentName: 'label', props: { style: 'font-weight: bold;' }, children: '姓名' },
            {
              componentName: 'TiText',
              props: {
                placeholder: '请输入',
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.formData.name' },
              },
              directives: [{ directiveName: 'ngModel' }, { directiveName: 'defaultValueAccessor' }],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            { componentName: 'label', props: { style: 'font-weight: bold;' }, children: '性别' },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 16px;' },
              children: [
                {
                  componentName: 'TiRadioGroup',
                  props: {
                    ngModel: { type: 'JSExpression', model: true, value: 'this.state.formData.sex' },
                    options: [
                      { label: '男', value: '男' },
                      { label: '女', value: '女' },
                    ],
                  },
                  directives: [{ directiveName: 'ngModel' }],
                },
              ],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            { componentName: 'label', props: { style: 'font-weight: bold;' }, children: '部门' },
            {
              componentName: 'TiSelect',
              props: {
                placeholder: '请选择',
                options: [
                  { value: 'HR', label: '人事部' },
                  { value: 'eng', label: '技术部' },
                  { value: 'other', label: '其他部门' },
                ],
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.formData.department' },
                ngModelChange: { type: 'JSExpression', value: 'this.departChange' },
              },
              directives: [{ directiveName: 'ngModel' }],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            { componentName: 'label', props: { style: 'font-weight: bold;' }, children: '入职日期' },
            {
              componentName: 'TiDate',
              props: {
                placeholder: '请选择日期',
                format: 'yyyy-MM-dd',
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.formData.protocolStart' },
              },
              directives: [{ directiveName: 'ngModel' }],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            { componentName: 'label', props: { style: 'font-weight: bold;' }, children: '邮箱' },
            {
              componentName: 'TiText',
              props: {
                placeholder: 'name@example.com',
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.formData.email' },
              },
              directives: [{ directiveName: 'ngModel' }, { directiveName: 'defaultValueAccessor' }],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px; margin-top: 8px;' },
          children: [
            {
              componentName: 'TiButton',
              props: { color: 'primary', onClick: { type: 'JSExpression', value: 'this.handleSubmit' } },
              children: '确认',
            },
            {
              componentName: 'TiButton',
              props: { onClick: { type: 'JSExpression', value: 'this.handleReset' } },
              children: '重置',
            },
          ],
        },
        {
          componentName: 'p',
          props: { style: 'color: #8c8c8c; font-size: 13px; margin: 0;' },
          children: [
            {
              componentName: 'Text',
              props: { text: { type: 'JSExpression', value: '"submit result: " + (this.state.submitted || "-")' } },
            },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-form-binding',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        Angular 物料的表单绑定走 <code>ngModel</code> 指令：Schema 的 <code>model: true</code> 表达式会写入
        <code>this.state</code>，并自动带上 <code>defaultValueAccessor</code> 等指令。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class FormBinding {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
