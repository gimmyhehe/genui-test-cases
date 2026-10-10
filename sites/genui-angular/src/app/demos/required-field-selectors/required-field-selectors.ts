import { Component, computed, signal } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials, materialsMeta } from '@opentiny/genui-sdk-materials-angular-opentiny-ng';

const fullSchema = JSON.stringify(
  {
    componentName: 'Page',
    state: {
      options: [
        { label: '技术部', value: 'eng' },
        { label: '产品部', value: 'pm' },
        { label: '设计部', value: 'design' },
      ],
    },
    children: [
      {
        componentName: 'TiCard',
        props: { header: 'Required Complete Field Selectors' },
        children: [
          {
            componentName: 'div',
            props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
            children: [
              {
                componentName: 'TiSelect',
                props: {
                  placeholder: '请选择部门',
                  options: { type: 'JSExpression', value: 'this.state.options' },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  null,
  2,
);

const STEP = 32;

const FALLBACK_SELECTORS = ['[componentName=TiSelect] > props > options > * > label'];

@Component({
  selector: 'demo-required-field-selectors',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        <code>requiredCompleteFieldSelectors</code> 告诉渲染器：这些字段没写完整时先不要渲染，避免流式过程中出现「半截」UI。
        下方列表来自 Angular 物料的 <code>requiredCompleteFieldSelectors</code>。
      </p>

      <div class="demo-toolbar">
        <button class="primary" type="button" (click)="restart()">重新流式渲染</button>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
          <input type="checkbox" [checked]="useSelectors()" (change)="toggleSelectors($event)" />
          传入 requiredCompleteFieldSelectors
        </label>
      </div>

      <pre class="demo-meta" style="margin-bottom: 12px;">{{ selectorJson() }}</pre>

      <p class="demo-hint">进度：{{ revealed() }} / {{ total }} 字符（{{ isComplete() ? '已完成' : '生成中' }}）</p>

      <div class="demo-panel">
        <genui-config-provider [materials]="materials">
          <genui-renderer
            [content]="partial()"
            [generating]="!isComplete()"
            [isJsonComplete]="isComplete()"
            [requiredCompleteFieldSelectors]="useSelectors() ? selectors : []"
          ></genui-renderer>
        </genui-config-provider>
      </div>
    </div>
  `,
})
export class RequiredFieldSelectors {
  protected readonly materials = materials;
  protected readonly total = fullSchema.length;
  protected readonly selectors =
    (materialsMeta as { requiredCompleteFieldSelectors?: string[] }).requiredCompleteFieldSelectors ?? FALLBACK_SELECTORS;

  protected readonly revealed = signal(fullSchema.length);
  protected readonly useSelectors = signal(true);

  private timer: number | undefined;

  protected readonly partial = computed(() => fullSchema.slice(0, this.revealed()));
  protected readonly isComplete = computed(() => this.revealed() >= this.total);
  protected readonly selectorJson = computed(() => JSON.stringify(this.useSelectors() ? this.selectors : [], null, 2));

  constructor() {
    this.start();
  }

  protected restart(): void {
    this.start();
  }

  protected toggleSelectors(event: Event): void {
    this.useSelectors.set((event.target as HTMLInputElement).checked);
  }

  private start(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.revealed.set(0);
    this.timer = window.setInterval(() => {
      const next = Math.min(this.revealed() + STEP, this.total);
      this.revealed.set(next);
      if (next >= this.total && this.timer !== undefined) {
        window.clearInterval(this.timer);
        this.timer = undefined;
      }
    }, 120);
  }
}
