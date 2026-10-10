<template>
  <div class="codegen-demo">
    <header class="toolbar">
      <h1>Schema → Vue SFC 代码生成（1.4.0 新增）</h1>
      <p>
        <code>generateCode()</code> 是 1.4.0 新增的代码导出能力：把 GenUI Schema 反向生成可运行的 Vue 单文件组件，
        并通过 <code>@vue/compiler-sfc</code> 做编译校验。
      </p>

      <div class="actions">
        <button type="button" class="primary" :disabled="loading" @click="runGenerate">
          {{ loading ? '生成中…' : '生成代码' }}
        </button>
        <button type="button" :disabled="!code" @click="copyCode">复制代码</button>
        <button type="button" class="ghost" @click="reset">重置</button>
      </div>

      <div class="meta">
        状态：{{ status }} · 文件名：{{ panelName || '-' }} · 错误：{{ errors.length }}
      </div>
    </header>

    <div class="panes">
      <section class="pane">
        <div class="pane-title">输入 Schema</div>
        <pre class="code">{{ schemaText }}</pre>
      </section>
      <section class="pane">
        <div class="pane-title">生成的 Vue SFC</div>
        <pre class="code">{{ code || '点击上方「生成代码」查看结果' }}</pre>
      </section>
    </div>

    <div v-if="errors.length" class="errors">
      <div v-for="(error, index) in errors" :key="index">· {{ error.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CardSchema } from '@opentiny/genui-sdk-core';
import { generateCode, type ICodeGeneratorResult, type IComponentMapItem } from '@opentiny/genui-sdk-vue/code-generator';

const schema: CardSchema = {
  componentName: 'Page',
  state: {
    name: '张三',
    count: 1,
    options: [
      { label: '技术部', value: 'eng' },
      { label: '产品部', value: 'pm' },
    ],
    department: 'eng',
  },
  methods: {
    handleAdd: {
      type: 'JSFunction',
      value: 'function handleAdd() { this.state.count = this.state.count + 1 }',
    },
    handleSubmit: {
      type: 'JSFunction',
      value: "function handleSubmit() { console.log('submit', this.state.name, this.state.department) }",
    },
  },
  props: { style: 'padding: 16px;' },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: '员工入职登记' },
      children: [
        {
          componentName: 'TinyForm',
          props: { labelWidth: '80px' },
          children: [
            {
              componentName: 'TinyFormItem',
              props: { label: '姓名' },
              children: [
                {
                  componentName: 'TinyInput',
                  props: {
                    placeholder: '请输入姓名',
                    modelValue: { type: 'JSExpression', model: true, value: 'this.state.name' },
                  },
                },
              ],
            },
            {
              componentName: 'TinyFormItem',
              props: { label: '部门' },
              children: [
                {
                  componentName: 'TinySelect',
                  props: {
                    options: { type: 'JSExpression', value: 'this.state.options' },
                    modelValue: { type: 'JSExpression', model: true, value: 'this.state.department' },
                  },
                },
              ],
            },
            {
              componentName: 'TinyFormItem',
              props: { label: '人数' },
              children: [
                {
                  componentName: 'div',
                  props: { style: 'display: flex; align-items: center; gap: 8px;' },
                  children: [
                    {
                      componentName: 'Text',
                      props: { text: { type: 'JSExpression', value: 'this.state.count' } },
                    },
                    {
                      componentName: 'TinyButton',
                      props: {
                        text: '增加',
                        type: 'primary',
                        onClick: { type: 'JSExpression', value: 'this.handleAdd' },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          componentName: 'TinyButton',
          props: { text: '提交', type: 'primary', onClick: { type: 'JSExpression', value: 'this.handleSubmit' } },
        },
      ],
    },
  ],
};

const componentsMap: IComponentMapItem[] = [
  { componentName: 'TinyCard', package: '@opentiny/vue', exportName: 'TinyCard' },
  { componentName: 'TinyForm', package: '@opentiny/vue', exportName: 'TinyForm' },
  { componentName: 'TinyFormItem', package: '@opentiny/vue', exportName: 'TinyFormItem' },
  { componentName: 'TinyInput', package: '@opentiny/vue', exportName: 'TinyInput' },
  { componentName: 'TinySelect', package: '@opentiny/vue', exportName: 'TinySelect' },
  { componentName: 'TinyButton', package: '@opentiny/vue', exportName: 'TinyButton' },
];

const schemaText = JSON.stringify(schema, null, 2);

const code = ref('');
const panelName = ref('');
const errors = ref<{ message: string }[]>([]);
const loading = ref(false);
const status = ref('待生成');

async function runGenerate() {
  loading.value = true;
  status.value = '生成中…';
  try {
    const result: ICodeGeneratorResult = await generateCode({
      pageInfo: { name: 'EmployeeForm', schema },
      componentsMap,
      formatWithPrettier: true,
    });
    code.value = result.panelValue;
    panelName.value = result.panelName;
    errors.value = result.errors ?? [];
    status.value = errors.value.length ? '生成完成（存在告警）' : '生成成功';
  } catch (error) {
    status.value = '生成失败';
    errors.value = [{ message: error instanceof Error ? error.message : String(error) }];
  } finally {
    loading.value = false;
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(code.value);
    status.value = '已复制到剪贴板';
  } catch {
    status.value = '复制失败，请手动选择';
  }
}

function reset() {
  code.value = '';
  panelName.value = '';
  errors.value = [];
  status.value = '待生成';
}
</script>

<style scoped>
.codegen-demo {
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

.actions button.primary {
  border-color: #1890ff;
  background: #1890ff;
  color: #fff;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions button.ghost {
  background: transparent;
}

.meta {
  font-size: 13px;
  color: #8c8c8c;
}

.panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.pane-title {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
  font-size: 13px;
  font-weight: 600;
}

.code {
  flex: 1;
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: #1f2937;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre;
}

.errors {
  padding: 10px 14px;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  background: #fff2f0;
  color: #cf1322;
  font-size: 13px;
}

@media (max-width: 900px) {
  .panes {
    grid-template-columns: 1fr;
  }
}
</style>
