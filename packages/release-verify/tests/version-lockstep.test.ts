import { describe, expect, it } from 'vitest'
import {
  declaredGenuiDeps,
  EXPECTED_VERSION,
  GENUI_PREFIX,
  installedVersion,
  listWorkspaces,
  lockfile,
} from './helpers/repo'

const workspaces = listWorkspaces()

describe('版本锁步（release lockstep）', () => {
  it('至少覆盖 8 个工作区', () => {
    expect(workspaces.length).toBeGreaterThanOrEqual(8)
  })

  it('每个工作区声明的 genui-sdk 依赖都精确锁定到目标版本', () => {
    const offenders: string[] = []
    for (const ws of workspaces) {
      for (const dep of declaredGenuiDeps(ws)) {
        if (dep.spec !== EXPECTED_VERSION) {
          offenders.push(`${ws.dir} → ${dep.name}@${dep.spec}`)
        }
      }
    }
    expect(offenders, `以下依赖未锁定到 ${EXPECTED_VERSION}`).toEqual([])
  })

  it('没有被声明为范围（^ / ~ / latest）的 genui-sdk 依赖', () => {
    const ranged: string[] = []
    for (const ws of workspaces) {
      for (const dep of declaredGenuiDeps(ws)) {
        if (/[\^~*]|latest|next/.test(dep.spec)) ranged.push(`${ws.dir} → ${dep.name}@${dep.spec}`)
      }
    }
    expect(ranged).toEqual([])
  })

  it('每个工作区实际安装的版本都等于目标版本', () => {
    const offenders: string[] = []
    for (const ws of workspaces) {
      for (const dep of declaredGenuiDeps(ws)) {
        const version = installedVersion(ws, dep.name)
        if (version !== EXPECTED_VERSION) {
          offenders.push(`${ws.dir} → ${dep.name}@${version ?? '(未安装)'}`)
        }
      }
    }
    expect(offenders, `安装版本与声明不一致`).toEqual([])
  })

  it('仓库内不存在任何 alpha / 旧版 genui-sdk 依赖声明', () => {
    const stale: string[] = []
    for (const ws of workspaces) {
      for (const dep of declaredGenuiDeps(ws)) {
        if (/-alpha\.|-beta\.\d+$/.test(dep.spec) && dep.spec !== EXPECTED_VERSION) {
          stale.push(`${ws.dir} → ${dep.name}@${dep.spec}`)
        }
      }
    }
    expect(stale).toEqual([])
  })
})

describe('pnpm 锁文件一致性', () => {
  const lock = lockfile()

  it(`锁文件中出现 ${EXPECTED_VERSION}`, () => {
    expect(lock).toContain(EXPECTED_VERSION)
  })

  it('锁文件中没有残留的 alpha 版本 genui-sdk 条目', () => {
    const matches = lock.match(/@opentiny\/genui-sdk-[a-z-]+@[0-9][^\s'"]*-alpha\.[0-9]+/g) ?? []
    expect([...new Set(matches)]).toEqual([])
  })

  it('锁文件中没有残留的 1.3.x genui-sdk 条目', () => {
    const matches = lock.match(/@opentiny\/genui-sdk-[a-z-]+@1\.3\.[0-9][^\s'"]*/g) ?? []
    expect([...new Set(matches)]).toEqual([])
  })

  it('锁文件里每个 genui-sdk 包只解析出一个版本', () => {
    const found = lock.match(new RegExp(`${GENUI_PREFIX.replace('/', '\\/')}[a-z-]+@[0-9][^\\s'"]*`, 'g')) ?? []
    const versions = new Set(
      found.map((entry) => {
        const at = entry.indexOf('@', 1)
        return `${entry.slice(0, at)}@${entry.slice(at + 1).split('(')[0]}`
      }),
    )
    const byPackage = new Map<string, Set<string>>()
    for (const entry of versions) {
      const at = entry.indexOf('@', 1)
      const name = entry.slice(0, at)
      const version = entry.slice(at + 1)
      if (!byPackage.has(name)) byPackage.set(name, new Set())
      byPackage.get(name)!.add(version)
    }
    const duplicated = [...byPackage.entries()]
      .filter(([, set]) => set.size > 1)
      .map(([name, set]) => `${name}: ${[...set].join(', ')}`)
    expect(duplicated, '同一个包解析出多个版本会造成运行时行为不一致').toEqual([])
  })
})

describe('发行版元信息', () => {
  it('根工作区依赖 integration-skill 的 beta 版本', () => {
    const root = workspaces.find((ws) => ws.dir === '.')!
    const spec = { ...root.pkg.dependencies, ...root.pkg.devDependencies }[
      '@opentiny/genui-sdk-integration-skill'
    ]
    expect(spec).toBe(EXPECTED_VERSION)
  })
})
