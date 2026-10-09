import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertWrittenPromptCoverage,
  buildGenuiSchemaSkillBody,
  extractComponentsWhitelist,
  findSectionByTitle,
  generateSkillFiles,
  genSkillContent,
  groupComponentsByCategory,
  parseWhitelistNames,
} from '@opentiny/genui-sdk-skill-generator'
import type { IMaterialsMeta } from '@opentiny/genui-sdk-core'
import { MATERIALS_PRESETS, loadMaterialsMeta } from '../src/materials-presets'
import { cleanupTempDir, exists, listFiles, makeTempDir, readText, stripFrontmatter } from './fixtures'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const cliPath = join(
  packageRoot,
  'node_modules/@opentiny/genui-sdk-skill-generator/dist/cli.js',
)
const configPath = (id: string) => join(packageRoot, 'configs', `${id}.json`)

/** 文档中 genPrompt 的标准章节 */
const STANDARD_SECTIONS = [
  'components.md',
  'json-schema.md',
  'examples.md',
  'schema-snippets.md',
  'this-context.md',
  'rules.md',
]

const metaCache = new Map<string, IMaterialsMeta>()
async function metaFor(id: string) {
  if (!metaCache.has(id)) {
    metaCache.set(id, (await loadMaterialsMeta(getPreset(id))) as IMaterialsMeta)
  }
  return metaCache.get(id)!
}
function getPreset(id: string) {
  const preset = MATERIALS_PRESETS.find((item) => item.id === id)
  if (!preset) throw new Error(`unknown preset ${id}`)
  return preset
}

describe('物料库预设', () => {
  it('覆盖 4 个已发布的组件库物料包', () => {
    expect(MATERIALS_PRESETS.map((p) => p.id)).toEqual([
      'opentiny-vue',
      'element-plus',
      'opentiny-ng',
      'antd',
    ])
    expect(new Set(MATERIALS_PRESETS.map((p) => p.id)).size).toBe(4)
    expect(MATERIALS_PRESETS.map((p) => p.framework)).toEqual([
      'vue',
      'vue',
      'angular',
      'react',
    ])
  })

  it.each(MATERIALS_PRESETS)('$id 的 CLI 配置与预设一致', (preset) => {
    const config = JSON.parse(readText(configPath(preset.id)))
    expect(config.framework).toBe(preset.framework)
    expect(config.materialsMetaModule).toBe(preset.materialsMetaModule)
    // 未显式声明时默认 materialsMeta
    expect(config.materialsMetaExport ?? 'materialsMeta').toBe(
      preset.materialsMetaExport,
    )
    expect(config.skillBodyFormatter).toBe('genui-schema-json')
  })
})

describe.each(MATERIALS_PRESETS)('$id — $title', (preset) => {
  let root: string
  let skillDir: string

  beforeEach(() => {
    root = makeTempDir(`skill-${preset.id}-`)
    skillDir = join(root, preset.id)
  })

  afterEach(() => cleanupTempDir(root))

  it('genPrompt 输出包含标准章节，物料白名单非空', async () => {
    const meta = await metaFor(preset.id)
    const content = genSkillContent(preset.framework, meta)

    expect(content.prompt.length).toBeGreaterThan(0)
    expect(content.sectionMarkers.map((m) => m.file)).toEqual(STANDARD_SECTIONS)

    const detail = content.sections[
      findSectionByTitle(content.sectionMarkers, '可用组件')!.file
    ]
    const names = parseWhitelistNames(extractComponentsWhitelist(detail))
    expect(names.length).toBeGreaterThan(0)
  })

  it('物料元数据的 wrapperComponent 与预设一致', async () => {
    const meta = await metaFor(preset.id)
    expect(meta.wrapperComponent).toBe(preset.wrapperComponent)
  })

  it('generateSkillFiles 生成完整 skill 且可逐字还原 Prompt', async () => {
    const meta = await metaFor(preset.id)
    const result = generateSkillFiles(preset.framework, meta, {
      skillDirs: [skillDir],
      formatSkillBody: buildGenuiSchemaSkillBody,
      defaultFrontmatter: preset.defaultFrontmatter,
      referenceSubdir: 'generated',
      syncComponentsIndex: true,
      prune: true,
    })

    const files = listFiles(skillDir)
    expect(files).toContain('SKILL.md')
    expect(files).toContain(join('reference', 'components.md'))
    for (const section of STANDARD_SECTIONS) {
      expect(files).toContain(join('reference', 'generated', section))
    }

    expect(() =>
      assertWrittenPromptCoverage(
        skillDir,
        result.prompt,
        result.skillPrefix,
        result.sectionMarkers,
        'generated',
      ),
    ).not.toThrow()
  })

  it('SKILL.md 使用对应 frontmatter 与包裹组件', async () => {
    const meta = await metaFor(preset.id)
    generateSkillFiles(preset.framework, meta, {
      skillDirs: [skillDir],
      formatSkillBody: buildGenuiSchemaSkillBody,
      defaultFrontmatter: preset.defaultFrontmatter,
    })

    const skill = readText(join(skillDir, 'SKILL.md'))
    expect(skill).toContain(`name: ${preset.skillName}`)
    expect(skill).toContain(`\`${preset.wrapperComponent}\` 包裹`)

    // 骨架示例也使用物料库的包裹组件，而不是固定的 TinyCard
    const body = stripFrontmatter(skill)
    expect(body).toContain(`"componentName": "${preset.wrapperComponent}"`)
  })

  it('按类型拆分的组件详情与分组一致', async () => {
    const meta = await metaFor(preset.id)
    const result = genSkillContent(preset.framework, meta)
    const detail =
      result.sections[findSectionByTitle(result.sectionMarkers, '可用组件')!.file]
    const groups = groupComponentsByCategory(
      parseWhitelistNames(extractComponentsWhitelist(detail)),
      { materials: meta.materials },
    )

    generateSkillFiles(preset.framework, meta, { skillDirs: [skillDir] })

    const categoryDir = join(skillDir, 'reference', 'generated', 'components')
    expect(existsSync(categoryDir)).toBe(true)
    for (const group of groups) {
      expect(exists(categoryDir, `${group.id}.md`)).toBe(true)
    }
    for (const group of groups) {
      expect(readText(join(skillDir, 'reference', 'components.md'))).toContain(
        `### ${group.label}`,
      )
    }
  })
})

describe('CLI 生成其他组件库', () => {
  let root: string

  beforeEach(() => {
    root = makeTempDir('skill-cli-matrix-')
  })

  afterEach(() => cleanupTempDir(root))

  it.each(MATERIALS_PRESETS)('$id 通过 --config + --out 生成 skill', (preset) => {
    const outDir = join(root, preset.id)

    const stdout = execFileSync(
      process.execPath,
      [cliPath, '--config', configPath(preset.id), '--out', outDir],
      { encoding: 'utf-8', cwd: packageRoot },
    )

    expect(stdout).toContain('Generated skill')
    expect(existsSync(join(outDir, 'SKILL.md'))).toBe(true)
    expect(existsSync(join(outDir, 'reference', 'generated', 'rules.md'))).toBe(true)
    expect(existsSync(join(outDir, 'reference', 'components.md'))).toBe(true)
    expect(readText(join(outDir, 'SKILL.md'))).toContain(preset.wrapperComponent)
  })

  it('antd-flat 配置只生成 SKILL.md', () => {
    const outDir = join(root, 'antd-flat')

    execFileSync(
      process.execPath,
      [cliPath, '--config', configPath('antd-flat'), '--out', outDir],
      { encoding: 'utf-8', cwd: packageRoot },
    )

    expect(listFiles(outDir)).toEqual(['SKILL.md'])
  })

  it('CLI 会复用输出目录中已有的自定义 frontmatter', () => {
    const outDir = join(root, 'seeded')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(
      join(outDir, 'SKILL.md'),
      '---\nname: my-element-plus-skill\ndescription: 自定义描述\n---\n',
    )

    execFileSync(
      process.execPath,
      [cliPath, '--config', configPath('element-plus'), '--out', outDir],
      { encoding: 'utf-8', cwd: packageRoot },
    )

    const skill = readText(join(outDir, 'SKILL.md'))
    expect(skill).toContain('name: my-element-plus-skill')
    expect(skill).toContain('自定义描述')
    // 正文仍然是真实生成的 genPrompt 内容
    expect(skill).toContain('ElCard')
  })
})
