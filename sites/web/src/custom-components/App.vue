<template>
    <GenuiChat :url="url" :customComponents="customComponents" :messages="messages" />
  </template>
  
  <script setup lang="ts">
  import { GenuiChat } from '@opentiny/genui-sdk-vue';
  import ProductCard from './product-card.vue';
  
  const url = 'https://your-chat-backend/api';
  
  const customComponents = [
    {
      component: 'UserProfile',
      name: '用户资料',
      description: '显示用户基本信息和头像',
      schema: {
        properties: [
          {
            property: 'name',
            type: 'string',
            description: '用户名称',
            required: true,
          },
          {
            property: 'email',
            type: 'string',
            description: '用户邮箱',
          },
          {
            property: 'avatar',
            type: 'string',
            description: '头像URL',
          },
        ],
      },
      ref: UserProfile,
    },
    {
      component: 'ProductCard',
      name: '商品卡片',
      description: '展示商品图片、价格、标签、评分与操作按钮',
      schema: {
        properties: [
          {
            property: 'title',
            type: 'string',
            description: '商品标题',
            required: true,
          },
          {
            property: 'price',
            type: 'number',
            description: '商品价格',
            required: true,
          },
          {
            property: 'image',
            type: 'string',
            description: '商品图片URL',
          },
          {
            property: 'description',
            type: 'string',
            description: '商品描述',
          },
          {
            property: 'tags',
            type: 'array',
            description: '商品标签',
          },
          {
            property: 'rating',
            type: 'number',
            description: '评分（0-5）',
          },
          {
            property: 'ratingCount',
            type: 'number',
            description: '评分人数',
          },
          {
            property: 'inStock',
            type: 'boolean',
            description: '是否有货',
          },
          {
            property: 'badgeText',
            type: 'string',
            description: '角标文案（例如：新品/限时）',
          },
        ],
      },
      ref: ProductCard,
    },
  ];
  
  // 默认消息，用于展示自定义组件
  const messages = [
    {
      role: 'user',
      content: '推荐一个双肩包',
    },
    {
      role: 'assistant',
      content: '',
      messages: [
        {
          "type": "tool",
          "name": "get-product-detail",
          "formatPretty": true,
          "status": "success",
          "content": "{\n  \"arguments\": {\n    \"keyword\": \"双肩包\"\n  },\n  \"result\": [\n    {\n      \"detailInfo\": {\n        \"title\": \"轻量防水通勤双肩包\",\n        \"price\": 199,\n        \"image\": \"https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg\",\n        \"description\": \"14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。\",\n        \"tags\": [\"通勤\", \"防水\", \"轻量\"],\n        \"rating\": 4.7,\n        \"ratingCount\": 1289,\n        \"inStock\": true,\n        \"badgeText\": \"限时\"\n      }\n    }\n  ]\n}",
          "id": "call_98ecd18e7a4f4367b7c63da4"
        },
        {
          type: 'schema-card',
          content: JSON.stringify({
            componentName: 'Page',
            children: [
              {
                componentName: 'ProductCard',
                props: {
                  title: '轻量防水通勤双肩包',
                  price: 199,
                  image:
                    'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
                  description: '14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。',
                  tags: ['通勤', '防水', '轻量'],
                  rating: 4.7,
                  ratingCount: 1289,
                  inStock: true,
                  badgeText: '限时',
                },
              },
            ],
          }),
        },
      ],
    },
  ];
  </script>
  