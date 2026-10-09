import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createSkillGenerateUsage,
  loadSkillGenerateConfig,
  parseSkillGenerateArgs,
  resolveConfigPath,
  resolveConfiguredSkillDirs,
  runSkillGenerateCli,
} from '@opentiny/genui-sdk-skill-generator'
import type { ISkillGenerateConfig } from '@opentiny/genui-sdk-skill-generator'
import { cleanupTempDir, makeTempDir, readText } from './fixtures'

const cliPath = fileURLToPath(
  new URL(
    '../node_modules/@opentiny/genui-sdk-skill-generator/dist/cli.js',
    import.meta.url,
  ),
)
const packageJsonPath = fileURLToPath(
  new URL(
    '../node_modules/@opentiny/genui-sdk-skill-generator/package.json',
    import.meta.url,
  ),
)

const validConfig: ISkillGenerateConfig = {
  framework: 'vue',
  materialsMetaModule: '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta',
  materialsMetaExport: 'miniMaterialsMeta',
  skillDirs: ['./skills/my-skill'],
  skillBodyFormatter: 'genui-schema-json',
  referenceSubdir: 'generated',
  syncComponentsIndex: true,
  prune: true,
  flatPrompt: false,
}

let root: string

beforeEach(() => {
  root = makeTempDir('skill-cli-')
})

afterEach(() => {
  cleanupTempDir(root)
})

function writeConfig(name: string, config: unknown) {
  const path = join(root, name)
  writeFileSync(path, JSON.stringify(config, null, 2))
  return path
}

describe('parseSkillGenerateArgs()', () => {
  const context = { defaultConfigPath: '/def/config.json', cwd: '/cwd' }

  it('无参数时使用默认配置与 cwd 基准', () => {
    expect(parseSkillGenerateArgs([], context)).toEqual({
      configPath: '/def/config.json',
      options: { outputBaseDir: '/cwd' },
      help: false,
    })
  })

  it('--out 覆盖输出目录', () => {
    expect(parseSkillGenerateArgs(['--out', './o1'], context)).toEqual({
      configPath: '/def/config.json',
      options: { outputBaseDir: '/cwd', skillDirs: ['./o1'] },
      help: false,
    })
  })

  it('--config 指定配置文件，位置参数同样生效', () => {
    expect(parseSkillGenerateArgs(['--config', './x.json'], context).configPath).toBe(
      './x.json',
    )
    expect(parseSkillGenerateArgs(['x.json'], context).configPath).toBe('x.json')
  })

  it('-h / --help 返回 help 标记', () => {
    expect(parseSkillGenerateArgs(['-h'], context).help).toBe(true)
    expect(parseSkillGenerateArgs(['--help'], context).help).toBe(true)
  })

  it('非法参数抛错', () => {
    expect(() => parseSkillGenerateArgs(['--out'], context)).toThrow(/需要指定输出目录/)
    expect(() => parseSkillGenerateArgs(['--bogus'], context)).toThrow(/未知选项/)
  })
})

describe('loadSkillGenerateConfig() / 路径解析', () => {
  it('读取并返回配置与配置目录', () => {
    const path = writeConfig('genui-skill.config.json', validConfig)
    const { config, configDir } = loadSkillGenerateConfig(path)
    expect(configDir).toBe(root)
    expect(config.framework).toBe('vue')
    expect(config.skillDirs).toEqual(['./skills/my-skill'])
  })

  it('缺少必填项时抛错', () => {
    expect(() => loadSkillGenerateConfig(writeConfig('a.json', []))).toThrow(
      /materialsMetaModule、skillDirs/,
    )
    expect(() =>
      loadSkillGenerateConfig(writeConfig('b.json', { skillDirs: ['./a'] })),
    ).toThrow(/materialsMetaModule、skillDirs/)
    expect(() =>
      loadSkillGenerateConfig(writeConfig('c.json', { materialsMetaModule: 'x' })),
    ).toThrow(/materialsMetaModule、skillDirs/)
  })

  it('配置文件不存在时抛错', () => {
    expect(() => loadSkillGenerateConfig(join(root, 'missing.json'))).toThrow()
  })

  it('resolveConfigPath 解析相对路径为绝对路径', () => {
    expect(resolveConfigPath(root, './skills/my-skill')).toBe(join(root, 'skills/my-skill'))
    expect(resolveConfigPath(root, '/abs/dir')).toBe('/abs/dir')
  })

  it('resolveConfiguredSkillDirs 支持覆盖与基准目录', () => {
    expect(resolveConfiguredSkillDirs(validConfig, root)).toEqual([
      join(root, 'skills/my-skill'),
    ])
    expect(resolveConfiguredSkillDirs(validConfig, root, ['./other'])).toEqual([
      join(root, 'other'),
    ])
  })

  it('createSkillGenerateUsage 生成帮助文本', () => {
    const usage = createSkillGenerateUsage()
    expect(usage).toContain('用法:')
    expect(usage).toContain('--config')
    expect(createSkillGenerateUsage('my-cli')).toContain('my-cli')
  })
})

describe('runSkillGenerateCli()', () => {
  it('相对 skillDirs 以配置文件目录为基准生成 skill', async () => {
    const configPath = writeConfig('genui-skill.config.json', validConfig)

    await runSkillGenerateCli(configPath)

    const skillDir = join(root, 'skills', 'my-skill')
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true)
    expect(existsSync(join(skillDir, 'reference', 'generated', 'rules.md'))).toBe(true)
    expect(existsSync(join(skillDir, 'reference', 'components.md'))).toBe(true)
    expect(readText(join(skillDir, 'SKILL.md'))).toContain('## 工作流')
  })

  it('outputBaseDir 与 skillDirs 覆盖配置', async () => {
    const configPath = writeConfig('genui-skill.config.json', validConfig)
    const base = join(root, 'base')

    await runSkillGenerateCli(configPath, {
      outputBaseDir: base,
      skillDirs: ['./custom-skill'],
    })

    expect(existsSync(join(base, 'custom-skill', 'SKILL.md'))).toBe(true)
    expect(existsSync(join(root, 'skills'))).toBe(false)
  })

  it('flatPrompt 配置只生成 SKILL.md', async () => {
    const configPath = writeConfig('flat.json', {
      ...validConfig,
      flatPrompt: true,
    })

    await runSkillGenerateCli(configPath)

    const skillDir = join(root, 'skills', 'my-skill')
    expect(existsSync(join(skillDir, 'SKILL.md'))).toBe(true)
    expect(existsSync(join(skillDir, 'reference'))).toBe(false)
  })
})

describe('genui-skill-generate 可执行文件', () => {
  it('package.json 的 bin 指向 dist/cli.js', () => {
    const pkg = JSON.parse(readText(packageJsonPath))
    expect(pkg.bin['genui-skill-generate']).toBe('./dist/cli.js')
  })

  it('--help 退出码为 0 并打印用法', () => {
    const stdout = execFileSync(process.execPath, [cliPath, '--help'], {
      encoding: 'utf-8',
    })
    expect(stdout).toContain('用法:')
    expect(stdout).toContain('--out')
  })

  it('--config 端到端生成 skill', () => {
    const configPath = writeConfig('genui-skill.config.json', validConfig)

    const stdout = execFileSync(process.execPath, [cliPath, '--config', configPath], {
      encoding: 'utf-8',
      cwd: root,
    })

    expect(stdout).toContain('Generated skill')
    expect(existsSync(join(root, 'skills', 'my-skill', 'SKILL.md'))).toBe(true)
  })

  it('--out 覆盖配置文件中的输出目录', () => {
    const configPath = writeConfig('genui-skill.config.json', validConfig)
    const outDir = join(root, 'cli-out')

    execFileSync(process.execPath, [cliPath, '--config', configPath, '--out', outDir], {
      encoding: 'utf-8',
      cwd: root,
    })

    expect(existsSync(join(outDir, 'SKILL.md'))).toBe(true)
  })

  it('未知选项时非零退出并打印错误', () => {
    expect(() =>
      execFileSync(process.execPath, [cliPath, '--bogus'], {
        encoding: 'utf-8',
        stdio: 'pipe',
      }),
    ).toThrow()
  })
})
