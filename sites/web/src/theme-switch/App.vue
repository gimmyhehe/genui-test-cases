<template>
  <div class="theme-demo">
    <header class="toolbar">
      <h1>主题系统（1.4.0 新增 themeFactory）</h1>
      <p>
        1.4.0 把主题实现从框架层下沉到 <code>materials.themeFactory</code>：
        <code>GenuiConfigProvider</code> 的 <code>theme</code> 现在是字符串，由物料的 themeFactory 决定可用主题。
        OpenTiny 物料内置 <code>light</code> / <code>dark</code> / <code>lite</code>，另支持 <code>auto</code> 跟随系统。
      </p>

      <div class="actions">
        <button
          v-for="option in themeOptions"
          :key="option"
          type="button"
          :class="{ active: theme === option }"
          @click="theme = option"
        >
          {{ option }}
        </button>
      </div>

      <div class="meta">
        当前 theme：<strong>{{ theme }}</strong> · 系统偏好：{{ systemTheme }} · themeFactory：
        {{ hasThemeFactory ? '已接入' : '未接入' }} · 可用主题：{{ availableThemes.join(' / ') }}
      </div>
    </header>

    <GenuiConfigProvider :materials="materials" :theme="theme" class="renderer-wrap">
      <GenuiRenderer :content="schema" :generating="false" />
    </GenuiConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { GenuiConfigProvider, GenuiRenderer, useMediaTheme } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue';

const themeOptions = ['light', 'dark', 'lite', 'auto'] as const;
const theme = ref<(typeof themeOptions)[number]>('light');

const { theme: systemTheme } = useMediaTheme();

/** 通过 materials.themeFactory() 读取物料声明的主题列表 */
const availableThemes = computed(() => {
  const factory = materials.themeFactory;
  if (!factory) return [];
  const instance = factory();
  return (instance.themes ?? []).map((item) => item.id);
});

const hasThemeFactory = computed(() => typeof materials.themeFactory === 'function');

const schema = {
  componentName: 'Page',
  state: {
    name: 'OpenTiny',
    dark: false,
    tabs: ['概览', '配置'],
    options: [
      { label: '选项一', value: '1' },
      { label: '选项二', value: '2' },
    ],
    selectValue: '1',
  },
  methods: {
    handleClick: {
      type: 'JSFunction',
      value: "function handleClick() { console.log('theme demo click') }",
    },
  },
  props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: '主题预览' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
          children: [
            {
              componentName: 'TinyForm',
              props: { labelWidth: '80px' },
              children: [
                {
                  componentName: 'TinyFormItem',
                  props: { label: '名称' },
                  children: [
                    {
                      componentName: 'TinyInput',
                      props: {
                        placeholder: '请输入名称',
                        modelValue: { type: 'JSExpression', model: true, value: 'this.state.name' },
                      },
                    },
                  ],
                },
                {
                  componentName: 'TinyFormItem',
                  props: { label: '下拉' },
                  children: [
                    {
                      componentName: 'TinySelect',
                      props: {
                        options: { type: 'JSExpression', value: 'this.state.options' },
                        modelValue: { type: 'JSExpression', model: true, value: 'this.state.selectValue' },
                      },
                    },
                  ],
                },
                {
                  componentName: 'TinyFormItem',
                  props: { label: '开关' },
                  children: [
                    {
                      componentName: 'TinySwitch',
                      props: {
                        modelValue: { type: 'JSExpression', model: true, value: 'this.state.dark' },
                      },
                    },
                  ],
                },
              ],
            },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 8px;' },
              children: [
                {
                  componentName: 'TinyButton',
                  props: {
                    text: '主要按钮',
                    type: 'primary',
                    onClick: { type: 'JSExpression', value: 'this.handleClick' },
                  },
                },
                {
                  componentName: 'TinyButton',
                  props: { text: '次要按钮', onClick: { type: 'JSExpression', value: 'this.handleClick' } },
                },
                {
                  componentName: 'TinyButton',
                  props: { text: '文字按钮', type: 'text', onClick: { type: 'JSExpression', value: 'this.handleClick' } },
                },
              ],
            },
            {
              componentName: 'TinyGrid',
              props: {
                data: [
                  { id: '1', name: '张三', dept: '技术部' },
                  { id: '2', name: '李四', dept: '市场部' },
                ],
                columns: [
                  { field: 'id', title: '工号', width: 80 },
                  { field: 'name', title: '姓名', width: 120 },
                  { field: 'dept', title: '部门', width: 140 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
</script>

<style scoped>
.theme-demo {
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
  flex-wrap: wrap;
}

.actions button {
  padding: 8px 16px;
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
  gap: 16px;
}
</style>
