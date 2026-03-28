<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAllProducts } from '../api'
import { ProductCard } from '../components'
import { useCart } from '../composables'
import type { Product } from '../types'

const router = useRouter()
const { addToCart } = useCart()

const loading = ref(true)
const featured = ref<Product[]>([])
const toast = ref('')

let toastTimer: ReturnType<typeof window.setTimeout> | null = null

onMounted(async () => {
  try {
    const products = await fetchAllProducts()
    featured.value = products.slice(0, 4)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
})

function goDetail(product: Product) {
  router.push(`/products/${product.id}`)
}

function quickAdd(product: Product) {
  addToCart(product, 1)
  toast.value = `已加入购物车：${product.title}`
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1600)
}
</script>

<template>
  <section class="hero panel">
    <div>
      <p class="hero__tag">2026 春季上新</p>
      <h1 class="section-title hero__title">轻量电商 Demo，支持多页面浏览与下单流程</h1>
      <p class="section-desc">
        首页看推荐，商品页筛选，详情页加购，购物车结算后可在订单页查看结果。
      </p>
      <div class="hero__actions">
        <RouterLink to="/products" class="hero__primary">去逛商品</RouterLink>
        <RouterLink to="/cart" class="hero__ghost">查看购物车</RouterLink>
      </div>
    </div>
    <div class="hero__stats">
      <div>
        <strong>7+</strong>
        <span>模拟商品</span>
      </div>
      <div>
        <strong>5</strong>
        <span>页面路由</span>
      </div>
      <div>
        <strong>100%</strong>
        <span>本地图片</span>
      </div>
    </div>
  </section>

  <section class="featured">
    <h2 class="section-title">本周推荐</h2>
    <p class="section-desc">精选热销商品，支持一键加入购物车。</p>

    <div v-if="loading" class="empty-state">正在加载推荐商品...</div>
    <div v-else class="product-grid">
      <ProductCard
        v-for="product in featured"
        :key="product.id"
        :product="product"
        @open="goDetail"
        @add="quickAdd"
      />
    </div>
  </section>

  <Transition name="toast">
    <div v-if="toast" class="toast">{{ toast }}</div>
  </Transition>
</template>

<style scoped>
.hero {
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}

.hero__tag {
  display: inline-flex;
  margin: 0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #0f766e;
  background: #ccfbf1;
}

.hero__title {
  margin-top: 14px;
}

.hero__actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero__primary,
.hero__ghost {
  text-decoration: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
}

.hero__primary {
  color: #ffffff;
  background: linear-gradient(135deg, #0f9f93 0%, #0ea5e9 100%);
}

.hero__ghost {
  color: var(--title);
  border: 1px solid var(--line);
  background: #fff;
}

.hero__stats {
  border-radius: 12px;
  border: 1px solid var(--line);
  padding: 16px;
  background: linear-gradient(180deg, #f8fdff 0%, #f0f9ff 100%);
  display: grid;
  gap: 12px;
  align-content: center;
}

.hero__stats div {
  display: grid;
  gap: 2px;
}

.hero__stats strong {
  color: var(--title);
  font-size: 24px;
}

.hero__stats span {
  font-size: 13px;
  color: var(--muted);
}

.featured {
  margin-top: 28px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 30;
  padding: 10px 16px;
  border-radius: 999px;
  color: #fff;
  background: #0f172a;
  font-size: 13px;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 22px;
  }
}
</style>
