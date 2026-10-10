import { useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials as baseMaterials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import type { IMaterials } from '@opentiny/genui-sdk-core';
import '../../shared/demo.css';

function DemoBanner({ title = '' }: { title?: string }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 8,
        background: '#e8f5e9',
        border: '1px solid #81c784',
        color: '#1b5e20',
        fontWeight: 600,
      }}
    >
      {title}
    </div>
  );
}

const readyMaterials: IMaterials = {
  ...baseMaterials,
  components: {
    ...baseMaterials.components,
    DemoBanner,
  },
};

const createSchema = (title: string) => ({
  componentName: 'Page',
  children: [
    { componentName: 'DemoBanner', props: { title } },
    { componentName: 'div', children: 'div content' },
    { componentName: 'AntButton', props: { type: 'primary' }, children: 'AntButton' },
  ],
});

interface Card {
  id: number;
  title: string;
  content: unknown;
}

export default function App() {
  const [materials, setMaterials] = useState<IMaterials | undefined>(undefined);
  const [cards, setCards] = useState<Card[]>([]);

  const addSchema = (title: string) =>
    setCards((prev) => [...prev, { id: prev.length + 1, title, content: createSchema(title) }]);

  const reset = () => {
    setMaterials(undefined);
    setCards([]);
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">
        流程：一开始没有 materials → 先来 Schema → 再注入 materials → 再来新 Schema。验证 materials 延后绑定不会导致早期 Schema 失效。
      </p>

      <div className="demo-toolbar">
        <button type="button" disabled={!!materials} onClick={() => addSchema(`早期 schema #${cards.length + 1}`)}>
          1. 添加早期 schema（无 materials）
        </button>
        <button type="button" disabled={!!materials} onClick={() => setMaterials(readyMaterials)}>
          2. 注入 materials
        </button>
        <button type="button" disabled={!materials} onClick={() => addSchema(`新 schema #${cards.length + 1}`)}>
          3. 添加新 schema（有 materials）
        </button>
        <button type="button" onClick={reset}>
          重置
        </button>
      </div>

      <p className="demo-hint">
        materials：{materials ? '已注入' : '未注入'} · cards：{cards.length}
      </p>

      {cards.length === 0 && <div className="demo-panel">还没有 schema，按上方步骤操作。</div>}

      <GenuiConfigProvider materials={materials}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((card) => (
            <div key={card.id} className="demo-panel">
              <div className="demo-meta" style={{ margin: '0 0 8px' }}>
                #{card.id} · {card.title}
              </div>
              <GenuiRenderer content={card.content as Record<string, unknown>} generating={false} />
            </div>
          ))}
        </div>
      </GenuiConfigProvider>
    </div>
  );
}
