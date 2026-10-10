import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const ALL_ROWS = Array.from({ length: 23 }, (_, index) => ({
  id: String(index + 1).padStart(3, '0'),
  name: `员工 ${index + 1}`,
  department: ['技术部', '市场部', '人事部', '财务部'][index % 4],
  email: `user${index + 1}@example.com`,
}));

const schema = {
  componentName: 'Page',
  state: {
    currentPage: 1,
    pageSize: 5,
    total: ALL_ROWS.length,
    columns: [
      { field: 'id', title: '工号' },
      { field: 'name', title: '姓名' },
      { field: 'department', title: '部门' },
      { field: 'email', title: '邮箱' },
    ],
    allData: ALL_ROWS,
    displayedData: [],
  },
  lifeCycles: {
    onMounted: {
      type: 'JSFunction',
      value: 'function onMounted() { this.refresh() }',
    },
  },
  methods: {
    refresh: {
      type: 'JSFunction',
      value:
        'function refresh() { var start = (this.state.currentPage - 1) * this.state.pageSize; this.state.displayedData = this.state.allData.slice(start, start + this.state.pageSize) }',
    },
    handlePageChange: {
      type: 'JSFunction',
      value: 'function handlePageChange(page) { this.state.currentPage = page; this.refresh() }',
    },
    handleSizeChange: {
      type: 'JSFunction',
      value: 'function handleSizeChange(size) { this.state.pageSize = size; this.state.currentPage = 1; this.refresh() }',
    },
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '分页员工列表（TiTable + TiPagination）' },
      children: [
        {
          componentName: 'TiTable',
          props: {
            srcData: { type: 'JSExpression', value: 'this.state.allData' },
            displayedData: { type: 'JSExpression', model: true, value: 'this.state.displayedData' },
            columns: { type: 'JSExpression', value: 'this.state.columns' },
          },
          children: [
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
                      loop: { type: 'JSExpression', value: 'this.state.displayedData' },
                      loopArgs: ['row'],
                      children: [
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.id' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.name' } } }],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [
                            { componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.department' } } },
                          ],
                        },
                        {
                          componentName: 'td',
                          props: { style: 'padding: 8px; border-bottom: 1px solid #f5f5f5;' },
                          children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.email' } } }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          componentName: 'TiPagination',
          props: {
            currentPage: { type: 'JSExpression', value: 'this.state.currentPage' },
            pageSize: { type: 'JSExpression', value: 'this.state.pageSize' },
            total: { type: 'JSExpression', value: 'this.state.total' },
            currentPageChange: { type: 'JSExpression', value: 'this.handlePageChange' },
            pageSizeChange: { type: 'JSExpression', value: 'this.handleSizeChange' },
          },
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-table-pagination',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        分页完全由 Schema 描述：<code>onMounted</code> 初始化首页数据，翻页 / 改页大小通过
        <code>currentPageChange</code>、<code>pageSizeChange</code> 回调 methods 重新切片。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class TablePagination {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
