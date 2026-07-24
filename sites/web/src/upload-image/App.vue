<template>
  <GenuiConfigProvider :materials="materials">
    <div class="chat-container">
      <GenuiChat :url="url" :features="modelFeatures" :customFetch="customFetch" model="qwen/qwen-vl-max"/>
    </div>
  </GenuiConfigProvider>
</template>

<script setup lang="ts">
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';
import { GenuiConfigProvider, GenuiChat } from '@opentiny/genui-sdk-vue';
import { customFetch } from './custom-fetch';

const url = 'http://localhost:3100/chat/completions';


const modelFeatures = {
  supportImage: {
    enabled: true,
    maxImageSize: 10,
    maxFilesPerRequest: 3,
    supportedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 400px;
}
</style>
