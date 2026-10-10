import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import { useSchemaStream } from '../../shared/fetch-schema-stream';
import '../../shared/demo.css';

const PRESETS = ['做一个员工信息表单', '展示一个商品卡片列表', '生成一个带分页的订单表格'];

export default function App() {
  const { inputText, schema, generating, error, setInputText, send, reset } = useSchemaStream();

  return (
    <div className="demo-container">
      <p className="demo-hint">
        React 渲染器 + 本地 GenUI server（<code>pnpm -F genui-sdk-server dev</code>，端口 3200）。
        服务端按 antd materials 注入 systemPrompt，前端只负责把流式片段喂给 <code>GenuiRenderer</code>。
      </p>

      <div className="demo-toolbar">
        <input
          value={inputText}
          placeholder="请输入问题..."
          onChange={(event) => setInputText(event.target.value)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') void send();
          }}
        />
        <button className="primary" type="button" disabled={generating} onClick={() => void send()}>
          {generating ? '生成中…' : '发送'}
        </button>
        <button type="button" onClick={reset}>
          清空
        </button>
      </div>

      <div className="demo-toolbar">
        {PRESETS.map((preset) => (
          <button key={preset} type="button" onClick={() => setInputText(preset)}>
            {preset}
          </button>
        ))}
      </div>

      {error && <div className="demo-error">{error}</div>}

      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} generating={generating} />
      </GenuiConfigProvider>

      {schema && <pre className="demo-meta">已接收 {schema.length} 字符 schema</pre>}
    </div>
  );
}
