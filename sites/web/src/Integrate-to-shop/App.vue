<template>
  <div class="layout">
    <main class="main">
      <header class="topbar">
        <div class="brand">
          <div class="brand-title">购物车</div>
          <div class="brand-subtitle">主页面：购物车；侧边：对话助手</div>
        </div>

        <div class="topbar-actions">
          <button class="btn ghost" type="button" @click="clearCart" :disabled="cartItems.length === 0">
            清空
          </button>
          <button class="btn primary" type="button" @click="chatOpen = true">
            打开对话
          </button>
        </div>
      </header>

      <section class="content-grid">
        <div class="panel" :class="{ pulse: cartPulse }">
          <div class="panel-header">
            <div class="panel-title">我的购物车</div>
            <div class="panel-meta">
              <span class="pill">{{ cartCount }} 件</span>
              <span class="pill strong">合计 ¥{{ totalPriceText }}</span>
            </div>
          </div>

          <div v-if="cartItems.length === 0" class="empty">
            <div class="empty-title">购物车还是空的</div>
            <div class="empty-desc">在下方商品列表加入商品，或在侧边对话中让助手推荐。</div>
          </div>

          <div v-else class="cart-list">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="cart-media">
                <img v-if="item.image" referrerpolicy="no-referrer" class="cart-image" :src="item.image" :alt="item.title" />
                <div v-else class="cart-image placeholder">IMG</div>
              </div>

              <div class="cart-body">
                <div class="cart-title" :title="item.title">{{ item.title }}</div>
                <div class="cart-sub">
                  <div class="cart-price">¥{{ formatPrice(item.price) }}</div>
                  <div class="qty">
                    <button class="qty-btn" type="button" @click="decQty(item.id)" :disabled="item.qty <= 1">-</button>
                    <div class="qty-value">{{ item.qty }}</div>
                    <button class="qty-btn" type="button" @click="incQty(item.id)">+</button>
                  </div>
                </div>
              </div>

              <div class="cart-right">
                <div class="cart-line">小计</div>
                <div class="cart-subtotal">¥{{ formatPrice(item.price * item.qty) }}</div>
                <button class="link-danger" type="button" @click="removeItem(item.id)">移除</button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">推荐商品</div>
            <div class="panel-meta">
              <span class="hint">点击“加入购物车”即可添加</span>
            </div>
          </div>

          <ProductCard
            v-for="p in products"
            :key="p.id"
            :title="p.title"
            :price="p.price"
            :image="p.image"
            :description="p.description"
            :tags="p.tags"
            :rating="p.rating"
            :ratingCount="p.ratingCount"
            :inStock="p.inStock"
            :badgeText="p.badgeText"
            @add-to-cart="addToCart(p)"
            @view="selected = p"
          />

          <div v-if="selected" class="detail">
            <div class="detail-title">已选择：{{ selected.title }}</div>
            <div class="detail-actions">
              <button class="btn secondary" type="button" @click="selected = null">关闭</button>
              <button class="btn primary" type="button" @click="addToCart(selected)">加入购物车</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <ChatSidebar v-model="chatOpen" :url="url" :customComponents="customComponents" :messages="messages" :addToCart="addToCart" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ChatSidebar from './chat-sidebar.vue';
import ProductCard from './product-card.vue';
import ProductCardCompact from './product-card-compact.vue';
import UserProfile from './user-profile.vue';

type Product = {
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

type CartItem = Product & { qty: number };

type ChatRole = 'user' | 'assistant';
type ChatMessage = {
  role: ChatRole;
  content: string;
  messages?: any[];
};

const url = 'https://your-chat-backend/api';

const chatOpen = ref(true);
const selected = ref<Product | null>(null);

const products = ref<Product[]>([
  {
    id: 'bag-commute',
    title: '轻量防水通勤双肩包',
    price: 199,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。',
    tags: ['通勤', '防水', '轻量'],
    rating: 4.7,
    ratingCount: 1289,
    inStock: true,
    badgeText: '限时',
  },
  {
    id: 'bottle-thermo',
    title: '真空保温杯 480ml',
    price: 89,
    image: 'https://mofusand-mofumofu-market.jp/cdn/shop/files/4515424048928_165f1fb7-aaab-4163-b459-985fd6acf365.jpg?v=1743640289',
    description: '长效保温，防漏杯盖，通勤/健身都好用。',
    tags: ['保温', '不锈钢', '防漏'],
    rating: 4.6,
    ratingCount: 603,
    inStock: true,
    badgeText: '热卖',
  },
  {
    id: 'headphone',
    title: '无线降噪耳机',
    price: 399,
    image: 'https://image-cdn.hypb.st/https%3A%2F%2Fcn.hypebeast.com%2Ffiles%2F2019%2F10%2Fapple-unveils-new-in-ear-airpods-pro-coming-october-30-1.jpg?q=75&w=800&cbr=1&fit=max',
    description: '通勤更安静，支持多设备切换。',
    tags: ['降噪', '蓝牙', '通勤'],
    rating: 4.5,
    ratingCount: 214,
    inStock: true,
    badgeText: '新品',
  },
]);

const cartItems = ref<CartItem[]>([]);
const cartPulse = ref(false);
let cartPulseTimer: number | undefined;

function formatPrice(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : String(n);
}

function addToCart(p: Product) {
  cartPulse.value = false;
  if (cartPulseTimer) window.clearTimeout(cartPulseTimer);
  cartPulseTimer = window.setTimeout(() => {
    cartPulse.value = true;
    cartPulseTimer = window.setTimeout(() => {
      cartPulse.value = false;
    }, 320);
  }, 0);

  const idx = cartItems.value.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    cartItems.value[idx] = { ...cartItems.value[idx], qty: cartItems.value[idx].qty + 1 };
  } else {
    cartItems.value.unshift({ ...p, qty: 1 });
  }
}

function removeItem(id: string) {
  cartItems.value = cartItems.value.filter((x) => x.id !== id);
}

function incQty(id: string) {
  const idx = cartItems.value.findIndex((x) => x.id === id);
  if (idx >= 0) cartItems.value[idx] = { ...cartItems.value[idx], qty: cartItems.value[idx].qty + 1 };
}

function decQty(id: string) {
  const idx = cartItems.value.findIndex((x) => x.id === id);
  if (idx < 0) return;
  const next = Math.max(1, cartItems.value[idx].qty - 1);
  cartItems.value[idx] = { ...cartItems.value[idx], qty: next };
}

function clearCart() {
  cartItems.value = [];
}

const cartCount = computed(() => cartItems.value.reduce((sum, x) => sum + x.qty, 0));
const totalPrice = computed(() => cartItems.value.reduce((sum, x) => sum + x.qty * x.price, 0));
const totalPriceText = computed(() => formatPrice(totalPrice.value));

const customComponents = [
  {
    component: 'ProductCard',
    name: '商品卡片',
    description: '展示商品图片、价格、标签、评分与操作按钮',
    schema: {
      properties: [
        { property: 'title', type: 'string', description: '商品标题', required: true },
        { property: 'price', type: 'number', description: '商品价格', required: true },
        { property: 'image', type: 'string', description: '商品图片URL' },
        { property: 'description', type: 'string', description: '商品描述' },
        { property: 'tags', type: 'array', description: '商品标签' },
        { property: 'rating', type: 'number', description: '评分（0-5）' },
        { property: 'ratingCount', type: 'number', description: '评分人数' },
        { property: 'inStock', type: 'boolean', description: '是否有货' },
        { property: 'badgeText', type: 'string', description: '角标文案（例如：新品/限时）' },
      ],
    },
    ref: ProductCardCompact,
  },
];

const messages: ChatMessage[] = [
  { role: 'user', content: '推荐一个双肩包' },
  {
    role: 'assistant',
    content: '',
    messages: [
      {
        type: 'tool',
        name: 'get-product-detail',
        formatPretty: true,
        status: 'success',
        content:
          '{\n  "arguments": {\n    "keyword": "双肩包"\n  },\n  "result": [\n    {\n      "detailInfo": {\n        "title": "轻量防水通勤双肩包",\n        "price": 199,\n        "image": "https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg",\n        "description": "14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。",\n        "tags": ["通勤", "防水", "轻量"],\n        "rating": 4.7,\n        "ratingCount": 1289,\n        "inStock": true,\n        "badgeText": "限时"\n      }\n    }\n  ]\n}',
        id: 'call_demo_product_detail',
      },
      {
        type: 'schema-card',
        content: JSON.stringify({
          componentName: 'Page',
          children: [
            {
              componentName: 'ProductCard',
              props: {
                title: '轻量防水通勤双肩包',
                price: 199,
                image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
                description: '14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。',
                tags: ['通勤', '防水', '轻量'],
                rating: 4.7,
                ratingCount: 1289,
                inStock: true,
                badgeText: '限时',
                onAdd: {
                  type: 'JSFunction',
                  value:
                    "function() { this.callAction('addToCart', { product: { id: 'bag-commute', title: '轻量防水通勤双肩包', price: 199, image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg', description: '14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。', tags: ['通勤', '防水', '轻量'], rating: 4.7, ratingCount: 1289, inStock: true, badgeText: '限时' } }); }",
                },
              },
            }
          ],
        }),
      },
    ],
  },
];
</script>

<style scoped>
.layout {
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 420px;
  background: #f6f7f9;
}

.main {
  min-width: 0;
  height: 100%;
  overflow: auto;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  background: rgba(246, 247, 249, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.topbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
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

.btn.primary {
  background: #111827;
  color: #fff;
}

.btn.secondary {
  background: #fff;
  border-color: #e5e7eb;
}

.btn.ghost {
  background: transparent;
  border-color: rgba(17, 24, 39, 0.12);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.content-grid {
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(360px, 1.05fr) minmax(360px, 0.95fr);
  gap: 16px;
}

.panel {
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  min-width: 0;
}

.panel.pulse {
  animation: cartPulse 320ms ease-out;
}

@keyframes cartPulse {
  0% {
    transform: translateY(0) scale(1);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  }
  35% {
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 16px 34px rgba(17, 24, 39, 0.12),
      0 0 0 3px rgba(17, 24, 39, 0.08);
  }
  100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  }
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 2px 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.panel-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pill {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.pill.strong {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

.hint {
  font-size: 12px;
  color: #6b7280;
}

.empty {
  padding: 18px 6px;
  border: 1px dashed rgba(17, 24, 39, 0.18);
  border-radius: 12px;
  background: #fafafa;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.empty-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-item {
  display: grid;
  grid-template-columns: 64px 1fr 120px;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  background: #fff;
}

.cart-media {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.cart-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cart-image.placeholder {
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.cart-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.cart-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cart-price {
  font-size: 13px;
  font-weight: 800;
  color: #ef4444;
}

.qty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 4px 6px;
}

.qty-btn {
  width: 28px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  cursor: pointer;
}

.qty-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.qty-value {
  min-width: 22px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: #111827;
}

.cart-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
}

.cart-line {
  font-size: 12px;
  color: #6b7280;
}

.cart-subtotal {
  font-size: 13px;
  font-weight: 800;
  color: #111827;
}

.link-danger {
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 12px;
  color: #dc2626;
  padding: 0;
}

.detail {
  margin-top: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.detail-title {
  font-size: 12px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
  