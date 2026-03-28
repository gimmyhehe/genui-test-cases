import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * MCP tool: get-product-detail
 *
 * 约定：
 * - 入参：`{ keyword: string }`
 * - 服务端输出：`content[{ type: 'text', text: JSON.stringify(payload) }]`
 * - 客户端将 text 解析并用 zod 校验 payload 结构
 */

export const TOOL_NAME = 'get-product-detail' as const;

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  rating: z.number(),
  ratingCount: z.number(),
  inStock: z.boolean(),
  badgeText: z.string(),
});

export const ProductDetailResultPayloadSchema = z.object({
  tool: z.literal(TOOL_NAME),
  query: z.string(),
  results: z.array(ProductSchema),
  found: z.boolean(),
});

export const GetProductDetailArgsSchema = z.object({
  keyword: z.string().min(1),
});

export type GetProductDetailArgs = z.infer<typeof GetProductDetailArgsSchema>;
export type ProductDetailResultPayload = z.infer<typeof ProductDetailResultPayloadSchema>;

export const McpToolContentItemSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

export const McpToolCallResultSchema = z
  .object({
    content: z.array(McpToolContentItemSchema).optional(),
  })
  .passthrough();

export function getProductDetailToolDefinition() {
  // OpenAI tools/function schema
  return {
    type: 'function',
    function: {
      name: TOOL_NAME,
      description: '根据关键字 keyword 返回商品详情。keyword是必须字段，如果缺少keyword，请提示补充。',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: '商品名称或相关标签关键字，必填字段,',
          },
        },
        required: ['keyword'],
      },
    },
  } as const;
}

export const mcpToolDefinitions = {
  [TOOL_NAME]: {
    definition: getProductDetailToolDefinition(),
  },
} as const;

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  inStock: boolean;
  badgeText: string;
};

// 简单的“商品库”（演示用）。实际接入时可替换成真实数据源。
const PRODUCT_DB: Product[] = [
  {
    id: 'iphone-16',
    title: 'Apple iPhone 16 256GB',
    price: 6999,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: 'A 系列芯片，出色影像系统与续航表现，适合日常与创作。',
    tags: ['iphone', 'apple', '手机', 'ios'],
    rating: 4.8,
    ratingCount: 26840,
    inStock: true,
    badgeText: '新品',
  },
  {
    id: 'macbook-air-m3',
    title: 'MacBook Air 13 英寸 (M3)',
    price: 8999,
    image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/mba_15_m3_2024_hero.png',
    description: '轻薄便携，长续航，适合办公学习与轻量创作。',
    tags: ['macbook', 'apple', '笔记本', 'm3', 'laptop'],
    rating: 4.7,
    ratingCount: 10452,
    inStock: true,
    badgeText: '热卖',
  },
  {
    id: 'airpods-pro-2',
    title: 'AirPods Pro (第 2 代)',
    price: 1899,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '主动降噪与通透模式切换顺滑，空间音频沉浸感强。',
    tags: ['airpods', 'apple', '耳机', '降噪', 'headphones'],
    rating: 4.8,
    ratingCount: 18730,
    inStock: true,
    badgeText: '加购立减',
  },
  {
    id: 'bag-commute',
    title: '轻量防水通勤双肩包',
    price: 199,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '14英寸笔记本可放，轻量耐磨，日常通勤与短途出行都合适。',
    tags: ['通勤', '防水', '轻量'],
    rating: 4.7,
    ratingCount: 1289,
    inStock: true,
    badgeText: '限时',
  },
  {
    id: 'shoe-runner',
    title: '透气缓震跑步鞋',
    price: 329,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '鞋面透气，回弹缓震，适合日常慢跑与通勤走路。',
    tags: ['跑步', '透气', '缓震'],
    rating: 4.6,
    ratingCount: 842,
    inStock: true,
    badgeText: '热卖',
  },
  {
    id: 'mug-thermal',
    title: '不锈钢保温杯 500ml',
    price: 89,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '双层真空保温，密封防漏，办公室与出行都方便。',
    tags: ['保温', '不锈钢', '防漏'],
    rating: 4.8,
    ratingCount: 3560,
    inStock: true,
    badgeText: '加购立减',
  },
  {
    id: 'lamp-desk',
    title: '护眼台灯（可调色温）',
    price: 159,
    image: 'https://pic1.ntimg.cn/pic/20241011/35479210_171206641130_4.jpg',
    description: '多档亮度与色温可调，长时间阅读更舒适。',
    tags: ['护眼', '台灯', '可调色温'],
    rating: 4.5,
    ratingCount: 620,
    inStock: true,
    badgeText: '新品',
  },
];

const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase();

const findProductsByKeyword = (keyword: string): Product[] => {
  const k = normalizeKeyword(keyword);
  if (!k) return [];
  // 简单匹配：id / title / tag 包含 keyword
  return PRODUCT_DB.filter(
    (p) =>
      p.id.toLowerCase().includes(k) ||
      p.title.toLowerCase().includes(k) ||
      p.tags.some((t) => t.toLowerCase().includes(k)),
  ).slice(0, 5);
};

export function createMcpProductServer() {
  const server = new McpServer(
    { name: 'genui-product-mcp-server', version: '0.0.1' },
    {},
  );

  server.registerTool(
    TOOL_NAME,
    {
      title: '获取商品详情',
      description: '根据关键字 keyword 返回商品详情。keyword是必须字段，如果缺少keyword，请提示补充。',
      inputSchema: GetProductDetailArgsSchema,
    },
    async (rawArgs) => {
      const parsedArgs = GetProductDetailArgsSchema.safeParse(rawArgs);
      if (!parsedArgs.success) {
        // 这里直接抛错，让 MCP 调用方拿到失败信息
        throw new Error(`Invalid args for ${TOOL_NAME}`);
      }

      const keyword = parsedArgs.data.keyword;
      const products = findProductsByKeyword(keyword);

      const payload: unknown = {
        tool: TOOL_NAME,
        query: keyword,
        results: products.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
          description: p.description,
          tags: p.tags,
          rating: p.rating,
          ratingCount: p.ratingCount,
          inStock: p.inStock,
          badgeText: p.badgeText,
        })),
        found: products.length > 0,
      };

      // 用 zod 在服务端确保输出结构始终是可预期的
      const validatedPayload = ProductDetailResultPayloadSchema.parse(payload);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(validatedPayload),
          },
        ],
      };
    },
  );

  return server;
}

