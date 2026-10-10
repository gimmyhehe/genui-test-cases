<template>
  <div class="plus-materials-demo">
    <header class="toolbar">
      <h1>Plus 物料集（1.4.0 新增）</h1>
      <p>
        1.4.0 把 OpenTiny 物料拆成 Mini / Standard / Plus 三档。<code>plusMaterials</code> 在 Standard 基础上新增
        TinySteps、TinyCollapse、TinyTooltip、TinyIcon、TinyTimeLine、TinyTransfer、TinyTree、TinyCascader 等组件。
      </p>
      <div class="actions">
        <button type="button" @click="stepActive = Math.max(0, stepActive - 1)">上一步</button>
        <button type="button" @click="stepActive = Math.min(steps.length - 1, stepActive + 1)">下一步</button>
      </div>
      <div class="meta">
        当前物料：{{ materialCount }} 个组件 · 白名单：{{ whiteListCount }} 项 · 当前步骤：{{ stepActive + 1 }} /
        {{ steps.length }}
      </div>
    </header>

    <GenuiConfigProvider :materials="plusMaterials" theme="light" class="renderer-wrap">
      <GenuiRenderer :content="schema" :generating="false" />
    </GenuiConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-vue';
import { plusMaterials, plusMaterialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue';

const steps = ['创建订单', '风控审核', '出库发货', '确认收货'];

const stepActive = ref(0);

const materialCount = computed(() => Object.keys((plusMaterials.components as Record<string, unknown>) ?? {}).length);
const whiteListCount = computed(() => plusMaterialsMeta.whiteList?.length ?? 0);

const schema = {
  componentName: 'Page',
  state: {
    activeStep: 0,
    steps: steps.map((name) => ({ name })),
    timeline: [
      { name: '提交申请', time: '2026-10-08 09:12', status: 'done' },
      { name: '主管审批', time: '2026-10-08 14:30', status: 'done' },
      { name: '财务复核', time: '2026-10-09 10:05', status: 'doing' },
      { name: '完成', time: '--', status: 'wait' },
    ],
    collapsible: ['1'],
    transferValue: ['a'],
    transferData: [
      { key: 'a', label: '前端工程师' },
      { key: 'b', label: '后端工程师' },
      { key: 'c', label: '测试工程师' },
      { key: 'd', label: '产品经理' },
    ],
  },
  methods: {
    checkNode: {
      type: 'JSFunction',
      value: "function checkNode() { console.log('plus tier ready') }",
    },
  },
  props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: 'TinySteps · 流程步骤' },
      children: [
        {
          componentName: 'TinySteps',
          props: {
            data: { type: 'JSExpression', value: 'this.state.steps' },
            active: { type: 'JSExpression', value: 'this.state.activeStep' },
            advanced: true,
          },
        },
      ],
    },
    {
      componentName: 'TinyCard',
      props: { title: 'TinyCollapse · 折叠面板' },
      children: [
        {
          componentName: 'TinyCollapse',
          props: {
            modelValue: { type: 'JSExpression', model: true, value: 'this.state.collapsible' },
          },
          children: [
            {
              componentName: 'TinyCollapseItem',
              props: { name: '1', title: '为什么新增 Plus 物料？' },
              children: [
                {
                  componentName: 'p',
                  props: { style: 'margin: 0; line-height: 1.8;' },
                  children:
                    'Standard 物料只覆盖最常用组件，复杂业务需要 Tree、Transfer、Cascader、Steps 等。Plus 档位把这些组件统一纳入白名单与提示词。',
                },
              ],
            },
            {
              componentName: 'TinyCollapseItem',
              props: { name: '2', title: '如何切换物料档位？' },
              children: [
                {
                  componentName: 'p',
                  props: { style: 'margin: 0; line-height: 1.8;' },
                  children:
                    '从 @opentiny/genui-sdk-materials-vue-opentiny-vue 导入 materials / miniMaterials / plusMaterials 即可。',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      componentName: 'TinyCard',
      props: { title: 'TinyTimeLine · 时间线' },
      children: [
        {
          componentName: 'TinyTimeLine',
          props: {
            data: { type: 'JSExpression', value: 'this.state.timeline' },
            active: 2,
          },
        },
      ],
    },
    {
      componentName: 'TinyCard',
      props: { title: 'TinyTransfer · 穿梭框' },
      children: [
        {
          componentName: 'TinyTransfer',
          props: {
            data: { type: 'JSExpression', value: 'this.state.transferData' },
            modelValue: { type: 'JSExpression', model: true, value: 'this.state.transferValue' },
            filterable: true,
            titles: ['可选岗位', '已选岗位'],
          },
        },
      ],
    },
    {
      componentName: 'TinyCard',
      props: { title: 'TinyIcon + TinyTooltip + TinyButtonGroup' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; align-items: center; gap: 16px;' },
          children: [
            {
              componentName: 'TinyTooltip',
              props: { content: '这是 Plus 档位新增的 TinyTooltip', placement: 'top' },
              children: [
                {
                  componentName: 'TinyIcon',
                  props: { name: 'IconHelpCircle', style: 'font-size: 20px; color: #1677ff;' },
                },
              ],
            },
            {
              componentName: 'TinyButtonGroup',
              props: {
                data: [
                  { text: '新增', icon: 'IconPlus' },
                  { text: '导出', icon: 'IconDownload' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};

// 宿主侧的步骤索引同步进 Schema state，演示 Vue 状态与 Schema 的联动
watch(
  stepActive,
  (value) => {
    (schema.state as Record<string, unknown>).activeStep = value;
  },
  { immediate: true },
);
</script>

<style scoped>
.plus-materials-demo {
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
