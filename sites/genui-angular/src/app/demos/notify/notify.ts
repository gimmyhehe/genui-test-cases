import { Component, signal } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer, type NotifyHandler } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';

interface Toast {
  id: number;
  type: string;
  message: string;
}

/**
 * notify 用于接管渲染器内部的提示（例如 JSFunction 执行报错、函数声明解析失败）。
 * 不传时渲染器会使用内置的 DOM toast，这里换成本页自定义的样式。
 */
const schema = {
  componentName: 'Page',
  props: { style: 'max-width: 620px;' },
  children: [
    {
      componentName: 'TiCard',
      props: { header: 'Notify（genui-config-provider 的 notify 输入）' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
          children: [
            {
              componentName: 'p',
              props: { style: 'margin: 0; color: #6b7280; font-size: 13px;' },
              children: '点击下面的按钮，让 Schema 里的 JSFunction 抛错，渲染器会调用宿主注入的 notify。',
            },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
              children: [
                {
                  componentName: 'TiButton',
                  props: {
                    color: 'primary',
                    onClick: {
                      type: 'JSFunction',
                      value: "function boom() { throw new Error('这是一个同步错误示例') }",
                    },
                  },
                  children: '触发同步错误',
                },
                {
                  componentName: 'TiButton',
                  props: {
                    onClick: {
                      type: 'JSFunction',
                      value: "function boomAsync() { return Promise.reject(new Error('这是一个异步错误示例')) }",
                    },
                  },
                  children: '触发异步错误',
                },
                {
                  componentName: 'TiButton',
                  props: {
                    onClick: { type: 'JSFunction', value: 'function () { this.notExistMethod() }' },
                  },
                  children: '调用不存在的方法',
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
  selector: 'demo-notify',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        1.4.0 为 <code>genui-config-provider</code> 新增 <code>notify</code> 输入：渲染器内部的错误提示会转发给宿主，
        便于接入自家 UI 组件库的消息中心。
      </p>

      <genui-config-provider [materials]="materials" [notify]="notify">
        <genui-renderer [content]="schema"></genui-renderer>
      </genui-config-provider>

      <div style="position: fixed; right: 24px; bottom: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 20;">
        @for (toast of toasts(); track toast.id) {
          <div
            [style.background]="palette[toast.type] || palette['info']"
            [style.border]="'1px solid ' + (border[toast.type] || border['info'])"
            style="min-width: 240px; padding: 10px 14px; border-radius: 8px; font-size: 13px; box-shadow: 0 6px 18px rgba(0,0,0,0.08);"
          >
            {{ toast.message }}
          </div>
        }
      </div>
    </div>
  `,
})
export class NotifyDemo {
  protected readonly materials = materials;
  protected readonly schema = schema;
  protected readonly toasts = signal<Toast[]>([]);

  protected readonly palette: Record<string, string> = {
    success: '#f6ffed',
    warning: '#fffbe6',
    error: '#fff2f0',
    info: '#e6f4ff',
  };

  protected readonly border: Record<string, string> = {
    success: '#b7eb8f',
    warning: '#ffe58f',
    error: '#ffccc7',
    info: '#91caff',
  };

  protected readonly notify: NotifyHandler = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    this.toasts.update((prev) => [...prev, { id, type, message: [title, message].filter(Boolean).join(' · ') }]);
    window.setTimeout(() => {
      this.toasts.update((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };
}
