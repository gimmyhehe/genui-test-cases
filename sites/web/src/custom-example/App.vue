<script setup lang="ts">
import { ref } from 'vue';
import { GenuiChat } from '@opentiny/genui-sdk-vue';
import { customExamples } from './custom-examples';

const url = 'http://localhost:3100/chat/completions';
const model = ref('deepseek-v3.2');
const temperature = ref(0.7);
const messages = ref([
    {
        role: 'user',
        content: '生成一个数据看板',
    },
    {
      role: 'assistant',
      content: '',
      messages: [
        {
          type: 'schema-card',
          content: JSON.stringify(customExamples[0].schema),
        },
      ],
    }
]);
</script>

<template>
    <GenuiChat :url="url" :model="model" :temperature="temperature" :customExamples="customExamples" :messages="messages">
        <template #empty>
        <div class="empty-text">欢迎使用生成式UI</div>
        </template>
    </GenuiChat>
</template>

<style>
body,
html {
  padding: 0;
  margin: 0;
}
#app {
  position: fixed;
  width: 100vw;
  height: 100vh;
}
.tiny-config-provider {
  height: 100%;
}
.empty-text {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}
.schema-render-container { width: 1600px; }
</style>
