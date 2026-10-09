import { describe, expect, it } from 'vitest'
import {
  assertPromptCoverage,
  extractReferenceSections,
  genSkillContent,
  splitPromptSections,
} from '@opentiny/genui-sdk-skill-generator'
import { genPrompt } from '@opentiny/genui-sdk-core'
import { materialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'

describe('genSkillContent() — 纯函数，无文件 IO', () => {
  const content = genSkillContent('vue', materialsMeta)

  it('返回 prompt / skillPrefix / sections / sectionMarkers', () => {
    expect(content.prompt).toBeTypeOf('string')
    expect(content.skillPrefix).toBeTypeOf('string')
    expect(content.sections).toBeTypeOf('object')
    expect(Array.isArray(content.sectionMarkers)).toBe(true)
  })

  it('默认自动补上 promptOptions.isSkill = true', () => {
    const expected = genPrompt('vue', materialsMeta, undefined, { isSkill: true })
    expect(content.prompt).toBe(expected)
  })

  it('prompt 是 skillPrefix 与全部章节的拼接', () => {
    expect(content.prompt.startsWith(content.skillPrefix)).toBe(true)
    expect(() =>
      assertPromptCoverage(
        content.prompt,
        content.skillPrefix,
        content.sections,
        content.sectionMarkers,
      ),
    ).not.toThrow()
  })

  it('每个章节标记都指向 sections 中的一个 .md 文件', () => {
    expect(content.sectionMarkers.length).toBeGreaterThan(0)
    for (const marker of content.sectionMarkers) {
      expect(marker.file).toMatch(/\.md$/)
      expect(content.sections[marker.file]).toBeTypeOf('string')
      expect(marker.marker.startsWith('#')).toBe(true)
    }
    expect(Object.keys(content.sections).sort()).toEqual(
      content.sectionMarkers.map((m) => m.file).sort(),
    )
  })

  it('章节标记按 index 升序且不重叠', () => {
    const indexes = content.sectionMarkers.map((m) => m.index)
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b))
  })

  it('flatPrompt 模式下 skillPrefix 即完整 prompt，无分片', () => {
    const flat = genSkillContent('vue', materialsMeta, undefined, undefined, {
      flatPrompt: true,
    })
    expect(flat.skillPrefix).toBe(flat.prompt)
    expect(flat.sections).toEqual({})
    expect(flat.sectionMarkers).toEqual([])
  })

  it('接受自定义框架配置对象', () => {
    const custom = genSkillContent(
      { rules: ['自定义规则：只输出 schemaJson'] },
      materialsMeta,
    )
    expect(custom.prompt).toContain('自定义规则：只输出 schemaJson')
  })

  it('可覆盖 genPrompt 选项', () => {
    const slim = genSkillContent('vue', materialsMeta, undefined, {
      includeExamples: false,
    })
    expect(slim.prompt).not.toContain('## 卡片示例')
    expect(slim.sectionMarkers.some((m) => m.file === 'examples.md')).toBe(false)
  })
})

describe('splitPromptSections() / extractReferenceSections()', () => {
  it('围栏代码块内的 ## 行不作为章节标记', () => {
    const prompt = [
      '# 前缀',
      '',
      '## 可用组件',
      '正文 A',
      '```md',
      '## 代码块里的标题',
      '```',
      '~~~',
      '## 另一个代码块标题',
      '~~~',
      '## 卡片示例',
      '正文 B',
    ].join('\n')

    const markers = extractReferenceSections(prompt)
    expect(markers.map((m) => m.title)).toEqual(['可用组件', '卡片示例'])

    const sections = splitPromptSections(prompt, markers)
    const rebuilt = markers.reduce(
      (acc, m) => acc + sections[m.file],
      prompt.slice(0, markers[0].index),
    )
    expect(rebuilt).toBe(prompt)
  })
})
