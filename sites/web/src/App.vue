<template>
  <div class="playground">
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <a class="brand" href="#/demos/start-with-renderer" @click="closeSidebar">
          <span class="brand-mark" aria-hidden="true">G</span>
          <span>
            <strong>GenUI</strong>
            <small>SDK Playground</small>
          </span>
        </a>
        <button class="icon-button sidebar-close" type="button" aria-label="关闭 demo 列表" @click="closeSidebar">
          ×
        </button>
      </div>

      <div class="sidebar-intro">
        <div class="eyebrow">EXAMPLES / {{ demoRegistry.length }}</div>
        <h1>探索全部 Demo</h1>
        <p>选择一个案例，立即查看 GenUI SDK 的能力。</p>
      </div>

      <label class="search-box">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input v-model="searchText" type="search" placeholder="搜索 demo" aria-label="搜索 demo" />
        <kbd v-if="!searchText">⌘ K</kbd>
      </label>

      <nav class="demo-nav" aria-label="Demo 列表">
        <section v-for="category in visibleCategories" :key="category" class="demo-group">
          <div class="group-title">
            <span>{{ category }}</span>
            <span class="group-count">{{ groupedDemos[category].length }}</span>
          </div>
          <button
            v-for="demo in groupedDemos[category]"
            :key="demo.id"
            class="demo-link"
            :class="{ active: demo.id === activeDemo.id }"
            type="button"
            @click="selectDemo(demo.id)"
          >
            <span class="demo-dot" :class="`dot-${categoryIndex(category)}`" aria-hidden="true"></span>
            <span class="demo-link-copy">
              <strong>{{ demo.title }}</strong>
              <small>{{ demo.description }}</small>
            </span>
            <span v-if="demo.id === activeDemo.id" class="active-indicator" aria-hidden="true">↗</span>
          </button>
        </section>
        <div v-if="visibleCategories.length === 0" class="empty-search">没有找到匹配的 demo</div>
      </nav>

      <div class="sidebar-footer">
        <span class="status-dot" aria-hidden="true"></span>
        <span>Vue playground</span>
        <span class="footer-version">v1.3</span>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <button class="icon-button menu-button" type="button" aria-label="打开 demo 列表" @click="sidebarOpen = true">
          ☰
        </button>
        <div class="breadcrumbs">
          <span>Playground</span>
          <span class="breadcrumb-divider">/</span>
          <span class="breadcrumb-current">{{ activeDemo.title }}</span>
        </div>
        <div class="topbar-actions">
          <span class="route-hint">{{ activeDemo.category }}</span>
          <a class="source-link" href="https://github.com/opentiny/genui-sdk" target="_blank" rel="noreferrer">
            SDK docs <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main class="demo-area" @click="closeSidebar">
        <div class="demo-heading">
          <div>
            <div class="demo-overline">{{ activeDemo.category }} · {{ activeDemo.id }}</div>
            <h2>{{ activeDemo.title }}</h2>
            <p>{{ activeDemo.description }}</p>
          </div>
          <div class="demo-counter">
            <span class="counter-current">{{ String(activeIndex + 1).padStart(2, '0') }}</span>
            <span class="counter-slash">/</span>
            <span>{{ String(demoRegistry.length).padStart(2, '0') }}</span>
          </div>
        </div>

        <div class="demo-frame" :class="{ 'demo-frame-loading': isLoading }">
          <Suspense>
            <KeepAlive>
              <component :is="activeDemo.component" :key="activeDemo.id" />
            </KeepAlive>
            <template #fallback>
              <div class="loading-state">
                <span class="loading-spinner" aria-hidden="true"></span>
                正在载入 {{ activeDemo.title }}…
              </div>
            </template>
          </Suspense>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { demoCategories, demoRegistry, findDemo, type DemoCategory } from './demo-registry';

const searchText = ref('');
const sidebarOpen = ref(false);
const isLoading = ref(false);
const routeDemoId = ref(readRouteDemoId());

const activeDemo = computed(() => findDemo(routeDemoId.value));
const activeIndex = computed(() => demoRegistry.findIndex((demo) => demo.id === activeDemo.value.id));

const filteredDemos = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  if (!keyword) return demoRegistry;
  return demoRegistry.filter((demo) =>
    [demo.title, demo.description, demo.id, demo.category].some((value) => value.toLowerCase().includes(keyword)),
  );
});

const groupedDemos = computed(() =>
  demoCategories.reduce(
    (groups, category) => {
      groups[category] = filteredDemos.value.filter((demo) => demo.category === category);
      return groups;
    },
    {} as Record<DemoCategory, typeof demoRegistry>,
  ),
);

const visibleCategories = computed(() => demoCategories.filter((category) => groupedDemos.value[category].length > 0));

function readRouteDemoId() {
  const match = window.location.hash.match(/^#\/demos\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function selectDemo(id: string) {
  if (id === activeDemo.value.id) {
    closeSidebar();
    return;
  }
  isLoading.value = true;
  window.location.hash = `/demos/${encodeURIComponent(id)}`;
  closeSidebar();
  nextTick(() => {
    window.setTimeout(() => {
      isLoading.value = false;
    }, 160);
  });
}

function syncRoute() {
  routeDemoId.value = readRouteDemoId();
  sidebarOpen.value = false;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function categoryIndex(category: DemoCategory) {
  return demoCategories.indexOf(category) + 1;
}

function focusSearch(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.querySelector<HTMLInputElement>('.search-box input')?.focus();
  }
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('keydown', focusSearch);
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute);
  window.removeEventListener('keydown', focusSearch);
});
</script>
