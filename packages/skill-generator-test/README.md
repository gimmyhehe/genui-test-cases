# skill-generator-test

验证 alpha 版 `@opentiny/genui-sdk-skill-generator` 是否与官方 API 文档一致，并给出
**多组件库**与 **CLI** 两条生成路径的可运行案例。

- 文档：<https://opentiny.github.io/genui-sdk/docs/components/skill-generator/api.html>
- 版本：`1.4.0-alpha.3`（npm dist-tag `alpha` / `latest`，首个正式发布；此前仅有占位版 `0.0.0-stage`）
- npm：<https://www.npmjs.com/package/@opentiny/genui-sdk-skill-generator>

## 用途

该包把 `genPrompt` 生成的完整 Prompt 转换为 Agent 可按需加载的 `SKILL.md` + `reference/`
分片，适用于 Cursor、Claude Code 等支持 Skill 的 Agent。

## 命令

```bash
pnpm install          # 在仓库根目录执行
pnpm -F skill-generator-test test        # 147 个 API / 多组件库 / CLI 验证用例
pnpm -F skill-generator-test typecheck   # tsc --noEmit

# 编程式生成（generateSkillFiles），输出 out-skill/<组件库>/
pnpm -F skill-generator-test gen:skill
pnpm -F skill-generator-test gen:skill:element-plus   # 也可 :opentiny-vue / :opentiny-ng / :antd

# CLI 生成（genui-skill-generate），输出 out-skill/cli/<组件库>/
pnpm -F skill-generator-test gen:skill:cli
pnpm -F skill-generator-test gen:skill:cli:element-plus
pnpm -F skill-generator-test gen:skill:cli:flat        # flatPrompt 单文件模式
```

## 支持的组件库（物料库）

`src/materials-presets.ts` 注册了 4 个已发布 `1.4.0-alpha.3` 物料包的预设：

| 预设 id | 组件库 | framework | 物料包 | 包裹组件 | SKILL.md name |
|---|---|---|---|---|---|
| `opentiny-vue` | OpenTiny Vue | vue | `materials-vue-opentiny-vue` | `TinyCard` | `genui-schema-json`（内置 frontmatter） |
| `element-plus` | Element Plus | vue | `materials-vue-element-plus` | `ElCard` | `genui-schema-json-element-plus` |
| `opentiny-ng` | OpenTiny NG | angular | `materials-angular-opentiny-ng` | `TiCard` | `genui-schema-json-opentiny-ng` |
| `antd` | Ant Design | react | `materials-react-antd` | `AntCard` | `genui-schema-json-antd` |

实测四个库都能生成 6 个标准章节（`components.md` / `json-schema.md` / `examples.md` /
`schema-snippets.md` / `this-context.md` / `rules.md`），落盘结果可逐字还原 `genPrompt` 输出，
按类型分组的组件详情与 `components.md` 索引一致。

## 结构

```
src/
  materials-presets.ts   # 4 个组件库预设（framework + 物料包 + 包裹组件 + frontmatter）
  gen-skill.ts           # 编程式：generateSkillFiles，支持 --preset <id>
  gen-skill-cli.ts       # CLI：调用真实 genui-skill-generate 二进制
  index.ts
configs/
  opentiny-vue.json  element-plus.json  opentiny-ng.json  antd.json  antd-flat.json
tests/
  api-surface.test.ts       # 文档列出的 34 个函数 + 3 个常量是否全部导出
  genSkillContent.test.ts   # 纯函数生成、isSkill 默认值、flatPrompt、分片还原
  generateSkillFiles.test.ts# 落盘、frontmatter 复用、prune、多目录、安全约束
  skillBodyFormatter.test.ts# 内置 formatter 与「存在才出链」
  helpers.test.ts           # Prompt 拆分/校验、文件名与子目录安全、文件写入
  componentsIndex.test.ts   # 白名单解析、类型分组、components.md 受管区块
  cli.test.ts               # CLI 参数解析、配置加载、runSkillGenerateCli、二进制端到端
  materialsMatrix.test.ts   # 4 个组件库 × 编程式/CLI 生成矩阵
```

## CLI 用法

CLI 入口：`genui-skill-generate`（`bin` → `dist/cli.js`）。

```bash
# 1) 用本仓库的组件库配置生成（相对 skillDirs 以配置文件所在目录为基准）
npx @opentiny/genui-sdk-skill-generator --config ./configs/element-plus.json

# 2) 覆盖输出目录
npx @opentiny/genui-sdk-skill-generator --config ./configs/antd.json --out ./skills/antd

# 3) 不带配置时使用包内置 config.json（OpenTiny Vue 物料）
npx @opentiny/genui-sdk-skill-generator --out ./skills/my-skill

# 4) flatPrompt：完整 Prompt 直接写入 SKILL.md，不生成 reference/
npx @opentiny/genui-sdk-skill-generator --config ./configs/antd-flat.json
```

`ISkillGenerateConfig` 支持 `framework` / `materialsMetaModule` / `materialsMetaExport` /
`skillDirs` / `promptCustomConfig` / `tgCustomConfig` / `promptOptions` /
`skillBodyFormatter` / `referenceSubdir` / `syncComponentsIndex` / `prune` / `flatPrompt`。

## 验证结论

文档中列出的 API 全部存在且行为与文档一致：

- 核心 API：`generateSkillFiles` / `genSkillContent` / `buildGenuiSchemaSkillBody` /
  `resolveSkillBodyFormatter` / `SKILL_BODY_FORMATTERS`
- CLI：`runSkillGenerateCli` / `loadSkillGenerateConfig` / `parseSkillGenerateArgs` /
  `resolveConfiguredSkillDirs` / `resolveConfigPath` / `createSkillGenerateUsage`
- 低层辅助 API：Prompt 拆分校验、文件写入、组件分类索引等
- 安全约束：`referenceSubdir` 拒绝绝对路径/穿越/手写目录 `components`、`examples`；
  空 `referenceSubdir` 禁止 `prune`；`headingToReferenceFile` 拒绝不安全文件名；
  受管标记损坏时 `syncComponentsIndex` 拒绝写入

### 观察到的问题（非阻塞）

1. **内置 frontmatter 写死了 OpenTiny Vue 描述**：全新目录生成时，`SKILL.md` 顶部会写入包内置
   的 `genui-schema-json` frontmatter（约 280 字节，描述含 `TinyForm, TinyCard, TinyGrid ...
   OpenTiny components`）。给其他组件库生成时该描述会误导 Agent。本仓库的做法是用
   `defaultFrontmatter` 覆盖（预设里已为 element-plus / opentiny-ng / antd 提供）。
2. **CLI 无法配置 frontmatter**：`ISkillGenerateConfig` 没有 `defaultFrontmatter` 字段，
   走 CLI 时只能得到内置 frontmatter。可用两条路绕过：
   - `src/gen-skill-cli.ts` 的做法：先按预设写入 `SKILL.md` frontmatter，再调用 CLI——
     生成流程会复用首个输出目录中已有的 frontmatter；
   - 改用编程式 `generateSkillFiles({ defaultFrontmatter })`。
3. **`buildGenuiSchemaSkillBody` 的链接门控**：文档称「只链接当前 Skill 目录中实际存在的
   文件」。实际只有工作流与组件类型索引按存在性出链；结尾「## 完整物料（按需再读）」表格
   会无条件列出全部 `reference/generated/<section>.md`。默认生成流程中这些文件都会写入，
   因此不影响正常使用，仅在直接调用 formatter 且目录不完整时出现悬空链接。
4. **默认 frontmatter 与正文分离**：`SKILL.md` 是「frontmatter + genPrompt 前缀 + formatter
   正文」，所以文件并非以前缀开头；`assertWrittenPromptCoverage` 会跳过 frontmatter 校验。

## 生成产物

以 OpenTiny Vue 为例，`out-skill/opentiny-vue/`：

```
SKILL.md
reference/
  components.md                 # 手写层白名单索引（受管区块）
  generated/
    components.md               # 完整组件详情
    json-schema.md  examples.md  schema-snippets.md  rules.md  this-context.md
    components/                 # 按类型拆分的 props / events
      basic.md  layout.md  forms.md  data-display.md  charts.md  other.md
```

其他组件库类型文件少一些（例如 Element Plus 只有 `basic.md` / `other.md`），
`out-skill/cli/antd-flat/` 则是 flatPrompt 模式，只有 `SKILL.md`。
