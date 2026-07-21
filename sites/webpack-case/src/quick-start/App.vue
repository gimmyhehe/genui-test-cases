<script setup>
import { ref } from 'vue';
import { GenuiChat } from '@opentiny/genui-sdk-vue';

const url = 'http://localhost:3100/chat/completions';
const model = ref('deepseek-v4-flash');
const temperature = ref(0.7);
</script>

<template>
    <GenuiChat :url="url" :model="model" :temperature="temperature">
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
</style>
