<template>
  <div class="legacy-demo">
    <header class="toolbar">
      <h1>GenuiLegacyConfigProvider（1.4.0 新增）</h1>
      <p>
        1.4.0 新增 <code>GenuiLegacyConfigProvider</code>：它内置了默认的 OpenTiny 物料，配合
        <code>GenuiLegacyRenderer</code> 可以直接渲染，无需显式传入 materials，方便旧版本项目平滑升级。
      </p>
      <p class="warn">
        注意：该组件与 <code>GenuiLegacyRenderer</code> 都标记为 <code>@deprecated</code>，新项目请使用
        <code>GenuiConfigProvider</code> + <code>GenuiRenderer</code> 并显式提供物料。
      </p>
    </header>

    <GenuiLegacyConfigProvider theme="light" class="renderer-wrap">
      <GenuiLegacyRenderer :content="schema" :generating="false">
        <template #header="{ isFinished }">
          <div class="slot slot-header">LegacyRenderer header · {{ isFinished ? '已完成' : '渲染中' }}</div>
        </template>
        <template #footer>
          <div class="slot slot-footer">LegacyRenderer footer</div>
        </template>
      </GenuiLegacyRenderer>
    </GenuiLegacyConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { GenuiLegacyConfigProvider } from '@opentiny/genui-sdk-vue/legacy-config-provider';
import { GenuiLegacyRenderer } from '@opentiny/genui-sdk-vue/legacy-renderer';

const schema = {
  componentName: 'Page',
  state: {
    items: ['无需传入 materials', '仍然支持 state / methods', '可通过插槽定制头尾'],
    count: 0,
  },
  methods: {
    handleAdd: {
      type: 'JSFunction',
      value: 'function handleAdd() { this.state.count = this.state.count + 1 }',
    },
  },
  props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: '旧版入口直接渲染' },
      children: [
        {
          componentName: 'ul',
          props: { style: 'margin: 0; padding-left: 18px; line-height: 2;' },
          children: [
            {
              componentName: 'li',
              loop: { type: 'JSExpression', value: 'this.state.items' },
              loopArgs: ['item'],
              children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'item' } } }],
            },
          ],
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; align-items: center; gap: 12px;' },
          children: [
            {
              componentName: 'Text',
              props: { text: { type: 'JSExpression', value: '"count = " + this.state.count' } },
            },
            {
              componentName: 'TinyButton',
              props: {
                text: '加一',
                type: 'primary',
                onClick: { type: 'JSExpression', value: 'this.handleAdd' },
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
.legacy-demo {
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

.toolbar .warn {
  color: #d46b08;
}

.renderer-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slot {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.slot-header {
  margin-bottom: 8px;
  background: #eef4ff;
  color: #1d39c4;
}

.slot-footer {
  margin-top: 8px;
  background: #f6ffed;
  color: #237804;
}
</style>
