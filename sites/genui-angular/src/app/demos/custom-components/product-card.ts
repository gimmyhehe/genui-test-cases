import { Component, Input } from '@angular/core';

@Component({
  selector: 'demo-product-card',
  standalone: true,
  template: `
    <div style="width: 260px; border: 1px solid #eee; border-radius: 10px; overflow: hidden; background: #fff;">
      <img [src]="image" [alt]="title" style="width: 100%; height: 140px; object-fit: cover;" />
      <div style="padding: 12px;">
        <div style="font-weight: 650;">{{ title }}</div>
        <div style="color: #cf1322; margin: 6px 0;">¥{{ price }}</div>
        <div style="color: #8c8c8c; font-size: 12px; min-height: 32px;">{{ description }}</div>
        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
          @for (tag of tags; track tag) {
            <span style="padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #2f54eb; font-size: 11px;">
              {{ tag }}
            </span>
          }
        </div>
        <div style="margin-top: 8px; font-size: 12px;" [style.color]="inStock ? '#389e0d' : '#cf1322'">
          {{ inStock ? '有货' : '缺货' }}
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input() title = '';
  @Input() price = 0;
  @Input() image = '';
  @Input() description = '';
  @Input() tags: string[] = [];
  @Input() inStock = true;
}
