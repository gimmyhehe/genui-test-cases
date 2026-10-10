import { useState } from 'react';
import {
  GenuiConfigProvider,
  GenuiRenderer,
  useGenuiNotify,
  type GenuiMaterials,
  type NotifyHandler,
} from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

interface Toast {
  type: string;
  message: string;
  id: number;
}

/** 自定义组件：通过 useGenuiNotify 读取宿主注入的 notify。 */
function NotifyButton({ label = '触发通知', type = 'success', message = '来自 Schema 的通知' }: Record<string, unknown>) {
  const notify = useGenuiNotify();

  return (
    <button
      type="button"
      className="primary"
      style={{ padding: '8px 16px', border: 'none', borderRadius: 4, background: '#1890ff', color: '#fff', cursor: 'pointer' }}
      onClick={() => notify?.({ type: type as 'success' | 'warning' | 'error' | 'info', title: label as string, message: message as string })}
    >
      {label as string}
    </button>
  );
}

const customComponents: GenuiMaterials = { NotifyButton };

const schema = {
  componentName: 'Page',
  props: { style: 'max-width: 560px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: 'Notify（GenuiConfigProvider + useGenuiNotify）' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
          children: [
            { componentName: 'NotifyButton', props: { label: '保存成功', type: 'success', message: '数据已保存' } },
            { componentName: 'NotifyButton', props: { label: '注意', type: 'warning', message: '库存不足' } },
            { componentName: 'NotifyButton', props: { label: '出错了', type: 'error', message: '网络请求失败' } },
          ],
        },
      ],
    },
  ],
};

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify: NotifyHandler = ({ type = 'info', title, message, duration = 2400 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { type, message: [title, message].filter(Boolean).join(' · '), id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const palette: Record<string, string> = {
    success: '#f6ffed',
    warning: '#fffbe6',
    error: '#fff2f0',
    info: '#e6f4ff',
  };
  const border: Record<string, string> = {
    success: '#b7eb8f',
    warning: '#ffe58f',
    error: '#ffccc7',
    info: '#91caff',
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">
        <code>GenuiConfigProvider</code> 接收 <code>notify</code> 并在 Context 中下发给渲染树；
        自定义组件用 <code>useGenuiNotify()</code> 即可拿到，无需层层透传 props。
      </p>

      <GenuiConfigProvider materials={materials} notify={notify}>
        <GenuiRenderer content={schema} customComponents={customComponents} generating={false} />
      </GenuiConfigProvider>

      <div style={{ position: 'fixed', right: 24, bottom: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              minWidth: 220,
              padding: '10px 14px',
              borderRadius: 8,
              background: palette[toast.type] ?? palette.info,
              border: `1px solid ${border[toast.type] ?? border.info}`,
              fontSize: 13,
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
