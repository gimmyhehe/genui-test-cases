import { describe, expect, it } from 'vitest'
import { mergeMaterials } from '@opentiny/genui-sdk-core'

const makeThemeFactory = (id: string) => () => ({
  themes: [{ id }],
  // IThemeApplyResult 要求返回 descriptor
  apply: () => ({ descriptor: { id } }),
})

describe('mergeMaterials 物料合并', () => {
  it('components 浅合并，后者覆盖同名组件', () => {
    const merged = mergeMaterials(
      { components: { A: 'a1', B: 'b1' } },
      { components: { B: 'b2', C: 'c2' } },
    )
    expect(merged.components).toEqual({ A: 'a1', B: 'b2', C: 'c2' })
  })

  it('defaultPropsMap 按组件名浅合并', () => {
    const merged = mergeMaterials(
      { defaultPropsMap: { A: { p: 1, keep: true }, C: { q: 1 } } },
      { defaultPropsMap: { A: { p: 2 } } },
    )
    expect(merged.defaultPropsMap).toEqual({ A: { p: 2 }, C: { q: 1 } })
  })

  it('requiredCompleteFieldSelectors 拼接并去重', () => {
    const merged = mergeMaterials(
      { requiredCompleteFieldSelectors: ['x', 'y'] },
      { requiredCompleteFieldSelectors: ['y', 'z'] },
    )
    expect(merged.requiredCompleteFieldSelectors).toEqual(['x', 'y', 'z'])
  })

  it('themeFactory 归一化为数组', () => {
    const f1 = makeThemeFactory('light')
    const merged = mergeMaterials({ themeFactory: f1 })
    expect(Array.isArray(merged.themeFactory)).toBe(true)
    expect(merged.themeFactory).toHaveLength(1)
  })

  it('themeFactory 去重（同一引用只保留一次）', () => {
    const f1 = makeThemeFactory('light')
    const f2 = makeThemeFactory('dark')
    const merged = mergeMaterials({ themeFactory: f1 }, { themeFactory: f2 }, { themeFactory: f1 })
    expect(merged.themeFactory).toHaveLength(2)
  })

  it('不修改入参（纯函数）', () => {
    const a = { components: { A: 'a1' }, requiredCompleteFieldSelectors: ['x'] }
    const snapshot = JSON.stringify(a)
    mergeMaterials(a, { components: { A: 'a2' }, requiredCompleteFieldSelectors: ['y'] })
    expect(JSON.stringify(a)).toBe(snapshot)
  })

  it('忽略 undefined 源', () => {
    const merged = mergeMaterials(undefined, { components: { X: 1 } }, undefined)
    expect(merged.components).toEqual({ X: 1 })
  })

  it('无入参时返回带空默认值的结构', () => {
    const merged = mergeMaterials()
    expect(merged.components).toEqual({})
    expect(merged.defaultPropsMap).toEqual({})
    expect(merged.requiredCompleteFieldSelectors).toEqual([])
  })

  it('保留 components 之外的自定义字段', () => {
    const merged = mergeMaterials({ customFlag: true } as any, { components: { A: 1 } })
    expect((merged as any).customFlag).toBe(true)
  })

  it('三个及以上物料源按顺序覆盖', () => {
    const merged = mergeMaterials(
      { components: { A: 'base' } },
      { components: { A: 'mid' } },
      { components: { A: 'last' } },
    )
    expect(merged.components!.A).toBe('last')
  })
})
