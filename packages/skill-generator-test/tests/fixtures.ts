import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'

/** 创建隔离的临时目录，避免测试之间互相污染。 */
export function makeTempDir(prefix = 'skill-gen-') {
  return mkdtempSync(join(tmpdir(), prefix))
}

export function cleanupTempDir(dir: string) {
  rmSync(dir, { recursive: true, force: true })
}

export function readText(path: string) {
  return readFileSync(path, 'utf-8')
}

export function exists(dir: string, name: string) {
  return readdirSync(dir).includes(name)
}

/** 去掉 SKILL.md 顶部的 YAML frontmatter，返回正文。 */
export function stripFrontmatter(markdown: string) {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(markdown)
  return match ? markdown.slice(match[0].length) : markdown
}

/** 递归列出目录下所有文件（相对路径，已排序），目录本身不返回。 */
export function listFiles(dir: string): string[] {
  const out: string[] = []
  const walk = (current: string) => {
    for (const entry of readdirSync(current).sort()) {
      const full = join(current, entry)
      if (statSync(full).isDirectory()) walk(full)
      else out.push(relative(dir, full))
    }
  }
  walk(dir)
  return out
}
