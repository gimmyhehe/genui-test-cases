import { useRef, useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer, type SchemaRendererHandle } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const schema = {
  componentName: 'Page',
  state: { count: 0 },
  props: { style: 'max-width: 520px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '通过 ref 操作渲染器' },
      children: [
        {
          componentName: 'Text',
          props: {
            style: 'display: block; font-size: 14px; line-height: 2;',
            text: {
              type: 'JSExpression',
              value: '"count = " + this.state.count',
            },
          },
        },
        {
          componentName: 'Text',
          props: {
            style: 'display: block; font-size: 14px; line-height: 2;',
            text: {
              type: 'JSExpression',
              value: '"context.tip = " + (this.context.tip || "(空)")',
            },
          },
        },
        {
          componentName: 'AntButton',
          props: {
            type: 'primary',
            onClick: {
              type: 'JSFunction',
              value: 'function() { this.state.count = this.state.count + 1 }',
            },
          },
          children: 'Schema 内部自增',
        },
      ],
    },
  ],
};

export default function App() {
  const rendererRef = useRef<SchemaRendererHandle>(null);
  const [snapshot, setSnapshot] = useState('');

  const readContext = () => {
    setSnapshot(JSON.stringify(rendererRef.current?.getContext() ?? {}, null, 2));
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">
        <code>GenuiRenderer</code> 支持 <code>ref</code>，暴露 <code>setContext</code> / <code>getContext</code> / <code>setState</code>，
        宿主代码可以直接读写渲染器内部状态。
      </p>

      <div className="demo-toolbar">
        <button className="primary" type="button" onClick={() => rendererRef.current?.setState({ count: 100 })}>
          setState({'{ count: 100 }'})
        </button>
        <button type="button" onClick={() => rendererRef.current?.setContext({ tip: '来自 React 宿主' })}>
          setContext({'{ tip }'})
        </button>
        <button type="button" onClick={readContext}>
          getContext()
        </button>
        <button type="button" onClick={() => rendererRef.current?.setState({ count: 0 })}>
          重置 count
        </button>
      </div>

      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer ref={rendererRef} content={schema} generating={false} />
      </GenuiConfigProvider>

      {snapshot && <pre className="demo-meta">{snapshot}</pre>}
    </div>
  );
}
