import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { GenuiConfigProvider, GenuiRenderer, type ICustomAction } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

interface LogItem {
  action: string;
  params: unknown;
  at: string;
}

const schema = {
  componentName: 'Page',
  state: { count: 0, selected: '' },
  props: { style: 'max-width: 560px;' },
  children: [
    {
      componentName: 'TiCard',
      props: { header: 'Custom Actions（callAction）' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
          children: [
            {
              componentName: 'TiSelect',
              props: {
                placeholder: '选择一个部门',
                options: [
                  { label: '技术部', value: 'eng' },
                  { label: '产品部', value: 'pm' },
                ],
                ngModel: { type: 'JSExpression', model: true, value: 'this.state.selected' },
                ngModelChange: {
                  type: 'JSFunction',
                  value: "function(value) { this.callAction('logSelection', { value: value }) }",
                },
              },
              directives: [{ directiveName: 'ngModel' }],
            },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 8px;' },
              children: [
                {
                  componentName: 'TiButton',
                  props: {
                    color: 'primary',
                    onClick: {
                      type: 'JSFunction',
                      value:
                        "function() { this.state.count = this.state.count + 1; this.callAction('increase', { count: this.state.count }) }",
                    },
                  },
                  children: '自增并上报宿主',
                },
                {
                  componentName: 'TiButton',
                  props: {
                    onClick: {
                      type: 'JSFunction',
                      value: "function() { this.callAction('notifyHost', { count: this.state.count }) }",
                    },
                  },
                  children: '仅通知宿主',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-custom-actions',
  imports: [JsonPipe, GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        <code>customActions</code> 让 Schema 通过 <code>this.callAction(name, params)</code> 调用宿主能力，宿主侧收到
        <code>(params, context)</code>。
      </p>

      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema" [customActions]="customActions"></genui-renderer>
      </genui-config-provider>

      <div class="demo-panel" style="margin-top: 16px;">
        <div class="demo-meta" style="margin: 0;">已触发 {{ logs().length }} 次：</div>
        <ul style="margin: 8px 0 0; padding-left: 18px; font-size: 13px;">
          @for (log of logs(); track log.at + log.action) {
            <li><strong>{{ log.action }}</strong> · {{ log.at }} · {{ log.params | json }}</li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class CustomActions {
  protected readonly materials = materials;
  protected readonly schema = schema;
  protected readonly logs = signal<LogItem[]>([]);

  protected readonly customActions: Record<string, ICustomAction> = {
    increase: {
      execute: (params: unknown) => this.push('increase', params),
    },
    logSelection: {
      execute: (params: unknown) => this.push('logSelection', params),
    },
    notifyHost: {
      execute: (params: unknown) => {
        this.push('notifyHost', params);
        window.alert(`宿主收到 notifyHost：${JSON.stringify(params)}`);
      },
    },
  };

  private push(action: string, params: unknown): void {
    const at = new Date().toLocaleTimeString();
    this.logs.update((prev) => [{ action, params, at }, ...prev].slice(0, 12));
  }
}
