# release-verify

针对本次 `@opentiny/genui-sdk` 发布的回归验证套件（vitest，不需要浏览器）。
用例按**能力**组织，不按版本号命名；版本相关的断言集中在 `version-lockstep` 和 `vue-package` 里。

目标是回答一个问题：**这次发布有没有把仓库改坏？**

## 运行

```bash
pnpm -F release-verify test
# 或在仓库根目录
pnpm test:release
```

## 用例分布

| 文件 | 覆盖内容 |
| --- | --- |
| `tests/version-lockstep.test.ts` | 11 个工作区依赖是否全部锁到同一版本；实际安装版本是否一致；`pnpm-lock.yaml` 是否残留 alpha / 1.3.x 条目；同一个包是否被解析成多个版本 |
| `tests/core-api.test.ts` | `@opentiny/genui-sdk-core` 历史导出未丢失；`mergeMaterials` 与 `*FrameworkConfig` 存在；`repairJson` / `PatternExtractor` / `DeltaPatcher` / `matchJsonPath` 等核心行为回归 |
| `tests/core-history.test.ts` | 历史能力沉淀：`genPrompt` 提示词生成、`buildMaterialDefaultValueMap` 默认值提取、`genRootSchema` / `nodeSchema` 校验器、`StreamPatternExtractor` 流式抽取、`safeJsonParse` / `repairJson` 容错、`getPartialStartRegString` |
| `tests/mergeMaterials.test.ts` | `mergeMaterials` 的合并语义：components / defaultPropsMap 浅合并后者覆盖、选择器去重拼接、themeFactory 归一化为数组、纯函数不修改入参 |
| `tests/vue-package.test.ts` | `@opentiny/genui-sdk-vue` 的 9 个子路径入口都存在且产物文件真实存在；内部依赖版本自洽；`generateCode` 能产出 Vue SFC 且无错误 |
| `tests/materials.test.ts` | OpenTiny Vue 物料的 Mini / Standard / Plus 三档：白名单严格递增包含关系、Plus 新增组件、白名单不引用未注册组件、`themeFactory` 内置 light/dark/lite |
| `tests/peer-compat.test.ts` | 站点实际安装的框架版本是否满足 SDK 声明的 peer 范围（Vue / React 正常；Angular 用 `it.fails` 记录已知不兼容，上游放宽 peer 后会自动提醒） |

## 关于 `vitest.config.ts` 里的两处特殊配置

物料包以**浏览器 ESM 产物**发布，在纯 Node 环境下有两个坑，配置里已经处理：

1. `@opentiny/vue-theme/theme-tool` 是无扩展名子路径导入，Node ESM 会报 `ERR_MODULE_NOT_FOUND`
   → `server.deps.inline: [/@opentiny\//]` 交给 Vite 解析。
2. 物料底层依赖 TinyVue，TinyVue 在模块初始化时会访问 `window`
   → `tests/materials.test.ts` 通过 `// @vitest-environment jsdom` 单独切到 DOM 环境。

这两点本身也是发布质量信号：**该物料包无法在不打包的情况下被 Node 直接消费**（SSR / `tsx` / 纯 node 脚本会失败），
浏览器端（Vite / webpack）不受影响。
