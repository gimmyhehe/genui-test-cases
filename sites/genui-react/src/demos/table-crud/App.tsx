import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const schema = {
  componentName: 'Page',
  state: {
    keyword: '',
    columns: [
      { dataIndex: 'id', title: '工号', width: 100 },
      { dataIndex: 'name', title: '姓名', width: 120 },
      { dataIndex: 'department', title: '部门', width: 140 },
      { dataIndex: 'status', title: '状态', width: 100 },
    ],
    allData: [
      { id: '001', name: '张三', department: '技术部', status: '在职' },
      { id: '002', name: '李四', department: '市场部', status: '离职' },
      { id: '003', name: '王五', department: '人事部', status: '在职' },
      { id: '004', name: '赵六', department: '财务部', status: '试用' },
      { id: '005', name: '钱七', department: '技术部', status: '在职' },
    ],
    tableData: [],
  },
  lifeCycles: {
    onMounted: {
      type: 'JSFunction',
      value: 'function onMounted() { this.state.tableData = this.state.allData.slice() }',
    },
  },
  methods: {
    handleSearch: {
      type: 'JSFunction',
      value:
        'function handleSearch() { var kw = (this.state.keyword || "").toLowerCase(); this.state.tableData = this.state.allData.filter(function (row) { return !kw || row.name.toLowerCase().indexOf(kw) > -1 || row.department.toLowerCase().indexOf(kw) > -1 }) }',
    },
    handleReset: {
      type: 'JSFunction',
      value: 'function handleReset() { this.state.keyword = ""; this.state.tableData = this.state.allData.slice() }',
    },
    handleRemoveLast: {
      type: 'JSFunction',
      value: 'function handleRemoveLast() { this.state.tableData = this.state.tableData.slice(0, -1) }',
    },
    handleSortByStatus: {
      type: 'JSFunction',
      value:
        'function handleSortByStatus() { this.state.tableData = this.state.tableData.slice().sort(function (a, b) { return a.status.localeCompare(b.status) }) }',
    },
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '员工列表 CRUD（AntTable）' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px; margin-bottom: 16px;' },
          children: [
            {
              componentName: 'AntInput',
              props: {
                style: 'width: 260px;',
                placeholder: '按姓名/部门搜索',
                value: { type: 'JSExpression', value: 'this.state.keyword' },
                onChange: {
                  type: 'JSFunction',
                  value: 'function(e) { this.state.keyword = e.target.value }',
                },
              },
            },
            {
              componentName: 'AntButton',
              props: {
                type: 'primary',
                onClick: { type: 'JSExpression', value: 'this.handleSearch' },
              },
              children: '搜索',
            },
            {
              componentName: 'AntButton',
              props: { onClick: { type: 'JSExpression', value: 'this.handleReset' } },
              children: '重置',
            },
            {
              componentName: 'AntButton',
              props: { onClick: { type: 'JSExpression', value: 'this.handleSortByStatus' } },
              children: '按状态排序',
            },
            {
              componentName: 'AntButton',
              props: { danger: true, onClick: { type: 'JSExpression', value: 'this.handleRemoveLast' } },
              children: '删除最后一行',
            },
          ],
        },
        {
          componentName: 'AntTable',
          props: {
            rowKey: 'id',
            pagination: { pageSize: 3 },
            columns: { type: 'JSExpression', value: 'this.state.columns' },
            dataSource: { type: 'JSExpression', value: 'this.state.tableData' },
          },
        },
        {
          componentName: 'Text',
          props: {
            style: 'display: block; margin-top: 12px; color: #8c8c8c;',
            text: {
              type: 'JSExpression',
              value: '"当前展示 " + this.state.tableData.length + " / " + this.state.allData.length + " 条"',
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
        AntTable 的 <code>dataSource</code> / <code>columns</code> 绑定到 <code>this.state</code>，搜索、排序、删除都由 Schema methods 驱动，
        React 侧不写任何业务代码。
      </p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} generating={false} />
      </GenuiConfigProvider>
    </div>
  );
}
