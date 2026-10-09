import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildComponentCategoryFiles,
  buildComponentsIndex,
  extractComponentsSchema,
  extractComponentsWhitelist,
  findSectionByTitle,
  formatComponentList,
  genSkillContent,
  groupComponentsByCategory,
  parseWhitelistNames,
  resolveHandwrittenCategoryLinks,
  syncComponentsIndex,
  writeComponentCategoryFiles,
} from '@opentiny/genui-sdk-skill-generator'
import { miniMaterialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'
import { cleanupTempDir, exists, makeTempDir, readText } from './fixtures'

const content = genSkillContent('vue', miniMaterialsMeta)
const detailMarker = findSectionByTitle(content.sectionMarkers, '可用组件')!
const detail = content.sections[detailMarker.file]
const whitelist = extractComponentsWhitelist(detail)
const groups = groupComponentsByCategory(parseWhitelistNames(whitelist), {
  materials: miniMaterialsMeta.materials,
})

describe('组件白名单与分类', () => {
  it('parseWhitelistNames / formatComponentList 互为逆操作', () => {
    expect(parseWhitelistNames('`A`, `B`, `C`')).toEqual(['A', 'B', 'C'])
    expect(parseWhitelistNames('没有反引号')).toEqual([])
    expect(formatComponentList(['A', 'B'])).toBe('`A`, `B`')
    expect(formatComponentList([])).toBe('')
  })

  it('extractComponentsWhitelist 从「可用组件」章节提取反引号白名单', () => {
    const names = parseWhitelistNames(whitelist)
    expect(names.length).toBeGreaterThan(10)
    expect(names).toContain('TinyButton')
  })

  it('extractComponentsSchema 解析 JSON 代码围栏，失败返回 null', () => {
    const schema = extractComponentsSchema(detail)
    expect(Array.isArray(schema)).toBe(true)
    expect(schema!.length).toBeGreaterThan(0)
    expect(schema![0]).toHaveProperty('name')
    expect(schema![0]).toHaveProperty('component')
    expect(extractComponentsSchema('没有代码围栏的章节')).toBeNull()
  })

  it('groupComponentsByCategory 只返回非空分组且顺序稳定', () => {
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.map((g) => g.components.length).every((n) => n > 0)).toBe(true)
    for (const group of groups) {
      expect(['basic', 'layout', 'forms', 'data-display', 'charts', 'other']).toContain(
        group.id,
      )
    }
  })

  it('buildComponentCategoryFiles / writeComponentCategoryFiles 按类型落盘并清理过期文件', () => {
    const files = buildComponentCategoryFiles(detail, groups)
    expect(files.length).toBe(groups.length)
    for (const file of files) {
      expect(file.file).toMatch(/\.md$/)
      expect(file.content.length).toBeGreaterThan(0)
    }

    const root = makeTempDir('skill-cat-')
    try {
      const outDir = join(root, 'generated')
      const categoryDir = join(outDir, 'components')
      mkdirSync(categoryDir, { recursive: true })
      writeFileSync(join(categoryDir, 'stale.md'), 'stale')

      writeComponentCategoryFiles(outDir, files, true)

      for (const file of files) expect(exists(categoryDir, file.file)).toBe(true)
      expect(exists(categoryDir, 'stale.md')).toBe(false)
    } finally {
      cleanupTempDir(root)
    }
  })
})

describe('components.md 索引', () => {
  let root: string
  let skillDir: string

  beforeEach(() => {
    root = makeTempDir('skill-index-')
    skillDir = join(root, 'skill')
    mkdirSync(join(skillDir, 'reference'), { recursive: true })
  })

  afterEach(() => cleanupTempDir(root))

  it('buildComponentsIndex 生成按类型分组的白名单', () => {
    const index = buildComponentsIndex(whitelist, 'generated/components.md', groups)
    for (const group of groups) {
      expect(index).toContain(`### ${group.label}`)
    }
    expect(index).toContain('[generated/components.md](generated/components.md)')
  })

  it('syncComponentsIndex 写入受管区块并保留区块外手写内容', () => {
    const target = join(skillDir, 'reference', 'components.md')
    writeFileSync(target, '# 手写说明\n\n请保留这段\n')

    syncComponentsIndex(skillDir, detail, 'generated/components.md', groups)

    const result = readText(target)
    expect(result).toContain('请保留这段')
    expect(result).toContain('<!-- genui-skill-generator:start -->')
    expect(result).toContain('<!-- genui-skill-generator:end -->')
    expect(result).toContain('TinyButton')

    // 幂等：重复同步不重复追加受管区块
    syncComponentsIndex(skillDir, detail, 'generated/components.md', groups)
    const again = readText(target)
    expect(again).toBe(result)
    expect(again.match(/genui-skill-generator:start/g)).toHaveLength(1)
  })

  it('syncComponentsIndex 拒绝损坏的受管标记', () => {
    writeFileSync(
      join(skillDir, 'reference', 'components.md'),
      '<!-- genui-skill-generator:start -->\n只写了一半\n',
    )
    expect(() =>
      syncComponentsIndex(skillDir, detail, 'generated/components.md', groups),
    ).toThrow(/受管区块标记无效/)
  })

  it('resolveHandwrittenCategoryLinks 收集已有手写分类文档', () => {
    mkdirSync(join(skillDir, 'reference', 'components'), { recursive: true })
    writeFileSync(join(skillDir, 'reference', 'components', 'forms.md'), '# 表单手写指南')

    const links = resolveHandwrittenCategoryLinks(skillDir)
    expect(links.get('表单组件')).toContain('components/forms.md')

    const index = buildComponentsIndex(whitelist, 'generated/components.md', groups, links)
    expect(index).toContain('components/forms.md')
  })
})
