<template>
  <div class="notify-demo">
    <header class="toolbar">
      <h1>Notify（1.4.0 新增 notify 属性）</h1>
      <p>
        <code>GenuiConfigProvider</code> 新增 <code>notify</code> 属性：渲染器内部产生提示时（例如 Schema 里的
        JSFunction 执行报错、函数声明解析失败），会转发给宿主注入的处理器；不传则回退到内置的 DOM toast。
      </p>

      <div class="actions">
        <button type="button" :class="{ active: useCustomNotify }" @click="useCustomNotify = true">
          使用自定义 notify
        </button>
        <button type="button" :class="{ active: !useCustomNotify }" @click="useCustomNotify = false">
          使用内置 notify
        </button>
      </div>

      <div class="meta">已捕获 {{ toasts.length }} 条提示 · 当前：{{ useCustomNotify ? '自定义' : '内置' }}</div>
    </header>

    <GenuiConfigProvider :materials="materials" :notify="useCustomNotify ? notify : undefined" theme="light" class="renderer-wrap">
      <GenuiRenderer :content="schema" :generating="false" />
    </GenuiConfigProvider>

    <transition-group name="toast" tag="div" class="toast-stack">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
        <strong v-if="toast.title">{{ toast.title }}</strong>
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GenuiConfigProvider, GenuiRenderer, type NotifyHandler } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue';

interface Toast {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
}

const useCustomNotify = ref(true);
const toasts = ref<Toast[]>([]);
let seq = 0;

const notify: NotifyHandler = (options) => {
  seq += 1;
  const toast: Toast = {
    id: seq,
    type: options.type ?? 'info',
    title: options.title,
    message: options.message,
  };
  toasts.value.push(toast);
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== toast.id);
  }, options.duration ?? 3200);
};

const schema = {
  componentName: 'Page',
  state: { count: 0 },
  props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: '触发渲染器内部提示' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
          children: [
            {
              componentName: 'p',
              props: { style: 'margin: 0; color: #6b7280; font-size: 13px;' },
              children: '下面三个按钮都会让 Schema 中的 JSFunction 出错，从而触发 notify。',
            },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
              children: [
                {
                  componentName: 'TinyButton',
                  props: {
                    text: '同步错误',
                    type: 'primary',
                    onClick: {
                      type: 'JSFunction',
                      value: "function syncError() { throw new Error('这是一个同步错误示例') }",
                    },
                  },
                },
                {
                  componentName: 'TinyButton',
                  props: {
                    text: '异步错误',
                    onClick: {
                      type: 'JSFunction',
                      value: "function asyncError() { return Promise.reject(new Error('这是一个异步错误示例')) }",
                    },
                  },
                },
                {
                  componentName: 'TinyButton',
                  props: {
                    text: '调用不存在的方法',
                    onClick: {
                      type: 'JSFunction',
                      value: 'function callMissing() { this.notExistMethod() }',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
</script>

<style scoped>
.notify-demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
  background: #f7f8fa;
  overflow: auto;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar h1 {
  margin: 0;
  font-size: 20px;
}

.toolbar p {
  margin: 0;
  color: #595959;
  font-size: 14px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.actions button.active {
  border-color: #191919;
  background: #191919;
  color: #fff;
}

.meta {
  font-size: 13px;
  color: #8c8c8c;
}

.renderer-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast-stack {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  min-width: 240px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast-warning {
  background: #fffbe6;
  border-color: #ffe58f;
}

.toast-error {
  background: #fff2f0;
  border-color: #ffccc7;
}

.toast-success {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.toast-info {
  background: #e6f4ff;
  border-color: #91caff;
}
</style>
