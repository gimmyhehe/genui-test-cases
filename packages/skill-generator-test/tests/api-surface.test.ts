import { describe, expect, it } from 'vitest'
import * as SG from '@opentiny/genui-sdk-skill-generator'

const api = SG as unknown as Record<string, unknown>

/** 官方 API 文档 https://opentiny.github.io/genui-sdk/docs/components/skill-generator/api.html */
const documentedFunctions = [
  // 核心 API
  'generateSkillFiles',
  'genSkillContent',
  'buildGenuiSchemaSkillBody',
  'resolveSkillBodyFormatter',
  // CLI API
  'runSkillGenerateCli',
  'loadSkillGenerateConfig',
  'parseSkillGenerateArgs',
  'resolveConfiguredSkillDirs',
  'resolveConfigPath',
  'createSkillGenerateUsage',
  // 低层辅助 API — Prompt 拆分与校验
  'extractReferenceSections',
  'extractSkillPrefix',
  'splitPromptSections',
  'assertPromptCoverage',
  'assertWrittenPromptCoverage',
  'headingToReferenceFile',
  'assignReferenceFiles',
  'findSectionByTitle',
  'sectionLink',
  'normalizeReferenceSubdir',
  // 低层辅助 API — 文件写入
  'ensureSkillFrontmatter',
  'writeReferenceFiles',
  'writeSkillEntry',
  'removeStaleReferenceFiles',
  // 低层辅助 API — 组件索引
  'parseWhitelistNames',
  'formatComponentList',
  'groupComponentsByCategory',
  'extractComponentsWhitelist',
  'extractComponentsSchema',
  'buildComponentCategoryFiles',
  'writeComponentCategoryFiles',
  'resolveHandwrittenCategoryLinks',
  'buildComponentsIndex',
  'syncComponentsIndex',
]

const documentedConstants = [
  'SKILL_BODY_FORMATTERS',
  'SECTION_FILE_ALIASES',
  'COMPONENT_CATEGORY_DOCS',
]

describe('文档 API 面', () => {
  it.each(documentedFunctions)('%s 已导出且为函数', (name) => {
    expect(api[name], `缺少导出: ${name}`).toBeTypeOf('function')
  })

  it.each(documentedConstants)('%s 已导出', (name) => {
    expect(api[name], `缺少导出: ${name}`).toBeDefined()
  })

  it('SKILL_BODY_FORMATTERS 仅内置 genui-schema-json', () => {
    expect(Object.keys(SG.SKILL_BODY_FORMATTERS)).toEqual(['genui-schema-json'])
  })

  it('SECTION_FILE_ALIASES 覆盖 6 个内置章节', () => {
    expect(SG.SECTION_FILE_ALIASES['可用组件']).toBe('components.md')
    expect(SG.SECTION_FILE_ALIASES['卡片的 JSON Schema']).toBe('json-schema.md')
    expect(SG.SECTION_FILE_ALIASES['卡片示例']).toBe('examples.md')
    expect(SG.SECTION_FILE_ALIASES['Schema Snippets']).toBe('schema-snippets.md')
    expect(SG.SECTION_FILE_ALIASES['schemaJson 生成规则']).toBe('rules.md')
    expect(SG.SECTION_FILE_ALIASES['this 上下文声明']).toBe('this-context.md')
  })

  it('COMPONENT_CATEGORY_DOCS 是 6 个稳定分类', () => {
    expect(SG.COMPONENT_CATEGORY_DOCS.map((d) => d.id)).toEqual([
      'basic',
      'layout',
      'forms',
      'data-display',
      'charts',
      'other',
    ])
  })
})
