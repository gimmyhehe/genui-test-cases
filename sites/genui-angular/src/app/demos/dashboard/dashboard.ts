import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schema = {
  componentName: 'Page',
  state: {
    range: 'week',
    metrics: [
      { label: '今日 GMV', value: '¥ 1,284,320', trend: '+12.4%' },
      { label: '订单数', value: '8,642', trend: '+3.1%' },
      { label: '新增用户', value: '1,203', trend: '-0.8%' },
      { label: '退货率', value: '1.9%', trend: '+0.2%' },
    ],
    columns: [
      { field: 'rank', title: '排名' },
      { field: 'name', title: '商品' },
      { field: 'category', title: '类目' },
      { field: 'sales', title: '销量' },
      { field: 'amount', title: '销售额' },
    ],
    allRows: [
      { rank: 1, name: '轻量防水通勤双肩包', category: '箱包', base: 1280, amount: '¥ 254,720' },
      { rank: 2, name: '无线降噪耳机', category: '数码', base: 964, amount: '¥ 866,636' },
      { rank: 3, name: '人体工学椅', category: '家居', base: 512, amount: '¥ 512,000' },
      { rank: 4, name: '机械键盘 87 键', category: '数码', base: 486, amount: '¥ 291,600' },
      { rank: 5, name: '保温杯 500ml', category: '生活', base: 402, amount: '¥ 40,200' },
    ],
    rows: [],
  },
  lifeCycles: {
    onMounted: {
      type: 'JSFunction',
      value: 'function onMounted() { this.applyRange("week") }',
    },
  },
  methods: {
    applyRange: {
      type: 'JSFunction',
      value:
        'function applyRange(range) { this.state.range = range; var factor = range === "week" ? 1 : range === "month" ? 4.2 : 12.6; this.state.rows = this.state.allRows.map(function (row) { return Object.assign({}, row, { sales: Math.round(row.base * factor) }) }) }',
    },
    handleRangeChange: {
      type: 'JSFunction',
      value: 'function handleRangeChange(value) { this.applyRange(value) }',
    },
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '经营看板' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
          children: [
            {
              componentName: 'TiRadioGroup',
              props: {
                options: [
                  { label: '近 7 天', value: 'week' },
                  { label: '近 30 天', value: 'month' },
                  { label: '近一年', value: 'year' },
                ],
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.range' },
                ngModelChange: { type: 'JSExpression', value: 'this.handleRangeChange' },
              },
              directives: [{ directiveName: 'ngModel' }],
            },
            {
              componentName: 'div',
              props: { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;' },
              children: [
                {
                  componentName: 'div',
                  loop: { type: 'JSExpression', value: 'this.state.metrics' },
                  loopArgs: ['metric'],
                  props: { style: 'padding: 14px; border: 1px solid #f0f0f0; border-radius: 8px; background: #fafafa;' },
                  children: [
                    {
                      componentName: 'Text',
                      props: {
                        style: 'display: block; color: #8c8c8c; font-size: 12px;',
                        text: { type: 'JSExpression', value: 'metric.label' },
                      },
                    },
                    {
                      componentName: 'Text',
                      props: {
                        style: 'display: block; font-size: 20px; font-weight: 700; margin: 6px 0;',
                        text: { type: 'JSExpression', value: 'metric.value' },
                      },
                    },
                    {
                      componentName: 'Text',
                      props: {
                        style: 'display: block; font-size: 12px; color: #8c8c8c;',
                        text: { type: 'JSExpression', value: '"环比 " + metric.trend' },
                      },
                    },
                  ],
                },
              ],
            },
            {
              componentName: 'table',
              props: { style: 'width: 100%; border-collapse: collapse;' },
              children: [
                {
                  componentName: 'thead',
                  children: [
                    {
                      componentName: 'tr',
                      children: [
                        {
                          componentName: 'th',
                          props: { style: 'text-align: left; padding: 8px; border-bottom: 1px solid #eee;' },
                          loop: { type: 'JSExpression', value: 'this.state.columns' },
                          loopArgs: ['column'],
                          children: [
                            { componentName: 'Text', props: { text: { type: 'JSExpression', value: 'column.title' } } },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  componentName: 'tbody',
                  children: [
                    {
                      componentName: 'tr',
                      loop: { type: 'JSExpression', value: 'this.state.rows' },
                      loopArgs: ['row'],
                      children: [
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.rank' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.name' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.category' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.sales' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.amount' } } }],
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
    },
  ],
};

@Component({
  selector: 'demo-dashboard',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        综合案例：指标卡（loop）+ 时间范围筛选（TiRadioGroup / ngModel）+ 明细表，全部由一份 Schema 描述，
        切换时间范围只更新 <code>this.state.rows</code>。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class Dashboard {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
