import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client';
import {
  GetProductDetailArgsSchema,
  McpToolCallResultSchema,
  ProductDetailResultPayloadSchema,
  TOOL_NAME,
} from './mcp-server';
import { createMcpProductServer } from './mcp-server';

let mcpClientPromise: Promise<Client> | null = null;

async function buildMcpClientOnce(): Promise<Client> {
  // 1) 创建 server/client 的 in-memory 链接对
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  // 2) 创建 server 并注册 tool
  const server = createMcpProductServer();

  // 3) 启动并 connect（会触发 MCP 初始化流程）
  await server.connect(serverTransport);

  // 4) 创建并连接 client
  const client = new Client(
    { name: 'genui-product-mcp-client', version: '0.0.1' },
    {},
  );

  await client.connect(clientTransport);

  return client;
}

export async function getMcpClient(): Promise<Client> {
  if (!mcpClientPromise) mcpClientPromise = buildMcpClientOnce();
  return mcpClientPromise;
}

function extractFirstText(toolResult: unknown): string | null {
  const parsed = McpToolCallResultSchema.safeParse(toolResult);
  if (!parsed.success) return null;
  const found = parsed.data.content?.find((c) => c.type === 'text' && typeof c.text === 'string');
  return found?.text ?? null;
}

/**
 * 对 MCP tool `get-product-detail` 的封装：
 * - zod 校验入参
 * - zod 校验 tool 返回的 content.text，并进一步校验 payload JSON 结构
 * - 成功时返回 payload 的 JSON 字符串（与服务端一致）
 */
export async function callGetProductDetail(keyword: string): Promise<string> {
  const parsedArgs = GetProductDetailArgsSchema.safeParse({ keyword });
  if (!parsedArgs.success) {
    throw new Error(`Invalid args for ${TOOL_NAME}`);
  }

  const client = await getMcpClient();
  const toolResult = await client.callTool({
    name: TOOL_NAME,
    arguments: parsedArgs.data,
  });

  const firstText = extractFirstText(toolResult);
  if (!firstText) return JSON.stringify(toolResult);

  // 再用 zod 校验服务端输出的 payload 结构
  try {
    const parsedPayload = ProductDetailResultPayloadSchema.safeParse(JSON.parse(firstText));
    if (parsedPayload.success) return JSON.stringify(parsedPayload.data);
    return firstText;
  } catch {
    return firstText;
  }
}

