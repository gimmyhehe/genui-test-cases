import { Component } from '@angular/core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-angular';
import { materials } from '@opentiny/genui-sdk-materials-angular-opentiny-ng/materials';
import { LegacyBadgeModule } from './legacy-badge';
import { ProductCardComponent } from './product-card';
import { UserProfileComponent } from './user-profile';

const schema = {
  componentName: 'Page',
  state: {
    user: { name: '张三', email: 'zhangsan@example.com', role: '前端工程师' },
    products: [
      {
        title: '轻量防水通勤双肩包',
        price: 199,
        image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
        description: '14 英寸笔记本可放，轻量耐磨。',
        tags: ['通勤', '防水', '轻量'],
        inStock: true,
      },
      {
        title: '无线降噪耳机',
        price: 899,
        image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
        description: '主动降噪，续航 30 小时。',
        tags: ['数码', '降噪'],
        inStock: false,
      },
    ],
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'TiCard',
      props: { header: '自定义 Angular 组件' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
          children: [
            {
              componentName: 'UserProfile',
              props: {
                name: { type: 'JSExpression', value: 'this.state.user.name' },
                email: { type: 'JSExpression', value: 'this.state.user.email' },
                role: { type: 'JSExpression', value: 'this.state.user.role' },
              },
            },
            {
              componentName: 'div',
              props: { style: 'display: flex; gap: 12px; align-items: center;' },
              children: [
                { componentName: 'LegacyBadge', props: { label: '非 standalone', value: 'via customComponentsModule' } },
              ],
            },
          ],
        },
      ],
    },
    {
      componentName: 'TiCard',
      props: { header: '自定义组件 + loop', style: 'margin-top: 16px;' },
      children: [
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 16px; flex-wrap: wrap;' },
          children: [
            {
              componentName: 'ProductCard',
              loop: { type: 'JSExpression', value: 'this.state.products' },
              loopArgs: ['product'],
              props: {
                title: { type: 'JSExpression', value: 'product.title' },
                price: { type: 'JSExpression', value: 'product.price' },
                image: { type: 'JSExpression', value: 'product.image' },
                description: { type: 'JSExpression', value: 'product.description' },
                tags: { type: 'JSExpression', value: 'product.tags' },
                inStock: { type: 'JSExpression', value: 'product.inStock' },
              },
            },
          ],
        },
      ],
    },
  ],
};

@Component({
  selector: 'demo-custom-components',
  imports: [GenuiConfigProvider, GenuiRenderer],
  template: `
    <div class="demo-container">
      <p class="demo-hint">
        <code>customComponents</code> 注册 standalone 组件；非 standalone 组件走新增的
        <code>customComponentsModule</code>，由渲染器创建 NgModule 后解析。
      </p>
      <genui-config-provider [materials]="materials">
        <genui-renderer
          [content]="schema"
          [customComponents]="customComponents"
          [customComponentsModule]="customComponentsModule"
        ></genui-renderer>
      </genui-config-provider>
    </div>
  `,
})
export class CustomComponents {
  protected readonly materials = materials;
  protected readonly schema = schema;

  protected readonly customComponents = {
    UserProfile: UserProfileComponent,
    ProductCard: ProductCardComponent,
  };

  protected readonly customComponentsModule = {
    LegacyBadge: LegacyBadgeModule,
  };
}
