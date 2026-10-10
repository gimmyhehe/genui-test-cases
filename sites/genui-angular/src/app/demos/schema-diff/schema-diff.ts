import { Component, signal } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schemaA = {
  componentName: 'Page',
  state: {
    columns: [
      { field: 'id', title: '工号' },
      { field: 'name', title: '姓名' },
      { field: 'department', title: '部门' },
    ],
    rows: [
      { id: '001', name: '张三', department: '技术部' },
      { id: '002', name: '李四', department: '市场部' },
      { id: '003', name: '王五', department: '人事部' },
    ],
  },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '员工列表（Schema A：3 行 3 列）' },
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
                      props: { style: 'text-align: left; padding: 8px;' },
                      loop: { type: 'JSExpression', value: 'this.state.columns' },
                      loopArgs: ['column'],
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'column.title' } } }],
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
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.id' } } }],
                    },
                    {
                      componentName: 'td',
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.name' } } }],
                    },
                    {
                      componentName: 'td',
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.department' } } }],
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

const schemaB = {
  componentName: 'Page',
  state: {
    columns: [
      { field: 'id', title: '工号' },
      { field: 'name', title: '姓名' },
      { field: 'department', title: '部门' },
      { field: 'status', title: '状态' },
    ],
    rows: [
      { id: '001', name: '张三', department: '技术部', status: '在职' },
      { id: '002', name: '李四', department: '市场部', status: '离职' },
      { id: '003', name: '王五', department: '人事部', status: '在职' },
      { id: '004', name: '赵六', department: '财务部', status: '试用' },
      { id: '005', name: '钱七', department: '技术部', status: '在职' },
    ],
  },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '员工列表（Schema B：5 行 4 列）' },
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
                      props: { style: 'text-align: left; padding: 8px;' },
                      loop: { type: 'JSExpression', value: 'this.state.columns' },
                      loopArgs: ['column'],
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'column.title' } } }],
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
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.id' } } }],
                    },
                    {
                      componentName: 'td',
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.name' } } }],
                    },
                    {
                      componentName: 'td',
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.department' } } }],
                    },
                    {
                      componentName: 'td',
                      props: { style: 'padding: 8px;' },
                      children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'row.status' } } }],
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
  selector: 'demo-schema-diff',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        渲染器内部用 <code>DeltaPatcher</code> 对比新旧 Schema，只下发差量；反复切换可以观察行与列的增量更新。
      </p>
      <div class="demo-toolbar">
        <button class="primary" type="button" (click)="toggle()">切换到 {{ useB() ? 'Schema A' : 'Schema B' }}</button>
        <button type="button" (click)="count.set(0)">重置计数</button>
      </div>
      <p class="demo-hint">切换次数：{{ count() }}</p>
      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="useB() ? schemaB : schemaA"></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class SchemaDiff {
  protected readonly materials = materials;
  protected readonly schemaA = schemaA;
  protected readonly schemaB = schemaB;
  protected readonly useB = signal(false);
  protected readonly count = signal(0);

  protected toggle(): void {
    this.useB.update((value) => !value);
    this.count.update((value) => value + 1);
  }
}
