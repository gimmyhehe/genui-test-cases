<template>
  <GenuiConfigProvider :materials="materials">
    <div class="demo-container">
      <div class="input-group">
        <input v-model="inputText" placeholder="请输入问题..." @keyup.enter="handleSend" />
        <button @click="handleSend">发送</button>
      </div>
      <GenuiRenderer :content="schema" :key="rendererKey" />
    </div>
  </GenuiConfigProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GenuiRenderer } from '@opentiny/genui-sdk-vue/renderer';
import { GenuiConfigProvider } from '@opentiny/genui-sdk-vue/config-provider';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';
import { fetchSchemaStream } from './fetch-schema-stream';

const inputText = ref('');
const schema = ref<any>({ componentName: 'Page', children: [] });
const rendererKey = ref(0);
const generating = ref(false);

const handleSend = async () => {
  if (!inputText.value.trim() || generating.value) return;

  generating.value = true;
  schema.value = '';
  rendererKey.value++;
  const userInput = inputText.value;
  inputText.value = '';

  try {
    await fetchSchemaStream('http://localhost:3100/chat/completions', userInput, (schemaChunk) => {
      schema.value += schemaChunk;
    });
  } catch (error) {
    console.error('请求失败:', error);
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
.demo-container {
  padding: 16px;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
