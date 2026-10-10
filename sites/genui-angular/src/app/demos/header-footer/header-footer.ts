import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

const schema = {
  componentName: 'Page',
  state: { total: 128 },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '渲染器插槽内容' },
      children: [
        {
          componentName: 'p',
          props: { style: 'margin: 0; color: #6b7280;' },
          children: 'headerTemplate / footerTemplate 会替换渲染器默认的头部与底部区域。',
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-header-footer',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        <code>genui-renderer</code> 支持通过 <code>&lt;ng-template #headerTemplate&gt;</code> /
        <code>#footerTemplate</code> 投影自定义插槽，适合放标题栏、操作按钮、状态栏等。
      </p>

      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema">
          <ng-template #headerTemplate>
            <div
              style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: #eef4ff; color: #1d39c4; font-size: 13px;"
            >
              <strong>自定义 Header</strong>
              <span>来自 Angular 模板</span>
            </div>
          </ng-template>
          <ng-template #footerTemplate>
            <div
              style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-top: 8px; border-radius: 8px; background: #f6ffed; color: #237804; font-size: 13px;"
            >
              <span>自定义 Footer</span>
              <span>共 {{ schema.state.total }} 条记录</span>
            </div>
          </ng-template>
        </genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class HeaderFooter {
  protected readonly materials = materials;
  protected readonly schema = schema;
}
