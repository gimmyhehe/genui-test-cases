# GenUI SDK React 验证工程

参考 `docs/src/guide/react/install.md` 和 `docs/src/guide/react/start-with-renderer.md`，使用 Vite + React + TypeScript 验证 `GenuiConfigProvider`、`GenuiRenderer` 与 Ant Design 物料包。

## 启动

在仓库根目录执行：

```bash
pnpm install
pnpm --filter @opentiny/genui-sdk-core build
pnpm --filter @opentiny/genui-sdk-materials-react-antd build
pnpm --filter @opentiny/genui-sdk-react build
pnpm --filter genui-sdk-react-validation dev
```

打开 Vite 输出的本地地址。页面默认显示卡片示例。可以切换表格、编辑并渲染 JSON，或点击“模拟 SSE 流”检查增量渲染。模拟流无需后端。

## 连接真实服务

可复制 `.env.example` 为 `.env.local` 设置默认 API 地址与模型，也可直接在页面输入。服务须提供 OpenAI 兼容的 `POST /chat/completions` SSE 接口，逐段返回 `choices[0].delta.content`，并在内容中包含以下代码块：

````text
```schemaJson
{"componentName":"Page","children":[{"componentName":"Text","props":{"text":"你好"}}]}
```
````

浏览器直接请求后端，跨域时需由后端允许此页面的来源。API Key 应配置在后端，不应写入 Vite 环境变量或前端代码。

## 构建

```bash
pnpm --filter genui-sdk-react-validation build
```
