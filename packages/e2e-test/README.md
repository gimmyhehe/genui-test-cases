# e2e-test

针对 GenUI SDK playground 的 **Playwright 浏览器端到端测试**，用于验证 `1.4.0-beta.1` 的发布质量。

## 运行

```bash
# 首次需要安装浏览器
pnpm -F e2e-test install:browser

pnpm -F e2e-test test
# 或在仓库根目录
pnpm test:e2e

# 带界面调试
pnpm test:e2e:headed
```

`playwright.config.ts` 里的 `webServer` 会自动拉起
`pnpm -F genui-sdk-playground-web exec vite --host --port <PORT> --strictPort`
（默认 http://localhost:5177）；如果该端口已经有 dev server 在跑，会直接复用。

> **想要更强的保证**（例如 CI，或者本机已经跑着 `pnpm dev`、Vite 的依赖预打包缓存可能是旧的）：
> ```bash
> E2E_PORT=5199 pnpm test:e2e
> ```
> 指定 `E2E_PORT` 时会强制新起一个 dev server 且不复用已有进程。
> 如果想连 Vite 缓存也清掉，先执行 `rm -rf sites/web/node_modules/.vite`。

## 不依赖真实大模型

`start-with-renderer` demo 把请求硬编码到 `http://localhost:3100/chat/completions`。
e2e 通过 `page.addInitScript` 在**浏览器里替换 `window.fetch`**
（见 `tests/helpers/llm-stub.ts`），拿到真正的 `ReadableStream` 分片下发能力：

- 不需要 API Key、不产生费用、不受模型随机性影响；
- 不受 CORS 影响（请求根本不出浏览器）；
- **不占用 3100 端口**，因此可以和仓库自己的 `pnpm dev`（`packages/server` 也监听 3100）同时运行；
- 可以精确控制 SSE 分片时机，从而真正测出「增量渲染」而不是等流结束才渲染。

场景通过用户输入里的标记选择，避免并行用例之间共享状态：

| 标记 | 行为 |
| --- | --- |
| 无 | 正常下发两段 schema 分片，最后 `data: [DONE]` |
| `[slow]` | 第一段立即下发，1.5s 后才下发第二段（用于验证增量渲染） |
| `[no-done]` | 下发分片但**不**发送 `[DONE]`，直接关闭连接 |
| `[http-500]` | 返回 HTTP 500 |
| `[bad-sse]` | 下发非法 JSON 的 `data:` 行 |

被拦截的请求记录在 `window.__llmRequests`，用来断言请求契约（`stream` / `model` / `messages`）。

## 用例分布

| 文件 | 覆盖内容 |
| --- | --- |
| `tests/smoke.spec.ts` | 首页加载、默认 demo、侧边栏 demo 列表、搜索过滤、hash 路由直达、未知 id 回退 |
| `tests/demos.spec.ts` | 23 个 demo 全部能打开且不白屏；10 个离线 demo 控制台零错误 |
| `tests/renderer-streaming.spec.ts` | 请求契约、SSE 增量渲染、慢速流分片追加、无 `[DONE]` 收尾、HTTP 500 与非法 SSE 不崩溃、重复生成不叠加 |
| `tests/v140-features.spec.ts` | 1.4.0 新增能力：Plus 物料、`themeFactory` 主题切换、`mergeMaterials` 合并/覆盖、`generateCode` 代码生成、`notify` 提示转发、`GenuiLegacyConfigProvider` 零配置渲染 |
