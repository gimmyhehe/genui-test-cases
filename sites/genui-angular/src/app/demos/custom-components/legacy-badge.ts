import { Component, Input, NgModule } from '@angular/core';

/**
 * 非 standalone 组件：必须通过 `customComponentsModule` 提供它的 NgModule，
 * 渲染器会用 createNgModule 创建模块实例来解析该组件（1.4.0 新增能力）。
 */
@Component({
  selector: 'demo-legacy-badge',
  standalone: false,
  template: `
    <span
      style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #fff7e6; border: 1px solid #ffd591; color: #d46b08; font-size: 12px;"
    >
      <strong>{{ label }}</strong>
      <span>{{ value }}</span>
    </span>
  `,
})
export class LegacyBadgeComponent {
  @Input() label = '';
  @Input() value = '';
}

@NgModule({
  declarations: [LegacyBadgeComponent],
  exports: [LegacyBadgeComponent],
})
export class LegacyBadgeModule {}
