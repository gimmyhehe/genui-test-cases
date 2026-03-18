<template>
  <aside class="sidebar" :class="{ open: modelValue }" aria-label="对话侧边栏">
    <div class="sidebar-header">
      <div class="sidebar-title">智能购物助手</div>
      <div class="sidebar-actions">
        <button class="btn ghost" type="button" @click="$emit('update:modelValue', false)">收起</button>
      </div>
    </div>
    <div class="sidebar-body">
      <GenuiChat :url="url" :customComponents="customComponents" :customActions="customActions" :messages="messages" />
    </div>
  </aside>

  <div v-if="modelValue" class="backdrop" @click="$emit('update:modelValue', false)" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { GenuiChat } from '@opentiny/genui-sdk-vue';

type AddToCartProduct = {
  id: string;
  title: string;
  price: number;
  image?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  ratingCount?: number;
  inStock?: boolean;
  badgeText?: string;
};

const props = defineProps<{
  modelValue: boolean;
  url: string;
  customComponents: any[];
  messages: any[];
  addToCart: (p: AddToCartProduct) => void;
}>();

defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
}>();

const customActions = computed(() => [
  {
    name: 'addToCart',
    description: '加入购物车',
    execute: (params: any) => {
      const p = params?.product;
      if (!p || typeof p !== 'object') return;
      props.addToCart(p as AddToCartProduct);
    },
    parameters: {
      type: 'object' as const,
      properties: {
        product: {
          type: 'object' as const,
          description: '要加入购物车的商品',
          properties: {
            id: { type: 'string', description: '商品ID' },
            title: { type: 'string', description: '商品标题' },
            price: { type: 'number', description: '商品价格' },
            image: { type: 'string', description: '商品图片URL' },
            description: { type: 'string', description: '商品描述' },
            tags: { type: 'array', description: '商品标签' },
            rating: { type: 'number', description: '评分（0-5）' },
            ratingCount: { type: 'number', description: '评分人数' },
            inStock: { type: 'boolean', description: '是否有货' },
            badgeText: { type: 'string', description: '角标文案（例如：新品/限时）' },
          },
          required: ['id', 'title', 'price'],
        },
      },
      required: ['product'],
    },
  },
]);
</script>

<style scoped>
.sidebar {
  position: relative;
  height: 100%;
  border-left: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-header {
  height: 56px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.sidebar-body {
  min-height: 0;
  flex: 1;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  color: #111827;
}

.btn.ghost {
  background: transparent;
  border-color: rgba(17, 24, 39, 0.12);
}

.backdrop {
  display: none;
}

@media (max-width: 1100px) {
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: min(420px, 92vw);
    transform: translateX(100%);
    transition: transform 180ms ease;
    z-index: 20;
    box-shadow: -12px 0 24px rgba(0, 0, 0, 0.12);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 10;
  }
}
</style>
