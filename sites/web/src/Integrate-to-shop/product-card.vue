<template>
  <div class="product-card">
    <div class="media">
      <img v-if="image" referrerpolicy="no-referrer" class="image" :src="image" :alt="title" />
      <div v-else class="image-placeholder">No Image</div>
      <div v-if="badgeText" class="badge">{{ badgeText }}</div>
    </div>

    <div class="content">
      <div class="header">
        <div class="title" :title="title">{{ title }}</div>
        <div class="price">
          <span class="currency">¥</span>
          <span class="amount">{{ priceText }}</span>
        </div>
      </div>

      <div v-if="description" class="description">{{ description }}</div>

      <div class="meta">
        <div v-if="rating != null" class="rating">
          <span class="star">★</span>
          <span class="value">{{ rating }}</span>
          <span v-if="ratingCount != null" class="count">({{ ratingCount }})</span>
        </div>
        <div class="stock" :class="{ out: inStock === false }">
          {{ inStock === false ? '缺货' : '现货' }}
        </div>
      </div>

      <div v-if="tags?.length" class="tags">
        <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
      </div>

      <div class="actions">
        <button class="btn secondary" type="button" @click="emit('view')">查看</button>
        <button class="btn primary" type="button" :disabled="inStock === false" @click="emit('add-to-cart')">
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
  (e: 'add-to-cart'): void;
}>();

const priceText = (() => {
  const n = typeof props.price === 'string' ? Number(props.price) : props.price;
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(props.price);
})();
</script>

<style scoped>
.product-card {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 14px;
  padding: 14px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  margin: 16px 0;
}

.media {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  background: #f6f7f9;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #8a8f99;
  font-size: 12px;
}

.badge {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 999px;
  background: rgba(24, 144, 255, 0.92);
  color: #fff;
  backdrop-filter: blur(6px);
}

.content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: #111827;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  flex-shrink: 0;
  color: #ef4444;
  font-weight: 700;
  white-space: nowrap;
}

.currency {
  font-size: 12px;
  margin-right: 2px;
  opacity: 0.9;
}

.amount {
  font-size: 16px;
}

.description {
  color: #4b5563;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #111827;
  font-size: 12px;
}

.star {
  color: #f59e0b;
  font-size: 12px;
  transform: translateY(-0.5px);
}

.count {
  color: #6b7280;
}

.stock {
  font-size: 12px;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #d1fae5;
}

.stock.out {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fee2e2;
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
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
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

@media (max-width: 520px) {
  .product-card {
    grid-template-columns: 1fr;
  }

  .media {
    width: 100%;
    height: 180px;
  }
}

</style>

