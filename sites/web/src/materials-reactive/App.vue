<script setup>
import { computed, defineComponent, h, reactive, ref } from 'vue';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-vue';
import { materials as baseMaterials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';

const DemoBannerA = defineComponent({
  name: 'DemoBannerA',
  props: {
    title: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          style: {
            padding: '16px 20px',
            borderRadius: '8px',
            background: '#e8f5e9',
            border: '1px solid #81c784',
            color: '#1b5e20',
            fontWeight: 600,
          },
        },
        `[A] ${props.title}`,
      );
  },
});

const DemoBannerB = defineComponent({
  name: 'DemoBannerB',
  props: {
    title: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          style: {
            padding: '16px 20px',
            borderRadius: '8px',
            background: '#e3f2fd',
            border: '1px solid #64b5f6',
            color: '#0d47a1',
            fontWeight: 600,
          },
        },
        `[B] ${props.title}`,
      );
  },
});

const bannerMap = {
  A: DemoBannerA,
  B: DemoBannerB,
};

const createMaterials = (key) => ({
  ...baseMaterials,
  components: {
    ...baseMaterials.components,
    DemoBanner: bannerMap[key],
  },
});

const activePreset = ref('A');
const switchMode = ref('replace');
const switchCount = ref(0);

const replacedMaterials = ref(createMaterials('A'));
const patchedMaterials = reactive(createMaterials('A'));

const currentMaterials = computed(() =>
  switchMode.value === 'replace' ? replacedMaterials.value : patchedMaterials,
);

const schema = {
  componentName: 'Page',
  children: [
    {
      componentName: 'DemoBanner',
      props: {
        title: 'materials 动态切换测试',
      },
    },
    {
      componentName: 'TinyButton',
      props: {
        text: '我是 TinyButton',
        type: 'primary',
      },
    },
  ],
};

const switchByReplace = (key) => {
  switchMode.value = 'replace';
  activePreset.value = key;
  switchCount.value += 1;
  replacedMaterials.value = createMaterials(key);
};

const switchByPatchComponents = (key) => {
  switchMode.value = 'patch';
  activePreset.value = key;
  switchCount.value += 1;
  patchedMaterials.components = {
    ...baseMaterials.components,
    DemoBanner: bannerMap[key],
  };
};
</script>

<template>
  <div class="materials-reactive-demo">
    <header class="toolbar">
      <h1>Materials 动态响应式 Demo</h1>
      <p>两种切换方式分别验证：整对象替换 / 仅修改 components。</p>

      <div class="group">
        <div class="group-title">方式一：替换整个 materials 对象</div>
        <div class="actions">
          <button
            type="button"
            :class="{ active: switchMode === 'replace' && activePreset === 'A' }"
            @click="switchByReplace('A')"
          >
            替换为 A（绿色）
          </button>
          <button
            type="button"
            :class="{ active: switchMode === 'replace' && activePreset === 'B' }"
            @click="switchByReplace('B')"
          >
            替换为 B（蓝色）
          </button>
        </div>
      </div>

      <div class="group">
        <div class="group-title">方式二：只修改 materials.components</div>
        <div class="actions">
          <button
            type="button"
            :class="{ active: switchMode === 'patch' && activePreset === 'A' }"
            @click="switchByPatchComponents('A')"
          >
            修改 components → A（绿色）
          </button>
          <button
            type="button"
            :class="{ active: switchMode === 'patch' && activePreset === 'B' }"
            @click="switchByPatchComponents('B')"
          >
            修改 components → B（蓝色）
          </button>
        </div>
      </div>

      <div class="meta">
        模式: {{ switchMode === 'replace' ? '整对象替换' : '改 components' }} · 当前:
        {{ activePreset }} · 已切换 {{ switchCount }} 次
      </div>
    </header>

    <GenuiConfigProvider :materials="currentMaterials" theme="light" class="renderer-wrap">
      <GenuiRenderer :content="schema" :generating="false" />
    </GenuiConfigProvider>
  </div>
</template>

<style scoped>
.materials-reactive-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
  background: #f7f8fa;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar h1 {
  margin: 0;
  font-size: 20px;
}

.toolbar p {
  margin: 0;
  color: #595959;
  font-size: 14px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
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
  flex: 1;
  min-height: 0;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
}
</style>
