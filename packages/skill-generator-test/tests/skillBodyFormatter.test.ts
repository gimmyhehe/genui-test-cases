import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  SKILL_BODY_FORMATTERS,
  buildGenuiSchemaSkillBody,
  extractReferenceSections,
  generateSkillFiles,
  genSkillContent,
  resolveSkillBodyFormatter,
} from '@opentiny/genui-sdk-skill-generator'
import { miniMaterialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'
import { cleanupTempDir, exists, makeTempDir, readText, stripFrontmatter } from './fixtures'

const markers = extractReferenceSections(
  genSkillContent('vue', miniMaterialsMeta).prompt,
)

describe('resolveSkillBodyFormatter()', () => {
  it('按名称返回内置 formatter', () => {
    expect(resolveSkillBodyFormatter('genui-schema-json')).toBe(
      SKILL_BODY_FORMATTERS['genui-schema-json'],
    )
  })

  it('未知名称抛错并提示可用名称', () => {
    expect(() => resolveSkillBodyFormatter('unknown-formatter')).toThrow(/未知/)
    expect(() => resolveSkillBodyFormatter('unknown-formatter')).toThrow(
      /genui-schema-json/,
    )
  })
})

describe('buildGenuiSchemaSkillBody()', () => {
  let root: string
  let skillDir: string

  beforeEach(() => {
    root = makeTempDir('skill-body-')
    skillDir = join(root, 'skill')
    mkdirSync(join(skillDir, 'reference', 'generated'), { recursive: true })
  })

  afterEach(() => cleanupTempDir(root))

  it('包含输出格式、工作流与组件类型索引', () => {
    const body = buildGenuiSchemaSkillBody(markers, {
      skillDir,
      referenceSubdir: 'generated',
    })

    expect(body).toContain('schemaJson')
    expect(body).toContain('## 工作流')
    expect(body).toContain('## 组件类型索引')
  })

  it('工作流按磁盘「存在才出链」', () => {
    const missing = buildGenuiSchemaSkillBody(markers, { skillDir })
    expect(missing).toContain('读结构契约：`json-schema.md`')
    expect(missing).not.toContain(
      '读结构契约：[json-schema.md](reference/generated/json-schema.md)',
    )

    writeFileSync(join(skillDir, 'reference', 'generated', 'json-schema.md'), 'x')
    const present = buildGenuiSchemaSkillBody(markers, { skillDir })
    expect(present).toContain(
      '读结构契约：[json-schema.md](reference/generated/json-schema.md)',
    )
  })

  it('手写 reference/components.md 存在时才链接', () => {
    const before = buildGenuiSchemaSkillBody(markers, { skillDir })
    expect(before).not.toContain('[components.md](reference/components.md)')

    writeFileSync(join(skillDir, 'reference', 'components.md'), 'index')
    const after = buildGenuiSchemaSkillBody(markers, { skillDir })
    expect(after).toContain('[components.md](reference/components.md)')
  })

  it('wrapperComponent 默认 TinyCard，可覆盖', () => {
    expect(buildGenuiSchemaSkillBody(markers, { skillDir })).toContain('TinyCard')
    expect(
      buildGenuiSchemaSkillBody(markers, {
        skillDir,
        wrapperComponent: 'MyCard',
      }),
    ).toContain('MyCard')
  })

  it('按组件类型索引时链接对应类型文件', () => {
    const categoryDir = join(skillDir, 'reference', 'generated', 'components')
    mkdirSync(categoryDir, { recursive: true })
    writeFileSync(join(categoryDir, 'forms.md'), 'forms')

    const groups = [{ id: 'forms' as const, label: '表单组件', components: ['TinyForm'] }]
    const body = buildGenuiSchemaSkillBody(markers, {
      skillDir,
      referenceSubdir: 'generated',
      componentGroups: groups,
    })

    expect(body).toContain('[表单组件](reference/generated/components/forms.md)')
  })
})

describe('generateSkillFiles() + formatter 集成', () => {
  let root: string

  beforeEach(() => {
    root = makeTempDir('skill-body-int-')
  })

  afterEach(() => cleanupTempDir(root))

  it('SKILL.md 正文前缀与 genPrompt 原样一致，formatter 只追加在其后', () => {
    const skillDir = join(root, 'skill')
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      formatSkillBody: resolveSkillBodyFormatter('genui-schema-json'),
      referenceSubdir: 'generated',
    })

    const skill = readText(join(skillDir, 'SKILL.md'))
    const body = stripFrontmatter(skill)
    expect(body.startsWith(result.skillPrefix)).toBe(true)
    expect(body.slice(result.skillPrefix.length)).toContain('## 工作流')
    expect(body).toContain('## 组件类型索引')

    // 组件类型索引指向真实写入的类型文件
    expect(exists(join(skillDir, 'reference', 'generated', 'components'), 'forms.md')).toBe(
      true,
    )
    expect(skill).toContain('(reference/generated/components/forms.md)')
  })
})
