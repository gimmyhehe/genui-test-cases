import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  assertPromptCoverage,
  assertWrittenPromptCoverage,
  assignReferenceFiles,
  ensureSkillFrontmatter,
  extractReferenceSections,
  extractSkillPrefix,
  findSectionByTitle,
  headingToReferenceFile,
  normalizeReferenceSubdir,
  removeStaleReferenceFiles,
  sectionLink,
  splitPromptSections,
  writeReferenceFiles,
  writeSkillEntry,
} from '@opentiny/genui-sdk-skill-generator'
import { cleanupTempDir, exists, listFiles, makeTempDir, readText } from './fixtures'

const prompt = [
  '# 技能前缀',
  '',
  '## 可用组件',
  '白名单：`A`, `B`',
  '',
  '```md',
  '## 代码块中的标题',
  '```',
  '',
  '## 卡片示例',
  '示例正文',
  '',
].join('\n')

describe('Prompt 拆分辅助 API', () => {
  const markers = extractReferenceSections(prompt)

  it('extractReferenceSections 忽略围栏代码块内的 ## 行', () => {
    expect(markers.map((m) => m.title)).toEqual(['可用组件', '卡片示例'])
    expect(markers.map((m) => m.file)).toEqual(['components.md', 'examples.md'])
  })

  it('extractSkillPrefix 返回首个章节前的内容', () => {
    expect(extractSkillPrefix(prompt, markers)).toBe('# 技能前缀\n\n')
  })

  it('splitPromptSections 可逐字还原 prompt', () => {
    const sections = splitPromptSections(prompt, markers)
    const rebuilt = markers.reduce(
      (acc, marker) => acc + sections[marker.file],
      extractSkillPrefix(prompt, markers),
    )
    expect(rebuilt).toBe(prompt)
  })

  it('assertPromptCoverage 在内容不一致时抛错', () => {
    const sections = splitPromptSections(prompt, markers)
    const prefix = extractSkillPrefix(prompt, markers)
    expect(() => assertPromptCoverage(prompt, prefix, sections, markers)).not.toThrow()
    expect(() => assertPromptCoverage(`${prompt}篡改`, prefix, sections, markers)).toThrow(
      /不一致/,
    )
  })

  it('assignReferenceFiles 为同名标题分配不重复文件名', () => {
    const assigned = assignReferenceFiles([
      { marker: '## 同名', title: '同名', index: 0 },
      { marker: '## 同名', title: '同名', index: 10 },
    ])
    expect(new Set(assigned.map((m) => m.file)).size).toBe(2)
  })

  it('findSectionByTitle 不区分大小写按关键词匹配', () => {
    expect(findSectionByTitle(markers, '示例')?.file).toBe('examples.md')
    expect(findSectionByTitle(markers, 'SNIPPETS')).toBeUndefined()
  })

  it('sectionLink 生成 reference 相对链接', () => {
    expect(sectionLink(markers[0])).toBe('[components.md](reference/components.md)')
    expect(sectionLink(markers[0], 'generated')).toBe(
      '[components.md](reference/generated/components.md)',
    )
    expect(sectionLink(undefined)).toBe('')
  })
})

describe('文件名与子目录安全约束', () => {
  it('headingToReferenceFile 优先使用别名', () => {
    expect(headingToReferenceFile('## 可用组件')).toBe('components.md')
    expect(headingToReferenceFile('## Schema Snippets')).toBe('schema-snippets.md')
    expect(headingToReferenceFile('## 纯中文标题')).toBe('纯中文标题.md')
  })

  it('headingToReferenceFile 拒绝路径穿越', () => {
    expect(() => headingToReferenceFile('## 危险/../标题')).toThrow(/不安全/)
  })

  it('normalizeReferenceSubdir 默认 generated，空串表示 reference/ 根', () => {
    expect(normalizeReferenceSubdir()).toBe('generated')
    expect(normalizeReferenceSubdir('generated')).toBe('generated')
    expect(normalizeReferenceSubdir('')).toBe('')
  })

  it('normalizeReferenceSubdir 拒绝绝对路径、穿越与手写目录', () => {
    expect(() => normalizeReferenceSubdir('/abs')).toThrow(/相对路径/)
    expect(() => normalizeReferenceSubdir('../evil')).toThrow(/不安全/)
    expect(() => normalizeReferenceSubdir('components')).toThrow(/手写目录/)
    expect(() => normalizeReferenceSubdir('components/x')).toThrow(/手写目录/)
    expect(() => normalizeReferenceSubdir('examples')).toThrow(/手写目录/)
  })
})

describe('文件写入辅助 API', () => {
  let root: string

  beforeEach(() => {
    root = makeTempDir('skill-write-')
  })

  afterEach(() => cleanupTempDir(root))

  it('ensureSkillFrontmatter 在缺失时用默认值创建', () => {
    const dir = join(root, 'skill')
    const frontmatter = ensureSkillFrontmatter(dir, '---\nname: def\n---\n')
    expect(frontmatter).toBe('---\nname: def\n---\n')
    expect(readText(join(dir, 'SKILL.md'))).toContain('name: def')
  })

  it('ensureSkillFrontmatter 读取已有 frontmatter', () => {
    const dir = join(root, 'skill')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'SKILL.md'), '---\nname: existing\n---\n\n正文\n')
    expect(ensureSkillFrontmatter(dir, '---\nname: def\n---\n')).toContain('name: existing')
  })

  it('writeReferenceFiles 写入子目录并可逐字还原', () => {
    const dir = join(root, 'skill')
    const markers = extractReferenceSections(prompt)
    const sections = splitPromptSections(prompt, markers)
    const prefix = extractSkillPrefix(prompt, markers)

    writeReferenceFiles(dir, sections, {
      referenceSubdir: 'generated',
      syncComponentsIndex: false,
    })
    writeSkillEntry([dir], prefix, markers, { referenceSubdir: 'generated' })

    const files = listFiles(dir)
    expect(files).toContain(join('reference', 'generated', 'components.md'))
    expect(files).toContain(join('reference', 'generated', 'examples.md'))
    expect(files).toContain('SKILL.md')

    expect(() =>
      assertWrittenPromptCoverage(dir, prompt, prefix, markers, 'generated'),
    ).not.toThrow()
  })

  it('writeSkillEntry 向多个目录写入入口并复用 frontmatter', () => {
    const a = join(root, 'a')
    const b = join(root, 'b')
    mkdirSync(a, { recursive: true })
    writeFileSync(join(a, 'SKILL.md'), '---\nname: custom\n---\n')

    const markers = extractReferenceSections(prompt)
    writeSkillEntry([a, b], extractSkillPrefix(prompt, markers), markers, {
      defaultFrontmatter: '---\nname: fallback\n---\n',
    })

    expect(readText(join(a, 'SKILL.md'))).toContain('name: custom')
    expect(readText(join(b, 'SKILL.md'))).toContain('name: custom')
    expect(readText(join(a, 'SKILL.md'))).toContain('# 技能前缀')
  })

  it('writeSkillEntry 的 fullPrompt 直接把完整 prompt 写入正文', () => {
    const dir = join(root, 'flat')
    writeSkillEntry([dir], '前缀', [], { fullPrompt: prompt })
    expect(readText(join(dir, 'SKILL.md'))).toContain(prompt)
  })

  it('removeStaleReferenceFiles 删除过期文件但保留子目录', () => {
    const dir = join(root, 'skill')
    mkdirSync(join(dir, 'sub'), { recursive: true })
    writeFileSync(join(dir, 'keep.md'), 'keep')
    writeFileSync(join(dir, 'old.md'), 'old')

    removeStaleReferenceFiles(dir, ['keep.md'])

    expect(exists(dir, 'keep.md')).toBe(true)
    expect(exists(dir, 'old.md')).toBe(false)
    expect(exists(dir, 'sub')).toBe(true)
  })
})
