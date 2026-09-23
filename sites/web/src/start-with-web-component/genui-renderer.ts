import { defineCustomElement } from 'vue';
import { GenuiRenderer } from '@opentiny/genui-sdk-vue/renderer';

const tagName = 'genui-renderer';

if (!customElements.get(tagName)) {
  customElements.define(tagName, defineCustomElement(GenuiRenderer));
}
