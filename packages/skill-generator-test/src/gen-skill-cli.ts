import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  loadSkillGenerateConfig,
  resolveConfiguredSkillDirs,
} from '@opentiny/genui-sdk-skill-generator'
import {
  MATERIALS_PRESETS,
  getMaterialsPreset,
  type MaterialsPreset,
} from './materials-presets.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageRoot = join(__dirname, '..')
const cliPath = join(
  packageRoot,
  'node_modules/@opentiny/genui-sdk-skill-generator/dist/cli.js',
)

export function configPathFor(preset: MaterialsPreset) {
  return join(packageRoot, 'configs', `${preset.id}.json`)
}

/**
 * 先用已有 SKILL.md 预置 frontmatter，再调用 CLI。
 * CLI 配置（ISkillGenerateConfig）没有 defaultFrontmatter 字段，而生成流程会复用
 * 首个输出目录中已有的 frontmatter，因此这是 CLI 路径下自定义 frontmatter 的办法。
 */
function seedFrontmatter(preset: MaterialsPreset, configPath: string, outDir?: string) {
  if (!preset.defaultFrontmatter) return

  const { config, configDir } = loadSkillGenerateConfig(configPath)
  const [skillDir] = resolveConfiguredSkillDirs(
    config,
    configDir,
    outDir ? [resolve(outDir)] : undefined,
  )
  if (!skillDir) return

  const entry = join(skillDir, 'SKILL.md')
  if (existsSync(entry)) return

  mkdirSync(skillDir, { recursive: true })
  writeFileSync(entry, preset.defaultFrontmatter)
}

/** 调用真实的 genui-skill-generate 二进制生成一个预设。 */
export function runPresetCli(preset: MaterialsPreset, outDir?: string) {
  const configPath = configPathFor(preset)
  seedFrontmatter(preset, configPath, outDir)

  const args = [cliPath, '--config', configPath]
  if (outDir) args.push('--out', outDir)

  const { status } = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: packageRoot,
  })
  if (status !== 0) {
    throw new Error(`[${preset.id}] genui-skill-generate 退出码 ${status}`)
  }
}

function parseArgs(argv: string[]) {
  const ids: string[] = []
  let outDir: string | undefined

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--out') {
      outDir = argv[i + 1]
      if (!outDir) throw new Error('--out 需要指定输出目录')
      i += 1
    } else if (arg.startsWith('-')) {
      throw new Error(`未知选项: ${arg}`)
    } else {
      ids.push(arg)
    }
  }

  return { ids, outDir }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  try {
    const { ids, outDir } = parseArgs(process.argv.slice(2))
    if (outDir && ids.length > 1) {
      throw new Error('--out 只能配合单个物料库预设使用')
    }

    const presets = ids.length ? ids.map(getMaterialsPreset) : MATERIALS_PRESETS
    for (const preset of presets) {
      runPresetCli(preset, outDir)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
