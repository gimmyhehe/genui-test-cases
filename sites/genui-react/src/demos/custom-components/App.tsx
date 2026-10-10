import { GenuiConfigProvider, GenuiRenderer, type GenuiMaterials } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import '../../shared/demo.css';

function UserProfile({ name = '', email = '', avatar = '', role = '' }: Record<string, unknown>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid #e8e8e8', borderRadius: 8 }}>
      <img
        src={(avatar as string) || 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg'}
        alt={name as string}
        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{name as string}</div>
        <div style={{ color: '#8c8c8c', fontSize: 12 }}>
          {role as string} · {email as string}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  title = '',
  price = 0,
  image = '',
  description = '',
  tags = [],
  inStock = true,
}: Record<string, unknown>) {
  return (
    <div style={{ width: 260, border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <img src={image as string} alt={title as string} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 650 }}>{title as string}</div>
        <div style={{ color: '#cf1322', margin: '6px 0' }}>¥{price as number}</div>
        <div style={{ color: '#8c8c8c', fontSize: 12, minHeight: 32 }}>{description as string}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {(tags as string[]).map((tag) => (
            <span key={tag} style={{ padding: '2px 8px', borderRadius: 999, background: '#f0f5ff', color: '#2f54eb', fontSize: 11 }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: inStock ? '#389e0d' : '#cf1322' }}>
          {inStock ? '有货' : '缺货'}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label = '', value = 0, tone = 'blue' }: Record<string, unknown>) {
  const palette: Record<string, string> = { blue: '#e6f4ff', green: '#f6ffed', orange: '#fff7e6' };
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: palette[tone as string] ?? palette.blue, minWidth: 120 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label as string}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value as number}</div>
    </div>
  );
}

const customComponents: GenuiMaterials = {
  UserProfile,
  ProductCard,
  StatBadge,
};

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
    stats: [
      { label: '今日访问', value: 1280, tone: 'blue' },
      { label: '新增订单', value: 36, tone: 'green' },
      { label: '待处理', value: 5, tone: 'orange' },
    ],
  },
  props: { style: 'padding: 8px;' },
  children: [
    {
      componentName: 'AntCard',
      props: { title: '自定义组件（通过 customComponents 注册）' },
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
          props: { style: 'display: flex; gap: 12px; margin: 16px 0;' },
          children: [
            {
              componentName: 'StatBadge',
              loop: { type: 'JSExpression', value: 'this.state.stats' },
              loopArgs: ['item'],
              props: {
                label: { type: 'JSExpression', value: 'item.label' },
                value: { type: 'JSExpression', value: 'item.value' },
                tone: { type: 'JSExpression', value: 'item.tone' },
              },
            },
          ],
        },
      ],
    },
    {
      componentName: 'AntCard',
      props: { title: '自定义组件 + loop', style: 'margin-top: 16px;' },
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

export default function App() {
  return (
    <div className="demo-container">
      <p className="demo-hint">
        <code>customComponents</code> 接收一个 <code>Record&lt;string, ComponentType&gt;</code>，Schema 里直接用组件名引用，
        属性既可以是字面量，也可以是 <code>JSExpression</code>。
      </p>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} customComponents={customComponents} generating={false} />
      </GenuiConfigProvider>
    </div>
  );
}
