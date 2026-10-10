<template>
  <div class="merge-demo">
    <header class="toolbar">
      <h1>mergeMaterials（1.4.0 core 新增）</h1>
      <p>
        1.4.0 在 <code>@opentiny/genui-sdk-core</code> 新增 <code>mergeMaterials(...sources)</code>：
        components / defaultPropsMap 浅合并（后者覆盖），requiredCompleteFieldSelectors 去重拼接，
        themeFactory 归一化为数组并去重。
      </p>

      <div class="actions">
        <button type="button" :class="{ active: preset === 'standard' }" @click="preset = 'standard'">仅基础物料</button>
        <button type="button" :class="{ active: preset === 'merged' }" @click="preset = 'merged'">合并自定义物料</button>
        <button type="button" :class="{ active: preset === 'override' }" @click="preset = 'override'">覆盖同名组件</button>
      </div>

      <div class="meta">
        组件数：{{ componentCount }} · 补全选择器：{{ selectorCount }} 项 · themeFactory：{{ themeFactoryCount }} 个
      </div>
    </header>

    <GenuiConfigProvider :materials="currentMaterials" theme="light" class="renderer-wrap">
      <GenuiRenderer :content="schema" :generating="false" />
    </GenuiConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { mergeMaterials } from '@opentiny/genui-sdk-core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-vue';
import { materials as baseMaterials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';

const DemoBanner = defineComponent({
  name: 'DemoBanner',
  props: {
    title: { type: String, default: '' },
    tone: { type: String, default: 'green' },
  },
  setup(props) {
    const palette: Record<string, { bg: string; border: string; color: string }> = {
      green: { bg: '#e8f5e9', border: '#81c784', color: '#1b5e20' },
      blue: { bg: '#e3f2fd', border: '#64b5f6', color: '#0d47a1' },
    };
    return () => {
      const tone = palette[props.tone] ?? palette.green;
      return h(
        'div',
        {
          style: {
            padding: '14px 18px',
            borderRadius: '8px',
            background: tone.bg,
            border: `1px solid ${tone.border}`,
            color: tone.color,
            fontWeight: 600,
          },
        },
        props.title,
      );
    };
  },
});

/** 自定义组件 + 自定义补全选择器 */
const customMaterials = {
  components: { DemoBanner },
  requiredCompleteFieldSelectors: ['[componentName=DemoBanner] > props > title'],
};

/**
 * 覆盖同名组件：后合并的会替换基础物料里的 TinyCard。
 * 这里演示「后者覆盖」语义，所以单独用一份 sources。
 */
const overrideMaterials = {
  components: {
    TinyCard: DemoBanner,
  },
};

type Preset = 'standard' | 'merged' | 'override';
const preset = ref<Preset>('merged');

const currentMaterials = computed(() => {
  if (preset.value === 'standard') return mergeMaterials(baseMaterials);
  if (preset.value === 'override') return mergeMaterials(baseMaterials, overrideMaterials);
  return mergeMaterials(baseMaterials, customMaterials);
});

const componentCount = computed(() => Object.keys((currentMaterials.value.components as Record<string, unknown>) ?? {}).length);
const selectorCount = computed(() => currentMaterials.value.requiredCompleteFieldSelectors?.length ?? 0);
const themeFactoryCount = computed(() => {
  const factory = currentMaterials.value.themeFactory;
  if (!factory) return 0;
  return Array.isArray(factory) ? factory.length : 1;
});

const schema = {
  componentName: 'Page',
  state: {
    cards: [
      { title: '合并后的自定义组件', tone: 'green' },
      { title: '来自第二个物料源', tone: 'blue' },
    ],
  },
  props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
  children: [
    {
      componentName: 'DemoBanner',
      loop: { type: 'JSExpression', value: 'this.state.cards' },
      loopArgs: ['card'],
      props: {
        title: { type: 'JSExpression', value: 'card.title' },
        tone: { type: 'JSExpression', value: 'card.tone' },
      },
    },
    {
      componentName: 'TinyButton',
      props: { text: '我来自基础物料', type: 'primary' },
    },
  ],
};
</script>

<style scoped>
.merge-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
  background: #f7f8fa;
  overflow: auto;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar h1 {
  margin: 0;
  font-size: 20px;
}

.toolbar p {
  margin: 0;
  color: #595959;
  font-size: 14px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions button {
  padding: 8px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.actions button.active {
  border-color: #191919;
  background: #191919;
  color: #fff;
}

.meta {
  font-size: 13px;
  color: #8c8c8c;
}

.renderer-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
