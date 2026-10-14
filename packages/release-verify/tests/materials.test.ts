// @vitest-environment jsdom
// 物料包底层依赖 TinyVue，TinyVue 在模块初始化时会访问 window / document，
// 因此这个用例需要 DOM 环境（其余用例仍跑在更快的 node 环境）。
import { describe, expect, it } from 'vitest'
import {
  materials,
  materialsMeta,
  miniMaterials,
  miniMaterialsMeta,
  plusMaterials,
  plusMaterialsMeta,
} from '@opentiny/genui-sdk-materials-vue-opentiny-vue'
import { materials as materialsFromSubpath } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials'
import { materialsMeta as metaFromSubpath } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'

/** 渲染器允许的原生 HTML 标签，以及内置的 Text 组件。 */
const BUILTIN_ALLOWED = new Set([
  'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ol', 'ul', 'li',
  'div', 'img', 'input', 'video', 'label', 'Text',
])

const componentNames = (m: any): string[] => Object.keys(m?.components ?? {})

const TIERS = [
  { id: 'mini', materials: miniMaterials, meta: miniMaterialsMeta },
  { id: 'standard', materials, meta: materialsMeta },
  { id: 'plus', materials: plusMaterials, meta: plusMaterialsMeta },
] as const

describe('OpenTiny Vue 物料：导出与档位', () => {
  it('导出三档物料与各自 meta', () => {
    for (const tier of TIERS) {
      expect(tier.materials, `${tier.id} materials 缺失`).toBeDefined()
      expect(tier.meta, `${tier.id} meta 缺失`).toBeDefined()
    }
  })

  it('./materials 与 ./meta 子路径与主入口指向同一对象', () => {
    expect(materialsFromSubpath).toBe(materials)
    expect(metaFromSubpath).toBe(materialsMeta)
  })

  it('每档都注册了组件、声明了白名单和示例', () => {
    for (const tier of TIERS) {
      expect(componentNames(tier.materials).length, `${tier.id} 没有注册组件`).toBeGreaterThan(0)
      expect(tier.meta.whiteList.length, `${tier.id} 白名单为空`).toBeGreaterThan(0)
      expect(tier.meta.examples.length, `${tier.id} 没有示例`).toBeGreaterThan(0)
    }
  })

  it('每档 meta 都声明 framework 为 Vue', () => {
    for (const tier of TIERS) {
      expect(tier.meta.materials?.[0]?.data?.framework, `${tier.id} framework 不正确`).toBe('Vue')
    }
  })
})

describe('档位差异体现在 whiteList（Mini ⊂ Standard ⊂ Plus）', () => {
  const mini = miniMaterialsMeta.whiteList
  const standard = materialsMeta.whiteList
  const plus = plusMaterialsMeta.whiteList

  it('白名单随档位严格递增', () => {
    expect(mini.length).toBeLessThan(standard.length)
    expect(standard.length).toBeLessThan(plus.length)
  })

  it('Mini 的白名单是 Standard 的子集', () => {
    expect(mini.filter((item) => !standard.includes(item))).toEqual([])
  })

  it('Standard 的白名单是 Plus 的子集', () => {
    expect(standard.filter((item) => !plus.includes(item))).toEqual([])
  })

  it('白名单无重复项', () => {
    for (const [id, list] of Object.entries({ mini, standard, plus })) {
      expect(new Set(list).size, `${id} 白名单存在重复`).toBe(list.length)
    }
  })

  it('Plus 档新增的组件都已注册到物料里', () => {
    const added = plus.filter((item) => !standard.includes(item))
    for (const expected of [
      'TinySteps',
      'TinyCollapse',
      'TinyCollapseItem',
      'TinyTree',
      'TinyTransfer',
      'TinyTooltip',
      'TinyPopover',
    ]) {
      expect(added, `Plus 档未比 Standard 多出 ${expected}`).toContain(expected)
    }
  })

  it('Mini 档不暴露图表等重型组件', () => {
    const miniSet = new Set(mini)
    for (const heavy of ['TinyHuichartsLine', 'TinyHuichartsPie', 'TinySteps', 'TinyTree', 'TinyTransfer']) {
      expect(miniSet.has(heavy), `Mini 档不应包含 ${heavy}`).toBe(false)
    }
  })
})

describe('白名单完整性', () => {
  it('白名单里的每个非内置组件都能在 components 中解析到', () => {
    for (const tier of TIERS) {
      const registered = new Set(componentNames(tier.materials))
      const dangling = tier.meta.whiteList.filter(
        (item) => !BUILTIN_ALLOWED.has(item) && !registered.has(item),
      )
      expect(dangling, `${tier.id} 白名单引用了未注册的组件`).toEqual([])
    }
  })

  it('三档都允许原生 HTML 标签，保证 Schema 可渲染基础元素', () => {
    for (const tier of TIERS) {
      const allowed = new Set(tier.meta.whiteList)
      for (const tag of ['div', 'p', 'ul', 'li']) {
        expect(allowed.has(tag), `${tier.id} 缺少内置标签 ${tag}`).toBe(true)
      }
    }
  })
})

describe('themeFactory 主题系统', () => {
  it('三档物料都接入了 themeFactory', () => {
    for (const tier of TIERS) {
      expect(typeof (tier.materials as any).themeFactory, `${tier.id} 未接入 themeFactory`).toBe('function')
    }
  })

  it('themeFactory() 返回带 apply 的主题实例', () => {
    const instance = (materials as any).themeFactory()
    expect(instance).toBeTruthy()
    expect(typeof instance.apply).toBe('function')
  })

  it('内置 light / dark / lite 三个主题', () => {
    const ids = ((materials as any).themeFactory().themes ?? []).map((theme: any) => theme.id)
    expect(ids).toEqual(expect.arrayContaining(['light', 'dark', 'lite']))
  })

  it('apply 对已知主题返回结果而不是抛错', () => {
    const instance = (materials as any).themeFactory()
    expect(() => instance.apply('dark', {})).not.toThrow()
  })
})
