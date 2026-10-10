import { Component, Input } from '@angular/core';

@Component({
  selector: 'demo-user-profile',
  standalone: true,
  template: `
    <div
      style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e8e8e8; border-radius: 8px;"
    >
      <img
        [src]="avatar || 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg'"
        [alt]="name"
        style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
      />
      <div>
        <div style="font-weight: 600;">{{ name }}</div>
        <div style="color: #8c8c8c; font-size: 12px;">{{ role }} · {{ email }}</div>
      </div>
    </div>
  `,
})
export class UserProfileComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() role = '';
  @Input() avatar = '';
}
