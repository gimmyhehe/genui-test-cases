import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

@Component({
  selector: 'demo-start-with-renderer',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        直接传入一份完整的 Schema：state / lifeCycles / methods / JSExpression / loop 全部由渲染器接管，不需要请求模型。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class StartWithRenderer {
  protected readonly materials = materials;

  protected readonly schema = {
    componentName: 'Page',
    state: {
      keyword: '',
      members: [
        { name: '张三', role: '前端工程师' },
        { name: '李四', role: '后端工程师' },
        { name: '王五', role: '产品经理' },
      ],
      filtered: [],
    },
    lifeCycles: {
      onMounted: {
        type: 'JSFunction',
        value: 'function onMounted() { this.state.filtered = this.state.members.slice() }',
      },
    },
    methods: {
      handleFilter: {
        type: 'JSFunction',
        value:
          'function handleFilter() { var kw = (this.state.keyword || "").toLowerCase(); this.state.filtered = this.state.members.filter(function (item) { return !kw || item.name.toLowerCase().indexOf(kw) > -1 }) }',
      },
      handleReset: {
        type: 'JSFunction',
        value: 'function handleReset() { this.state.keyword = ""; this.state.filtered = this.state.members.slice() }',
      },
      handleAdd: {
        type: 'JSFunction',
        value:
          'function handleAdd() { this.state.members = this.state.members.concat([{ name: "赵六", role: "测试工程师" }]); this.state.filtered = this.state.members.slice() }',
      },
    },
    props: { style: 'max-width: 560px;' },
    children: [
      {
        componentName: 'TiCard',
        props: { header: '静态 Schema 渲染' },
        children: [
          {
            componentName: 'div',
            props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
            children: [
              {
                componentName: 'TiText',
                props: {
                  placeholder: '按姓名过滤',
                  ngModel: { type: 'JSExpression', model: true, value: 'this.state.keyword' },
                  ngModelChange: { type: 'JSExpression', value: 'this.handleFilter' },
                },
                directives: [{ directiveName: 'ngModel' }, { directiveName: 'defaultValueAccessor' }],
              },
              {
                componentName: 'div',
                props: { style: 'display: flex; gap: 8px;' },
                children: [
                  {
                    componentName: 'TiButton',
                    props: {
                      color: 'primary',
                      onClick: { type: 'JSExpression', value: 'this.handleFilter' },
                    },
                    children: '过滤',
                  },
                  {
                    componentName: 'TiButton',
                    props: { onClick: { type: 'JSExpression', value: 'this.handleReset' } },
                    children: '重置',
                  },
                  {
                    componentName: 'TiButton',
                    props: { onClick: { type: 'JSExpression', value: 'this.handleAdd' } },
                    children: '新增成员',
                  },
                ],
              },
              {
                componentName: 'ul',
                props: { style: 'margin: 0; padding-left: 18px; line-height: 2;' },
                children: [
                  {
                    componentName: 'li',
                    loop: { type: 'JSExpression', value: 'this.state.filtered' },
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
      },
    ],
  };
}
