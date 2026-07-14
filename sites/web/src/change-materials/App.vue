<script setup>
import { defineComponent, h, ref } from 'vue';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-vue';
import { materials as baseMaterials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';

const DemoBanner = defineComponent({
  name: 'DemoBanner',
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
        props.title,
      );
  },
});

const readyMaterials = {
  ...baseMaterials,
  components: {
    ...baseMaterials.components,
    DemoBanner,
  },
};

const createSchema = (title) => ({
  componentName: 'Page',
  children: [
    {
      componentName: 'DemoBanner',
      props: { title },
    },
    {
        componentName: 'div',
        children: 'div content'
    },
    {
      componentName: 'TinyButton',
      props: {
        text: 'TinyButton',
        type: 'primary',
      },
    },
  ],
});

/** undefined = 尚未注入 materials */
const materials = ref();
const cards = ref([]);
let seq = 0;

const addSchema = (title) => {
  seq += 1;
  cards.value.push({
    id: seq,
    title,
    content: createSchema(title),
  });
};

const stepAddEarlySchema = () => {
  addSchema(`早期 schema #${seq + 1}`);
};

const stepSetMaterials = () => {
  materials.value = readyMaterials;
};

const stepAddNewSchema = () => {
  addSchema(`新 schema #${seq + 1}`);
};

const reset = () => {
  materials.value = undefined;
  cards.value = [];
  seq = 0;
};
</script>

<template>
  <div class="materials-late-bind-demo">
    <header class="toolbar">
      <h1>Materials 延后注入 Demo</h1>
      <p>
        流程：一开始没有 materials → 先来 schema → 再设置 materials → 再来新 schema（应正常渲染）。
      </p>

      <div class="actions">
        <button type="button" :disabled="!!materials" @click="stepAddEarlySchema">
          1. 添加早期 schema（无 materials）
        </button>
        <button type="button" :disabled="!!materials" @click="stepSetMaterials">
          2. 设置 materials
        </button>
        <button type="button" :disabled="!materials" @click="stepAddNewSchema">
          3. 添加新 schema（有 materials）
        </button>
        <button type="button" class="ghost" @click="reset">重置</button>
      </div>

      <div class="meta">
        materials: {{ materials ? '已设置' : '无' }} · cards: {{ cards.length }}
      </div>
    </header>

    <GenuiConfigProvider :materials="materials" theme="light" class="list-wrap">
      <div v-if="!cards.length" class="empty">还没有 schema，按上方步骤操作</div>
      <div v-for="card in cards" :key="card.id" class="card">
        <div class="card-meta">#{{ card.id }} · {{ card.title }}</div>
        <GenuiRenderer :content="card.content" :generating="false" />
      </div>
    </GenuiConfigProvider>
  </div>
</template>

<style scoped>
.materials-late-bind-demo {
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

.actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.actions button.ghost {
  background: transparent;
}

.meta {
  font-size: 13px;
  color: #8c8c8c;
}

.list-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
}

.empty {
  color: #8c8c8c;
  font-size: 14px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f0f0f0;
}

.card-meta {
  font-size: 12px;
  color: #8c8c8c;
}
</style>
