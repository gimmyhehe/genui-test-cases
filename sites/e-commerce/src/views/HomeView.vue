<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAllProducts } from '../api'
import { ProductCard } from '../components'
import { useCart, useCartNotice } from '../composables'
import type { Product } from '../types'

const router = useRouter()
const { addToCart } = useCart()
const { showCartNotice } = useCartNotice()

const loading = ref(true)
const featured = ref<Product[]>([])

onMounted(async () => {
  try {
    const products = await fetchAllProducts()
    featured.value = products.slice(0, 4)
  } finally {
    loading.value = false
  }
})

function goDetail(product: Product) {
  router.push(`/products/${product.id}`)
}

function quickAdd(product: Product) {
  addToCart(product, 1)
  showCartNotice(product.title)
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
  color: #5b21b6;
  background: #ede9fe;
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
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
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
  background: linear-gradient(180deg, #faf5ff 0%, #f5f3ff 100%);
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

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 22px;
  }
}
</style>
