import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5178,
  },
  define: {
    'process.env': { TINY_MODE: 'pc' },
  },
});
