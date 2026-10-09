import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  assertWrittenPromptCoverage,
  buildGenuiSchemaSkillBody,
  generateSkillFiles,
} from '@opentiny/genui-sdk-skill-generator'
import { miniMaterialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'
import { cleanupTempDir, exists, listFiles, makeTempDir, readText, stripFrontmatter } from './fixtures'

let root: string
let skillDir: string

beforeEach(() => {
  root = makeTempDir('skill-gen-files-')
  skillDir = join(root, 'genui-schema-json')
})

afterEach(() => {
  cleanupTempDir(root)
})

describe('generateSkillFiles() — 默认生成流程', () => {
  it('生成 SKILL.md、reference/generated 分片与 components.md 索引', () => {
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      formatSkillBody: buildGenuiSchemaSkillBody,
      referenceSubdir: 'generated',
      syncComponentsIndex: true,
      prune: true,
    })

    expect(result.skillDirs).toEqual([skillDir])
    expect(result.prompt.length).toBeGreaterThan(0)

    const files = listFiles(skillDir)
    expect(files).toContain('SKILL.md')
    expect(files).toContain(join('reference', 'components.md'))
    for (const section of Object.keys(result.sections)) {
      expect(files).toContain(join('reference', 'generated', section))
    }
  })

  it('SKILL.md 保留默认 frontmatter，正文以 genPrompt 前缀逐字开头，formatter 只追加在其后', () => {
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      formatSkillBody: buildGenuiSchemaSkillBody,
    })

    const skill = readText(join(skillDir, 'SKILL.md'))
    expect(skill.startsWith('---\n')).toBe(true)

    const body = stripFrontmatter(skill)
    expect(body.startsWith(result.skillPrefix)).toBe(true)
    expect(body.slice(result.skillPrefix.length)).toContain('## 组件类型索引')
  })

  it('落盘结果可逐字还原 genPrompt 输出', () => {
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
    })

    expect(() =>
      assertWrittenPromptCoverage(
        skillDir,
        result.prompt,
        result.skillPrefix,
        result.sectionMarkers,
      ),
    ).not.toThrow()
  })

  it('篡改磁盘上的分片后覆盖率校验失败', () => {
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
    })

    const target = join(
      skillDir,
      'reference',
      'generated',
      result.sectionMarkers[0].file,
    )
    writeFileSync(target, `${readFileSync(target, 'utf-8')}\n<!-- tampered -->`)

    expect(() =>
      assertWrittenPromptCoverage(
        skillDir,
        result.prompt,
        result.skillPrefix,
        result.sectionMarkers,
      ),
    ).toThrow(/无法逐字还原|不一致/)
  })

  it('按组件类型生成详情文件并同步白名单索引', () => {
    generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      syncComponentsIndex: true,
    })

    const categoryDir = join(skillDir, 'reference', 'generated', 'components')
    expect(existsSync(categoryDir)).toBe(true)
    const categories = readdirSync(categoryDir).sort()
    expect(categories.length).toBeGreaterThan(1)
    expect(categories).toContain('basic.md')

    const index = readText(join(skillDir, 'reference', 'components.md'))
    expect(index).toContain('<!-- genui-skill-generator:start -->')
    expect(index).toContain('<!-- genui-skill-generator:end -->')
    expect(index).toContain('TinyButton')
  })

  it('保留首个输出目录已有的 SKILL.md frontmatter，并复用到所有目录', () => {
    const second = join(root, 'second-skill')
    mkdirSync(skillDir, { recursive: true })
    writeFileSync(
      join(skillDir, 'SKILL.md'),
      '---\nname: my-custom-skill\ndescription: 自定义\n---\n\n旧正文\n',
    )

    generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir, second],
      formatSkillBody: buildGenuiSchemaSkillBody,
    })

    for (const dir of [skillDir, second]) {
      const skill = readText(join(dir, 'SKILL.md'))
      expect(skill).toContain('name: my-custom-skill')
      expect(skill).not.toContain('旧正文')
    }
  })

  it('flatPrompt 只写 SKILL.md，不生成 reference/', () => {
    const result = generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      flatPrompt: true,
    })

    expect(listFiles(skillDir)).toEqual(['SKILL.md'])
    expect(result.sections).toEqual({})
    expect(existsSync(join(skillDir, 'reference'))).toBe(false)
  })

  it('prune 清理生成目录中的过期文件，但不触碰手写 reference 文件', () => {
    generateSkillFiles('vue', miniMaterialsMeta, { skillDirs: [skillDir] })

    const generatedDir = join(skillDir, 'reference', 'generated')
    writeFileSync(join(generatedDir, 'stale.md'), 'stale')
    const handwritten = join(skillDir, 'reference', 'quick-ref.md')
    writeFileSync(handwritten, '手写补充文档')

    generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      prune: true,
    })

    expect(exists(generatedDir, 'stale.md')).toBe(false)
    expect(readText(handwritten)).toBe('手写补充文档')
  })

  it('prune: false 时保留生成目录中的旧文件', () => {
    generateSkillFiles('vue', miniMaterialsMeta, { skillDirs: [skillDir] })

    const generatedDir = join(skillDir, 'reference', 'generated')
    writeFileSync(join(generatedDir, 'stale.md'), 'stale')

    generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      prune: false,
    })

    expect(exists(generatedDir, 'stale.md')).toBe(true)
  })

  it('referenceSubdir 为空时直接写入 reference/，并保留手写文件', () => {
    mkdirSync(join(skillDir, 'reference'), { recursive: true })
    writeFileSync(join(skillDir, 'reference', 'quick-ref.md'), '手写')

    generateSkillFiles('vue', miniMaterialsMeta, {
      skillDirs: [skillDir],
      referenceSubdir: '',
      prune: false,
    })

    const referenceDir = join(skillDir, 'reference')
    expect(exists(referenceDir, 'components.md')).toBe(true)
    expect(exists(referenceDir, 'quick-ref.md')).toBe(true)
    expect(existsSync(join(referenceDir, 'generated'))).toBe(false)
  })
})

describe('generateSkillFiles() — 参数校验与安全约束', () => {
  it('skillDirs 为空时抛错', () => {
    expect(() =>
      generateSkillFiles('vue', miniMaterialsMeta, { skillDirs: [] }),
    ).toThrow(/不能为空/)
  })

  it('referenceSubdir 逃出 reference/ 时抛错', () => {
    expect(() =>
      generateSkillFiles('vue', miniMaterialsMeta, {
        skillDirs: [skillDir],
        referenceSubdir: '../evil',
      }),
    ).toThrow(/不安全/)
  })

  it('referenceSubdir 指向手写目录 components / examples 时抛错', () => {
    for (const subdir of ['components', 'components/sub', 'examples']) {
      expect(() =>
        generateSkillFiles('vue', miniMaterialsMeta, {
          skillDirs: [skillDir],
          referenceSubdir: subdir,
        }),
      ).toThrow(/手写目录/)
    }
  })

  it('referenceSubdir 为空时禁止 prune', () => {
    expect(() =>
      generateSkillFiles('vue', miniMaterialsMeta, {
        skillDirs: [skillDir],
        referenceSubdir: '',
        prune: true,
      }),
    ).toThrow(/不能启用 prune/)
  })
})
