import { useMemo, useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials as baseMaterials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import type { IMaterials } from '@opentiny/genui-sdk-core';
import '../../shared/demo.css';

type Preset = 'A' | 'B';

function BannerA({ title = '' }: { title?: string }) {
  return (
    <div style={{ padding: '16px 20px', borderRadius: 8, background: '#e8f5e9', border: '1px solid #81c784', color: '#1b5e20', fontWeight: 600 }}>
      [A] {title}
    </div>
  );
}

function BannerB({ title = '' }: { title?: string }) {
  return (
    <div style={{ padding: '16px 20px', borderRadius: 8, background: '#e3f2fd', border: '1px solid #64b5f6', color: '#0d47a1', fontWeight: 600 }}>
      [B] {title}
    </div>
  );
}

const bannerMap: Record<Preset, typeof BannerA> = { A: BannerA, B: BannerB };

const createMaterials = (key: Preset): IMaterials => ({
  ...baseMaterials,
  components: {
    ...baseMaterials.components,
    DemoBanner: bannerMap[key],
  },
});

const schema = {
  componentName: 'Page',
  children: [
    { componentName: 'DemoBanner', props: { title: 'materials 动态切换测试' } },
    { componentName: 'AntButton', props: { type: 'primary' }, children: '我是 AntButton' },
  ],
};

export default function App() {
  const [mode, setMode] = useState<'replace' | 'patch'>('replace');
  const [preset, setPreset] = useState<Preset>('A');
  const [count, setCount] = useState(0);
  const [patchPreset, setPatchPreset] = useState<Preset>('A');

  const replaced = useMemo(() => createMaterials(preset), [preset]);
  const patched = useMemo(
    () => ({
      ...baseMaterials,
      components: { ...baseMaterials.components, DemoBanner: bannerMap[patchPreset] },
    }),
    [patchPreset],
  );

  const current = mode === 'replace' ? replaced : patched;

  const switchByReplace = (key: Preset) => {
    setMode('replace');
    setPreset(key);
    setCount((value) => value + 1);
  };

  const switchByPatch = (key: Preset) => {
    setMode('patch');
    setPatchPreset(key);
    setCount((value) => value + 1);
  };

  return (
    <div className="demo-container">
      <p className="demo-hint">两种切换方式：整对象替换 materials / 只重建 materials.components。</p>

      <div className="demo-toolbar">
        <span style={{ fontSize: 13, color: '#6b7280' }}>方式一：替换整个 materials</span>
        <button type="button" onClick={() => switchByReplace('A')}>
          替换为 A（绿色）
        </button>
        <button type="button" onClick={() => switchByReplace('B')}>
          替换为 B（蓝色）
        </button>
      </div>

      <div className="demo-toolbar">
        <span style={{ fontSize: 13, color: '#6b7280' }}>方式二：只改 components</span>
        <button type="button" onClick={() => switchByPatch('A')}>
          修改 components → A
        </button>
        <button type="button" onClick={() => switchByPatch('B')}>
          修改 components → B
        </button>
      </div>

      <p className="demo-hint">
        模式：{mode === 'replace' ? '整对象替换' : '改 components'} · 当前：
        {mode === 'replace' ? preset : patchPreset} · 已切换 {count} 次
      </p>

      <div className="demo-panel">
        <GenuiConfigProvider materials={current}>
          <GenuiRenderer content={schema} generating={false} />
        </GenuiConfigProvider>
      </div>
    </div>
  );
}
