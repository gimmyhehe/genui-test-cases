import { createApp } from 'vue';
import '@opentiny/vue-theme/index.css';
import App from './App.vue';
import './style.css';

export function bootstrap() {
  createApp(App).mount('#app');
}
