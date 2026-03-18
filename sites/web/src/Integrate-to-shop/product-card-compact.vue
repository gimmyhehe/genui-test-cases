<template>
  <div class="pc">
    <div class="media">
      <img v-if="image" referrerpolicy="no-referrer" class="image" :src="image" :alt="title" />
      <div v-else class="image placeholder">IMG</div>
      <div v-if="badgeText" class="badge">{{ badgeText }}</div>
    </div>

    <div class="body">
      <div class="title" :title="title">{{ title }}</div>

      <div class="row">
        <div class="price">
          <span class="currency">¥</span>
          <span class="amount">{{ priceText }}</span>
        </div>
        <div v-if="inStock === false" class="stock out">缺货</div>
        <div v-else class="stock">现货</div>
      </div>

      <div v-if="description" class="desc">{{ description }}</div>

      <div v-if="tags?.length" class="tags">
        <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
      </div>

      <div class="actions">
        <button class="btn secondary" type="button" @click="emit('view')">查看</button>
        <button class="btn primary" type="button" :disabled="inStock === false" @click="emit('add')">
          加入购物车
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  price: number | string;
  image?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  ratingCount?: number;
  inStock?: boolean;
  badgeText?: string;
}>();

const emit = defineEmits<{
  (e: 'view'): void;
  (e: 'add'): void;
}>();

const priceText = (() => {
  const n = typeof props.price === 'string' ? Number(props.price) : props.price;
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(props.price);
})();
</script>

<style scoped>
.pc {
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px;
  margin: 10px 0;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
  overflow: hidden;
}

.media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image.placeholder {
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
}

.badge {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 999px;
  background: rgba(24, 144, 255, 0.92);
  color: #fff;
  backdrop-filter: blur(6px);
}

.body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  color: #111827;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.price {
  color: #ef4444;
  font-weight: 900;
  white-space: nowrap;
}

.currency {
  font-size: 12px;
  margin-right: 2px;
  opacity: 0.9;
}

.amount {
  font-size: 18px;
  letter-spacing: 0.2px;
}

.stock {
  font-size: 12px;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #d1fae5;
  flex-shrink: 0;
}

.stock.out {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fee2e2;
}

.desc {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 3px 8px;
  border-radius: 999px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
}

.btn {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  min-width: 0;
}

.btn.primary {
  background: #111827;
  color: #fff;
}

.btn.primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn.secondary {
  background: #fff;
  border-color: #e5e7eb;
  color: #111827;
}
</style>

