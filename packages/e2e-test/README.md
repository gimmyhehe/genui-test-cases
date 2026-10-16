# e2e-test

针对 GenUI SDK playground 的 **Playwright 浏览器端到端测试**，用于验证 `1.4.0` 的发布质量。

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

用例按**能力**组织，而不是按版本号。新增版本的能力直接补进对应的能力文件。

| 文件 | 覆盖内容 |
| --- | --- |
| `tests/smoke.spec.ts` | 应用外壳：首页加载、默认 demo、侧边栏 demo 列表、搜索过滤、hash 路由直达、未知 id 回退 |
| `tests/demos.spec.ts` | 23 个 demo 全部能打开且不白屏；14 个离线 demo 控制台零错误 |
| `tests/streaming.spec.ts` | 流式渲染：请求契约、SSE 增量渲染、慢速流分片追加、无 `[DONE]` 收尾、HTTP 500 与非法 SSE 不崩溃、重复生成不叠加 |
| `tests/renderer.spec.ts` | 渲染器：Schema 切换（Diff）后渲染保持一致、Web Component（Shadow DOM）渲染与表单输入 |
| `tests/materials.spec.ts` | 物料：Mini/Standard/Plus 档位、渲染前后动态注入、响应式替换、`mergeMaterials` 合并与覆盖 |
| `tests/theming.spec.ts` | 主题：`themeFactory` 驱动 light/dark/lite 切换、宿主 CSS 变量覆盖组件样式 |
| `tests/chat.spec.ts` | 对话：GenuiChat 空态与 SSE 渲染、自定义组件注册与交互、TinyRobot 组合、图片上传入口 |
| `tests/code-generation.spec.ts` | 代码生成：Schema 反向生成 Vue SFC、编译校验无错误、重置 |
| `tests/notify.spec.ts` | 提示转发：渲染器内部错误（同步/异步/方法缺失）转发给自定义处理器；内置 notify 不进入宿主列表 |
| `tests/legacy.spec.ts` | 旧版入口：`GenuiLegacyConfigProvider` 零配置渲染、state/methods、头尾插槽；旧版 GenuiChat API |
| `tests/integration.spec.ts` | 综合案例：购物车主页面 + 侧边对话助手的购物车业务逻辑 |

## 已知问题（用 `test.fail()` 记录）

Playwright 的 `test.fail()` 表示「这条用例预期会失败」。当前记录了 3 条，都指向同一个问题：
**`materials` 从「有」换成「另一个」时，已经挂载的 `GenuiRenderer` 不会重新解析组件**
（从无到有的首次注入是正常的）。

- `materials.spec.ts` › 替换整个 materials 对象后，已渲染的组件跟着切换
- `materials.spec.ts` › 修改 materials.components 后，已渲染的组件跟着切换
- `materials.spec.ts` › 切成仅基础物料后，自定义组件从画面上消失

一旦上游修好，这几条会因为「预期失败却通过」而报错，提醒我们删掉 `test.fail()` 标记。

