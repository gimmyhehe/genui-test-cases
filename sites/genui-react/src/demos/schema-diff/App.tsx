import { useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const schemaA = {
  componentName: 'Page',
  state: {
    columns: [
      { dataIndex: 'id', title: '工号' },
      { dataIndex: 'name', title: '姓名' },
      { dataIndex: 'department', title: '部门' },
    ],
    tableData: [
      { id: '001', name: '张三', department: '技术部' },
      { id: '002', name: '李四', department: '市场部' },
      { id: '003', name: '王五', department: '人事部' },
    ],
  },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '员工列表（Schema A：3 行）' },
      children: [
        {
          componentName: 'AntTable',
          props: {
            rowKey: 'id',
            pagination: false,
            columns: { type: 'JSExpression', value: 'this.state.columns' },
            dataSource: { type: 'JSExpression', value: 'this.state.tableData' },
          },
        },
      ],
    },
  ],
};

const schemaB = {
  componentName: 'Page',
  state: {
    columns: [
      { dataIndex: 'id', title: '工号' },
      { dataIndex: 'name', title: '姓名' },
      { dataIndex: 'department', title: '部门' },
      { dataIndex: 'status', title: '状态' },
    ],
    tableData: [
      { id: '001', name: '张三', department: '技术部', status: '在职' },
      { id: '002', name: '李四', department: '市场部', status: '离职' },
      { id: '003', name: '王五', department: '人事部', status: '在职' },
      { id: '004', name: '赵六', department: '财务部', status: '在职' },
      { id: '005', name: '钱七', department: '技术部', status: '试用' },
    ],
  },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '员工列表（Schema B：5 行 + 新增列）' },
      children: [
        {
          componentName: 'AntTable',
          props: {
            rowKey: 'id',
            pagination: false,
            columns: { type: 'JSExpression', value: 'this.state.columns' },
            dataSource: { type: 'JSExpression', value: 'this.state.tableData' },
          },
        },
      ],
    },
  ],
};

export default function App() {
  const [useSchemaB, setUseSchemaB] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  const toggle = () => {
    setUseSchemaB((prev) => !prev);
    setRenderCount((count) => count + 1);
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">
        渲染器内部使用 <code>DeltaPatcher</code> 对比新旧 Schema，只下发差量。不断切换可以观察表格行与列的增量更新。
      </p>
      <div className="demo-toolbar">
        <button className="primary" type="button" onClick={toggle}>
          切换到 {useSchemaB ? 'Schema A' : 'Schema B'}
        </button>
        <button type="button" onClick={() => setRenderCount(0)}>
          重置计数
        </button>
      </div>
      <p className="demo-hint">切换次数：{renderCount}</p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={useSchemaB ? schemaB : schemaA} />
      </GenuiConfigProvider>
    </div>
  );
}
