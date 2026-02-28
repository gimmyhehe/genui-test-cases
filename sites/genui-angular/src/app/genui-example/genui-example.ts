import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { fetchSchemaStream } from '../../fetch-schema-stream';

@Component({
  selector: 'genui-example',
  imports: [FormsModule, GenuiRenderer],
  template: `
    <div class="demo-container">
      <div class="input-group">
        <input
          [(ngModel)]="inputText"
          type="text"
          placeholder="请输入问题..."
          (keyup.enter)="handleSend()"
        />
        <button (click)="handleSend()">发送</button>
      </div>
      <genui-renderer [content]="schema"></genui-renderer>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 16px;
        box-sizing: border-box;
      }

      .input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      button {
        padding: 8px 16px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class GenuiExample {
  inputText = '';
  schema = '';
  generating = false;

  async handleSend() {
    if (!this.inputText.trim() || this.generating) return;

    this.generating = true;
    this.schema = '';
    const userInput = this.inputText;
    this.inputText = '';

    try {
      await fetchSchemaStream(
        'http://localhost:3100/chat/completions',
        userInput,
        (schemaChunk: string) => {
          this.schema += schemaChunk;
        }
      );
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      this.generating = false;
    }
  }
}
