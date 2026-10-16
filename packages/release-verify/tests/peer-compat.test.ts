import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { satisfies } from 'semver'
import { describe, expect, it } from 'vitest'
import { repoRoot } from './helpers/repo'

interface PeerCheck {
  workspace: string
  sdkPackage: string
  peer: string
  runtimePackage: string
}

function installedVersion(workspace: string, pkg: string): string | undefined {
  const path = join(repoRoot, workspace, 'node_modules', pkg, 'package.json')
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf-8')).version
}

function peerRange(workspace: string, sdkPackage: string, peer: string): string | undefined {
  const path = join(repoRoot, workspace, 'node_modules', sdkPackage, 'package.json')
  if (!existsSync(path)) return undefined
  const pkg = JSON.parse(readFileSync(path, 'utf-8'))
  return pkg.peerDependencies?.[peer]
}

/** 站点实际安装的框架版本是否满足 SDK 声明的 peer 范围。 */
function checkPeer({ workspace, sdkPackage, peer, runtimePackage }: PeerCheck) {
  const range = peerRange(workspace, sdkPackage, peer)
  const actual = installedVersion(workspace, runtimePackage)
  return { range, actual, ok: Boolean(range && actual && satisfies(actual, range, { includePrerelease: true })) }
}

describe('框架 peer 依赖兼容性', () => {
  it('Vue 站点满足 element-plus 物料的 vue peer 范围', () => {
    const result = checkPeer({
      workspace: 'sites/web',
      sdkPackage: '@opentiny/genui-sdk-materials-vue-element-plus',
      peer: 'vue',
      runtimePackage: 'vue',
    })
    expect(result.actual, '未安装 vue').toBeDefined()
    expect(result.range, '未找到 vue peer 声明').toBeDefined()
    expect(result.ok, `vue@${result.actual} 不满足 ${result.range}`).toBe(true)
  })

  it('React 站点满足 react 渲染器的 react peer 范围', () => {
    const result = checkPeer({
      workspace: 'sites/genui-react',
      sdkPackage: '@opentiny/genui-sdk-react',
      peer: 'react',
      runtimePackage: 'react',
    })
    expect(result.actual, '未安装 react').toBeDefined()
    expect(result.range, '未找到 react peer 声明').toBeDefined()
    expect(result.ok, `react@${result.actual} 不满足 ${result.range}`).toBe(true)
  })

  /**
   * 已知问题：@opentiny/genui-sdk-angular@1.4.0 仍然声明
   * peer @angular/core@^20.3.0，而站点已经使用 Angular 21。
   * pnpm install 会报 unmet peer（安装成功但属于不受支持的组合）。
   *
   * 用 it.fails 记录这个已知不兼容：一旦上游把 peer 范围放宽到 21，
   * 这个用例会因为「预期失败却通过了」而报错，提醒我们删掉这段标记。
   */
  it.fails('Angular 站点满足 angular 渲染器的 @angular/core peer 范围（已知不兼容）', () => {
    const result = checkPeer({
      workspace: 'sites/genui-angular',
      sdkPackage: '@opentiny/genui-sdk-angular',
      peer: '@angular/core',
      runtimePackage: '@angular/core',
    })
    expect(result.actual, '未安装 @angular/core').toBeDefined()
    expect(result.range, '未找到 @angular/core peer 声明').toBeDefined()
    expect(result.ok, `@angular/core@${result.actual} 不满足 ${result.range}`).toBe(true)
  })
})
