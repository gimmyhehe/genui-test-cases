import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiLegacyRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schema = {
  componentName: 'Page',
  state: {
    items: ['旧版渲染入口', '仍支持 state / methods', '适合渐进升级'],
  },
  children: [
    {
      componentName: 'TiCard',
      props: { header: 'GenuiLegacyRenderer' },
      children: [
        {
          componentName: 'ul',
          props: { style: 'margin: 0; padding-left: 18px; line-height: 2;' },
          children: [
            {
              componentName: 'li',
              loop: { type: 'JSExpression', value: 'this.state.items' },
              loopArgs: ['item'],
              children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'item' } } }],
            },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-legacy-renderer',
  imports: [GenuiConfigProvider, GenuiLegacyRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        <code>genui-legacy-renderer</code> 是旧版渲染入口，仍保留 <code>state</code> /
        <code>generating</code> / <code>customComponents</code> 等输入，便于从旧版本渐进迁移。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-legacy-renderer [content]="schema"></genui-legacy-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class LegacyRendererDemo {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
