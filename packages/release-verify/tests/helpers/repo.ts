import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 当前这次发布要验证的版本。 */
export const EXPECTED_VERSION = '1.4.0-beta.1'

/** GenUI SDK 的包名前缀。 */
export const GENUI_PREFIX = '@opentiny/genui-sdk-'

/** 仓库根目录（packages/release-verify/tests/helpers -> ../../../..）。 */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')

export interface Workspace {
  /** 相对仓库根目录的路径，根工作区为 '.'。 */
  dir: string
  /** 绝对路径。 */
  absDir: string
  pkg: Record<string, any>
}

export function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T
}

/** 枚举根工作区 + packages/* + sites/* 下的全部 package.json。 */
export function listWorkspaces(): Workspace[] {
  const dirs: string[] = ['.']
  for (const group of ['packages', 'sites']) {
    const base = join(repoRoot, group)
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base)) {
      if (existsSync(join(base, entry, 'package.json'))) dirs.push(join(group, entry))
    }
  }
  return dirs.map((dir) => ({
    dir,
    absDir: join(repoRoot, dir),
    pkg: readJson(join(repoRoot, dir, 'package.json')),
  }))
}

/** 某个工作区声明的所有 @opentiny/genui-sdk-* 依赖（含 dependencies / devDependencies）。 */
export function declaredGenuiDeps(ws: Workspace): Array<{ name: string; spec: string; field: string }> {
  const out: Array<{ name: string; spec: string; field: string }> = []
  for (const field of ['dependencies', 'devDependencies'] as const) {
    for (const [name, spec] of Object.entries(ws.pkg[field] ?? {})) {
      if (name.startsWith(GENUI_PREFIX)) out.push({ name, spec: spec as string, field })
    }
  }
  return out
}

/** 读取某个工作区里实际安装的包版本（直接读 node_modules 下的 package.json）。 */
export function installedVersion(ws: Workspace, name: string): string | undefined {
  const pj = join(ws.absDir, 'node_modules', name, 'package.json')
  if (!existsSync(pj)) return undefined
  return readJson(pj).version as string
}

export function lockfile(): string {
  return readFileSync(join(repoRoot, 'pnpm-lock.yaml'), 'utf-8')
}
