import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  buildGenuiSchemaSkillBody,
  generateSkillFiles,
} from '@opentiny/genui-sdk-skill-generator'
import type { IGenerateSkillResult } from '@opentiny/genui-sdk-skill-generator'
import {
  MATERIALS_PRESETS,
  getMaterialsPreset,
  loadMaterialsMeta,
  type MaterialsPreset,
} from './materials-presets.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outRoot = join(__dirname, '../out-skill')

/**
 * 编程式生成：按物料库预设调用 generateSkillFiles。
 * 对应文档 https://opentiny.github.io/genui-sdk/docs/components/skill-generator/api.html
 */
export async function generateSkill(
  preset: MaterialsPreset,
): Promise<IGenerateSkillResult> {
  const materialsMeta = await loadMaterialsMeta(preset)
  const skillDir = join(outRoot, preset.id)
  mkdirSync(skillDir, { recursive: true })

  return generateSkillFiles(preset.framework, materialsMeta, {
    skillDirs: [skillDir],
    formatSkillBody: buildGenuiSchemaSkillBody,
    // OpenTiny Vue 不传，沿用包内置 frontmatter；其他组件库用自定义 frontmatter 覆盖
    defaultFrontmatter: preset.defaultFrontmatter,
    referenceSubdir: 'generated',
    syncComponentsIndex: true,
    prune: true,
  })
}

/** 生成全部物料库 skill。 */
export async function generateAllSkills() {
  const results: Array<{ preset: MaterialsPreset; result: IGenerateSkillResult }> = []
  for (const preset of MATERIALS_PRESETS) {
    results.push({ preset, result: await generateSkill(preset) })
  }
  return results
}

function parsePresetArg(argv: string[]): MaterialsPreset[] {
  const index = argv.indexOf('--preset')
  const id = index >= 0 ? argv[index + 1] : argv.find((a) => !a.startsWith('-'))
  if (index >= 0 && !id) throw new Error('--preset 需要指定预设 id')
  if (!id || id === 'all') return MATERIALS_PRESETS
  return [getMaterialsPreset(id)]
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  try {
    const presets = parsePresetArg(process.argv.slice(2))
    for (const preset of presets) {
      const result = await generateSkill(preset)
      console.log(
        `[${preset.id}] ${preset.title} → ${result.skillDirs[0]} (${result.sectionMarkers.length} sections, ${result.prompt.length} chars)`,
      )
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
