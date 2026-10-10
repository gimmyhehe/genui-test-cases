import { useEffect, useMemo, useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer, requiredCompleteFieldSelectors } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

const fullSchema = JSON.stringify(
  {
    componentName: 'Page',
    state: {
      options: [
        { label: '技术部（Eng）', value: 'eng' },
        { label: '产品部（PM）', value: 'pm' },
        { label: '设计部（Design）', value: 'design' },
      ],
    },
    children: [
      {
        componentName: 'AntCard',
        props: { title: 'Required Complete Field Selectors' },
        children: [
          {
            componentName: 'AntSelect',
            props: {
              style: 'width: 280px;',
              placeholder: '请选择部门',
              options: { type: 'JSExpression', value: 'this.state.options' },
            },
          },
        ],
      },
    ],
  },
  null,
  2,
);

const STEP = 32;

export default function App() {
  const [revealed, setRevealed] = useState(fullSchema.length);
  const [useSelectors, setUseSelectors] = useState(true);

  const partial = useMemo(() => fullSchema.slice(0, revealed), [revealed]);
  const isComplete = revealed >= fullSchema.length;

  useEffect(() => {
    if (isComplete) return;
    const timer = window.setInterval(() => {
      setRevealed((value) => Math.min(value + STEP, fullSchema.length));
    }, 120);
    return () => window.clearInterval(timer);
  }, [isComplete]);

  const restart = () => setRevealed(0);

  return (
    <div className="demo-container">
      <p className="demo-hint">
        <code>requiredCompleteFieldSelectors</code> 告诉渲染器：这些字段没写完整就先不要渲染，避免流式过程中出现「半截」UI。
        默认物料已经内置了下方的选择器。
      </p>

      <div className="demo-toolbar">
        <button className="primary" type="button" onClick={restart}>
          重新流式渲染
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={useSelectors} onChange={(event) => setUseSelectors(event.target.checked)} />
          传入 requiredCompleteFieldSelectors
        </label>
      </div>

      <pre className="demo-meta" style={{ marginBottom: 12 }}>
        {JSON.stringify(useSelectors ? requiredCompleteFieldSelectors : [], null, 2)}
      </pre>

      <p className="demo-hint">
        进度：{revealed} / {fullSchema.length} 字符（{isComplete ? '已完成' : '生成中'}）
      </p>

      <div className="demo-panel">
        <GenuiConfigProvider materials={materials}>
          <GenuiRenderer
            content={partial}
            generating={!isComplete}
            isJsonComplete={isComplete}
            requiredCompleteFieldSelectors={useSelectors ? requiredCompleteFieldSelectors : []}
          />
        </GenuiConfigProvider>
      </div>
    </div>
  );
}
