import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from './helpers/repo'

/** 1.4.0-beta.1 的 vue 包必须暴露这些子路径入口。 */
const requiredSubpaths = [
  '.',
  './chat',
  './legacy-chat',
  './renderer',
  './legacy-renderer',
  './config-provider',
  './legacy-config-provider',
  './transform-jsx',
  './code-generator',
]

function vuePackageDir() {
  const candidates = [
    join(repoRoot, 'sites/web/node_modules/@opentiny/genui-sdk-vue'),
    join(repoRoot, 'packages/release-verify/node_modules/@opentiny/genui-sdk-vue'),
  ]
  const found = candidates.find((dir) => existsSync(join(dir, 'package.json')))
  if (!found) throw new Error('未找到 @opentiny/genui-sdk-vue，请先执行 pnpm install')
  return found
}

describe('@opentiny/genui-sdk-vue 包结构（1.4.0-beta.1）', () => {
  const pkg = JSON.parse(readFileSync(join(vuePackageDir(), 'package.json'), 'utf-8'))

  it('版本为目标版本', () => {
    expect(pkg.version).toBe('1.4.0-beta.1')
  })

  it.each(requiredSubpaths)('导出子路径 %s', (subpath) => {
    expect(Object.keys(pkg.exports ?? {}), `缺少 exports 子路径: ${subpath}`).toContain(subpath)
  })

  it('每个 exports 子路径都指向真实存在的产物文件', () => {
    const dir = vuePackageDir()
    const missing: string[] = []
    for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
      const importPath = (target as any).import ?? (target as any).default
      if (typeof importPath === 'string' && !existsSync(join(dir, importPath))) {
        missing.push(`${subpath} → ${importPath}`)
      }
    }
    expect(missing, 'exports 指向了不存在的文件（发布产物缺失）').toEqual([])
  })

  it('内部依赖 genui-sdk-core / materials 与自身版本一致', () => {
    const genuiDeps = Object.entries(pkg.dependencies ?? {}).filter(([name]) =>
      name.startsWith('@opentiny/genui-sdk-'),
    )
    expect(genuiDeps.length).toBeGreaterThan(0)
    for (const [name, version] of genuiDeps) {
      expect(version, `${name} 的版本与发布版本不一致`).toBe('1.4.0-beta.1')
    }
  })
})

describe('code-generator 子路径（1.4.0 新增）', () => {
  it('导出 generateCode 与 VueCodeGenerator', async () => {
    const mod = await import('@opentiny/genui-sdk-vue/code-generator')
    expect(mod.generateCode).toBeTypeOf('function')
    expect(mod.VueCodeGenerator).toBeDefined()
  })

  it('能把简单 Schema 反向生成 Vue SFC', async () => {
    const { generateCode } = await import('@opentiny/genui-sdk-vue/code-generator')

    const result = await generateCode({
      pageInfo: {
        name: 'EmployeeForm',
        schema: {
          componentName: 'Page',
          state: { name: '张三' },
          children: [
            {
              componentName: 'TinyCard',
              props: { title: '员工信息' },
              children: [
                { componentName: 'Text', props: { text: { type: 'JSExpression', value: 'this.state.name' } } },
              ],
            },
          ],
        },
      },
      componentsMap: [
        { componentName: 'TinyCard', package: '@opentiny/vue', exportName: 'TinyCard' },
      ],
      formatWithPrettier: true,
    } as any)

    expect(result).toBeTruthy()
    expect(result.panelName).toBe('EmployeeForm.vue')
    expect(result.panelType).toBe('vue')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors, `代码生成报告了错误: ${JSON.stringify(result.errors)}`).toEqual([])
    expect(result.panelValue).toMatch(/<template>/)
    expect(result.panelValue).toMatch(/TinyCard/)
  })
})
