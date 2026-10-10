import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schema = {
  componentName: 'Page',
  state: {
    list: ['第一项', '第二项', '第三项'],
    focusLog: '',
  },
  refs: { myInput: null, loopInputs: [] },
  methods: {
    focusInput: {
      type: 'JSFunction',
      value: `function focusInput() {
  var el = this.refs.myInput;
  console.log('[refs] this.refs =', this.refs);
  console.log('[refs] Object.keys(this.refs) =', Object.keys(this.refs));
  console.log('[refs] this.refs.myInput =', el);
  if (el) {
    el.nativeElement ? el.nativeElement.focus() : el.focus();
    this.state.focusLog = '已聚焦 refs.myInput';
  } else {
    this.state.focusLog = 'refs.myInput 尚未绑定';
  }
}`,
    },
    logLoopRefs: {
      type: 'JSFunction',
      value: `function logLoopRefs() {
  var refs = this.refs.loopInputs || [];
  console.log('[refs] this.refs.loopInputs =', refs);
  refs.forEach(function (el, i) {
    console.log('[refs] loopInputs[' + i + '] =', el, '| value =', el && el.value);
  });
  var values = refs.map(function (el, i) {
    return '[' + i + ']=' + (el && el.value !== undefined ? el.value : '(空)');
  });
  this.state.focusLog = values.join(', ');
}`,
    }
  },
  props: { style: 'max-width: 640px; padding: 8px;' },
  children: [
    {
      componentName: 'div',
      props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
      children: [
        { componentName: 'h3', props: { style: 'margin: 0;' }, children: '把组件实例绑定到 this.refs' },
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px;' },
          children: [
            {
              componentName: 'TiText',
              props: {
                ref: { type: 'JSExpression', value: 'this.refs.myInput' },
                placeholder: '在这里输入点什么',
              },
            },
            {
              componentName: 'TiButton',
              props: { color: 'primary', onClick: { type: 'JSExpression', value: 'this.focusInput' } },
              children: '聚焦输入框',
            },
          ],
        },
        { componentName: 'h3', props: { style: 'margin: 0;' }, children: '循环中的 ref：this.refs.xxx[index]' },
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 8px;' },
          children: [
            {
              componentName: 'input',
              loop: { type: 'JSExpression', value: 'this.state.list' },
              loopArgs: ['item', 'index'],
              props: {
                ref: { type: 'JSExpression', value: 'this.refs.loopInputs[index]' },
                placeholder: { type: 'JSExpression', value: 'item + " (index=" + index + ")"' },
                style: 'padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px;',
              },
            },
          ],
        },
        {
          componentName: 'TiButton',
          props: { onClick: { type: 'JSExpression', value: 'this.logLoopRefs' } },
          children: '读取所有循环 ref',
        },
        { componentName: 'h3', props: { style: 'margin: 0;' }, children: 'refName：模板局部引用' },
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px;' },
          children: [
            {
              componentName: 'input',
              props: {
                refName: 'localInput',
                placeholder: 'refName = localInput',
                style: 'padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px;',
              },
            },
            {
              componentName: 'TiButton',
              props: { onClick: { type: 'JSExpression', value: `function readRefName() {
  var el = typeof localInput !== 'undefined' ? localInput : undefined;
  console.log('[refs] refName localInput =', el);
  console.log('[refs] refName localInput.value =', el && el.value);
}` } },
              children: '读取 refName',
            },
          ],
        },
        {
          componentName: 'p',
          props: { style: 'margin: 0; color: #8c8c8c; font-size: 13px;' },
          children: [
            { componentName: 'Text', props: { text: { type: 'JSExpression', value: 'this.state.focusLog || "(尚未操作)"' } } },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-refs',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        Angular 物料支持三种模板引用：<code>this.refs.xxx</code>（组件实例）、循环中的
        <code>this.refs.xxx[index]</code>、以及 <code>refName</code> 生成模板局部变量。这是 1.4.0 新增的官方示例场景。
        点击任意按钮会把对应的 ref 对象打印到浏览器控制台（F12 / ⌥⌘I 打开 Console 查看）。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class RefsDemo {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
