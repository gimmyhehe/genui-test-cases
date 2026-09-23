<script setup lang="ts">
import { ref } from 'vue';
import copy from 'clipboard-copy';
import type { CardSchema } from '@opentiny/genui-sdk-core';

defineProps<{
  schema: CardSchema;
  isError: boolean;
  isFinished: boolean;
}>();

const copied = ref(false);

async function copySchema(schema: CardSchema) {
  await copy(JSON.stringify(schema, null, 2));
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div v-if="isFinished && !isError" class="schema-footer">
    <button type="button" class="copy-btn" @click="copySchema(schema)">
      {{ copied ? '已复制' : '复制 Schema' }}
    </button>
  </div>
</template>

<style scoped>
.schema-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 0;
}

.copy-btn {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
}

.copy-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}
</style>
