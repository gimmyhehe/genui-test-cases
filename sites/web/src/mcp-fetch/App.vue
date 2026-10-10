<template>
  <div class="app-container">
    <GenuiConfigProvider :materials="materials">
      <GenuiChat
        ref="chat"
        url="http://localhost:3100/"
        :customFetch="replayCustomFetch"
        model="deepseek-v4-flash"
        :temperature="0.5"
        :chat-config="config"
      />
    </GenuiConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { GenuiChat, GenuiConfigProvider } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';
import { replayCustomFetch } from './index';
import { defaultCustomFetch } from './custom-fetch';

const config = {
  addToolCallContext: true,
  showThinkingResult: true,
};

const chat = ref();

onMounted(() => {
  // @ts-ignore
  window.chat = chat.value?.getConversation();
});
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
