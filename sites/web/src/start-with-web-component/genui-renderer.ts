import { defineComponent, defineCustomElement, h } from 'vue';
import { GenuiRenderer } from '@opentiny/genui-sdk-vue/renderer';
import { GenuiConfigProvider } from '@opentiny/genui-sdk-vue/config-provider';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';

const tagName = 'genui-renderer';

// 自定义元素运行在独立的 Vue 应用实例中，无法从宿主的 ConfigProvider 注入物料，
// 所以在这里内置一层 ConfigProvider，并显式提供物料。
const GenuiRendererElement = defineComponent({
  name: 'GenuiRendererElement',
  props: GenuiRenderer.props,
  setup(props) {
    return () =>
      h(GenuiConfigProvider, { materials }, () => h(GenuiRenderer as never, { ...props } as never));
  },
});

if (!customElements.get(tagName)) {
  customElements.define(tagName, defineCustomElement(GenuiRendererElement));
}
