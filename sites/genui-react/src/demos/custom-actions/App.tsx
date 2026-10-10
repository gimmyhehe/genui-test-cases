import { useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer, type ICustomAction } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

interface LogItem {
  action: string;
  params: unknown;
  at: string;
}

const schema = {
  componentName: 'Page',
  state: { count: 0, selected: '' },
  props: { style: 'max-width: 560px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: 'Custom Actions（callAction）' },
      children: [
        {
          componentName: 'AntSelect',
          props: {
            style: 'width: 100%; margin-bottom: 12px;',
            placeholder: '选择一个部门',
            options: [
              { label: '技术部', value: 'eng' },
              { label: '产品部', value: 'pm' },
            ],
            value: { type: 'JSExpression', value: 'this.state.selected' },
            onChange: {
              type: 'JSFunction',
              value: "function(value) { this.state.selected = value; this.callAction('logSelection', { value: value }) }",
            },
          },
        },
        {
          componentName: 'AntButton',
          props: {
            type: 'primary',
            onClick: {
              type: 'JSFunction',
              value: "function() { this.state.count = this.state.count + 1; this.callAction('increase', { count: this.state.count }) }",
            },
          },
          children: '自增并上报宿主',
        },
        {
          componentName: 'AntButton',
          props: {
            style: 'margin-left: 8px;',
            onClick: { type: 'JSFunction', value: "function() { this.callAction('notifyHost', { count: this.state.count }) }" },
          },
          children: '仅通知宿主',
        },
      ],
    },
  ],
};

export default function App() {
  const [logs, setLogs] = useState<LogItem[]>([]);

  const push = (action: string) => (params: unknown) => {
    setLogs((prev) => [{ action, params, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 12));
  };

  const customActions: Record<string, ICustomAction> = {
    increase: {
      name: 'increase',
      description: '把自增后的值上报给宿主',
      parameters: { type: 'object', properties: { count: { type: 'number' } } },
      execute: push('increase'),
    },
    logSelection: {
      name: 'logSelection',
      description: '记录用户选择的部门',
      execute: push('logSelection'),
    },
    notifyHost: {
      name: 'notifyHost',
      description: '只做一次宿主通知',
      execute: (params) => {
        push('notifyHost')(params);
        window.alert(`宿主收到 notifyHost，当前 count = ${(params as { count: number }).count}`);
      },
    },
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">
        <code>customActions</code> 让 Schema 通过 <code>this.callAction(name, params)</code> 调用宿主能力；
        action 的 <code>name/description/parameters</code> 也会随 prompt 一起提供给模型。
      </p>

      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} customActions={customActions} generating={false} />
      </GenuiConfigProvider>

      <div className="demo-panel" style={{ marginTop: 16 }}>
        <div className="demo-meta" style={{ margin: 0 }}>
          已触发 {logs.length} 次：
        </div>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
          {logs.map((log, index) => (
            <li key={`${log.at}-${index}`}>
              <strong>{log.action}</strong> · {log.at} · {JSON.stringify(log.params)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
