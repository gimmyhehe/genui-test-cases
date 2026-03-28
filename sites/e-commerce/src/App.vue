<script setup lang="ts">
import { useCart } from './composables'

const { totalCount } = useCart()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <RouterLink to="/" class="brand">
        <span class="brand__mark" aria-hidden="true">◆</span>
        Nebula Mart
      </RouterLink>

      <nav class="nav" aria-label="主导航">
        <RouterLink to="/" class="nav__item">首页</RouterLink>
        <RouterLink to="/products" class="nav__item">商品</RouterLink>
        <RouterLink to="/orders" class="nav__item">订单</RouterLink>
      </nav>

      <RouterLink to="/cart" class="cart-link">
        购物车
        <span v-if="totalCount > 0" class="cart-link__badge">{{ totalCount }}</span>
      </RouterLink>
    </header>

    <main class="shell__main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-up" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="shell__footer">© {{ currentYear }} Nebula Mart Demo</footer>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.shell__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
  background: color-mix(in oklab, var(--card) 86%, transparent);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--title);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.brand__mark {
  color: var(--accent);
}

.nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
}

.nav__item {
  text-decoration: none;
  color: var(--muted);
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav__item:hover,
.nav__item.router-link-active {
  color: var(--title);
  background: var(--accent-soft);
}

.cart-link {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #0c342f;
  background: linear-gradient(135deg, #6ee7d8 0%, #5ed4ff 100%);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.cart-link__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 12px;
}

.shell__main {
  flex: 1;
  padding: 20px;
}

.shell__footer {
  border-top: 1px solid var(--line);
  padding: 14px 20px 18px;
  font-size: 12px;
  color: var(--muted);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 760px) {
  .shell__header {
    flex-wrap: wrap;
  }

  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
  }
}
</style>
