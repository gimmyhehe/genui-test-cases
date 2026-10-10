import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';
import { ANGULAR_SERVER_URL, fetchSchemaStream } from '../../../fetch-schema-stream';

@Component({
  selector: 'demo-streaming-generate',
  imports: [FormsModule, GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        Angular 渲染器 + 本地 GenUI server（<code>pnpm -F genui-sdk-server dev</code>）。请求携带
        <code>metadata.tinygenui.framework = "Angular"</code>，服务端据此下发 Angular 物料提示词。
      </p>

      <div class="demo-toolbar">
        <input
          type="text"
          [(ngModel)]="inputText"
          placeholder="请输入问题..."
          (keyup.enter)="handleSend()"
        />
        <button class="primary" type="button" [disabled]="generating()" (click)="handleSend()">
          {{ generating() ? '生成中…' : '发送' }}
        </button>
        <button type="button" (click)="reset()">清空</button>
      </div>

      <div class="demo-toolbar">
        @for (preset of presets; track preset) {
          <button type="button" (click)="inputText = preset">{{ preset }}</button>
        }
      </div>

      @if (error()) {
        <div class="demo-error">{{ error() }}</div>
      }

      <genui-config-provider [materials]="materials">
        <genui-renderer [content]="schema()" [generating]="generating()"></genui-renderer>
      </genui-config-provider>

      @if (schema()) {
        <pre class="demo-meta">已接收 {{ schema().length }} 字符 schema</pre>
      }
    </div>
  `,
})
export class StreamingGenerate {
  protected readonly materials = materials;
  protected readonly presets = ['做一个员工信息表单', '生成一个带分页的订单表格', '展示一个产品卡片'];

  protected inputText = '';
  protected readonly schema = signal('');
  protected readonly generating = signal(false);
  protected readonly error = signal('');

  protected async handleSend(): Promise<void> {
    if (!this.inputText.trim() || this.generating()) return;

    this.generating.set(true);
    this.error.set('');
    this.schema.set('');
    const userInput = this.inputText;
    this.inputText = '';

    try {
      await fetchSchemaStream(ANGULAR_SERVER_URL, userInput, (chunk) => {
        this.schema.update((value) => value + chunk);
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.generating.set(false);
    }
  }

  protected reset(): void {
    this.schema.set('');
    this.error.set('');
  }
}
