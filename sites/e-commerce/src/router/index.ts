import { createRouter, createWebHistory } from 'vue-router'
import {
  CartView,
  HomeView,
  NotFoundView,
  OrdersView,
  ProductDetailView,
  ProductsView,
} from '../views'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
    { path: '/products', name: 'products', component: ProductsView, meta: { title: '商品列表' } },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetailView,
      meta: { title: '商品详情' },
    },
    { path: '/cart', name: 'cart', component: CartView, meta: { title: '购物车' } },
    { path: '/orders', name: 'orders', component: OrdersView, meta: { title: '我的订单' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: '页面不存在' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const t = to.meta.title as string | undefined
  document.title = t ? `${t} · Mock 商城` : 'Mock 商城'
})

export { router }
