import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

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
      { dataIndex: 'rank', title: '排名', width: 80 },
      { dataIndex: 'name', title: '商品', width: 200 },
      { dataIndex: 'category', title: '类目', width: 120 },
      { dataIndex: 'sales', title: '销量', width: 100 },
      { dataIndex: 'amount', title: '销售额', width: 140 },
    ],
    allRows: [
      { rank: 1, name: '轻量防水通勤双肩包', category: '箱包', sales: 1280, amount: '¥ 254,720' },
      { rank: 2, name: '无线降噪耳机', category: '数码', sales: 964, amount: '¥ 866,636' },
      { rank: 3, name: '人体工学椅', category: '家居', sales: 512, amount: '¥ 512,000' },
      { rank: 4, name: '机械键盘 87 键', category: '数码', sales: 486, amount: '¥ 291,600' },
      { rank: 5, name: '保温杯 500ml', category: '生活', sales: 402, amount: '¥ 40,200' },
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
        'function applyRange(range) { this.state.range = range; var factor = range === "week" ? 1 : range === "month" ? 4.2 : 12.6; this.state.rows = this.state.allRows.map(function (row) { return Object.assign({}, row, { sales: Math.round(row.sales * factor) }) }) }',
    },
    handleRow: {
      type: 'JSFunction',
      value: 'function handleRow(row) { console.log("drill down", row.name) }',
    },
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '经营看板' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px; margin-bottom: 16px;' },
          children: [
            {
              componentName: 'AntRadio',
              props: {
                options: [
                  { label: '近 7 天', value: 'week' },
                  { label: '近 30 天', value: 'month' },
                  { label: '近一年', value: 'year' },
                ],
                optionType: 'button',
                value: { type: 'JSExpression', value: 'this.state.range' },
                onChange: { type: 'JSFunction', value: 'function(e) { this.applyRange(e.target.value) }' },
              },
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;' },
          children: [
            {
              componentName: 'div',
              loop: { type: 'JSExpression', value: 'this.state.metrics' },
              loopArgs: ['metric', 'index'],
              props: {
                style: 'padding: 14px; border: 1px solid #f0f0f0; border-radius: 8px; background: #fafafa;',
              },
              children: [
                { componentName: 'Text', props: { style: 'color: #8c8c8c; font-size: 12px;', text: { type: 'JSExpression', value: 'metric.label' } } },
                {
                  componentName: 'div',
                  props: { style: 'font-size: 20px; font-weight: 700; margin: 6px 0;' },
                  children: [
                    { componentName: 'Text', props: { text: { type: 'JSExpression', value: 'metric.value' } } },
                  ],
                },
                {
                  componentName: 'Text',
                  props: {
                    style: 'font-size: 12px;',
                    text: { type: 'JSExpression', value: '"环比 " + metric.trend' },
                  },
                },
              ],
            },
          ],
        },
        {
          componentName: 'AntTable',
          props: {
            rowKey: 'rank',
            pagination: false,
            columns: { type: 'JSExpression', value: 'this.state.columns' },
            dataSource: { type: 'JSExpression', value: 'this.state.rows' },
            onRowClick: { type: 'JSExpression', value: 'this.handleRow' },
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
        综合案例：指标卡（loop） + 时间范围筛选（AntRadio） + 明细表（AntTable），全部由一份 Schema 描述，
        切换时间范围时只更新 <code>this.state.rows</code>。
      </p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} generating={false} />
      </GenuiConfigProvider>
    </div>
  );
}
