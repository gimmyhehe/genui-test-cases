import { describe, expect, it } from 'vitest'
import * as core from '@opentiny/genui-sdk-core'

const api = core as unknown as Record<string, unknown>

/** 历史导出：每次发布都必须保持可用。 */
const baselineExports = [
  'repairJson',
  'safeJsonParse',
  'RepairJsonState',
  'PatternExtractor',
  'StreamPatternExtractor',
  'SchemaJsonPattern',
  'DeltaPatcher',
  'genPrompt',
  'matchJsonPath',
  'jsonSelectorMatcher',
  'matchSelector',
  'matchGroup',
  'findGroupSelector',
  'buildMaterialDefaultValueMap',
  'genNodeSchema',
  'genRootSchema',
  'materialSchema',
  'nodeSchema',
  'methodsSchema',
  'lifeCyclesSchema',
  'jsExpressionSchema',
  'jsFunctionSchema',
  'jsSlotSchema',
  'cardSchema',
  'getPartialStartRegString',
]

/** 框架配置能力。 */
const frameworkConfigExports = [
  'vueFrameworkConfig',
  'reactFrameworkConfig',
  'angularFrameworkConfig',
  'getFrameworkConfig',
]

/** 物料合并能力。 */
const materialsMergeExports = ['mergeMaterials']

describe('core 导出面', () => {
  it.each(baselineExports)('历史导出 %s 仍然存在', (name) => {
    expect(api[name], `缺少导出: ${name}`).toBeDefined()
  })

  it.each([...frameworkConfigExports, ...materialsMergeExports])('新增导出 %s 存在', (name) => {
    expect(api[name], `缺少导出: ${name}`).toBeDefined()
  })

  it('PatternExtractor / SchemaJsonPattern 仍然是构造函数', () => {
    expect(core.PatternExtractor).toBeTypeOf('function')
    expect(core.StreamPatternExtractor).toBeTypeOf('function')
    expect(core.RepairJsonState).toBeTypeOf('object')
  })
})

describe('getFrameworkConfig', () => {
  it('返回对应框架的配置对象', () => {
    expect(core.getFrameworkConfig('Vue')).toEqual(core.vueFrameworkConfig)
    expect(core.getFrameworkConfig('React')).toEqual(core.reactFrameworkConfig)
    expect(core.getFrameworkConfig('Angular')).toEqual(core.angularFrameworkConfig)
  })

  it('大小写不敏感', () => {
    expect(core.getFrameworkConfig('vue')).toEqual(core.vueFrameworkConfig)
    expect(core.getFrameworkConfig('react')).toEqual(core.reactFrameworkConfig)
  })

  it('未知框架回退到 Vue 配置而不是抛错', () => {
    expect(() => core.getFrameworkConfig('unknown')).not.toThrow()
    expect(core.getFrameworkConfig('unknown')).toEqual(core.vueFrameworkConfig)
  })

  it('Vue / React 配置都带有非空 rules 数组', () => {
    expect(Array.isArray(core.vueFrameworkConfig.rules)).toBe(true)
    expect(core.vueFrameworkConfig.rules!.length).toBeGreaterThan(0)
    expect(Array.isArray(core.reactFrameworkConfig.rules)).toBe(true)
    expect(core.reactFrameworkConfig.rules!.length).toBeGreaterThan(0)
  })
})

describe('核心行为回归', () => {
  it('safeJsonParse 解析合法 JSON', () => {
    expect(core.safeJsonParse('{"a":1}')).toEqual({ a: 1 })
  })

  it('repairJson 修复截断 JSON', () => {
    const { state, value } = core.repairJson('{"componentName":"Page"')
    expect(state).toBe(core.RepairJsonState.REPAIRED)
    expect(value).toEqual({ componentName: 'Page' })
  })

  it('PatternExtractor 仍能从 schemaJson 代码块中抽取 schema', () => {
    const handled: string[] = []
    const extractor = new core.PatternExtractor({
      onNormalWrite: () => {},
      onHandledWrite: (chunk: string) => handled.push(chunk),
    })
    extractor.handleContent('前导文本 ```schemaJson\n{"componentName":"Page"}\n``` 后续')
    expect(handled.join('')).toContain('"componentName":"Page"')
  })

  it('DeltaPatcher 仍在流式未完成时缓冲 requiredCompleteFieldSelectors 字段', () => {
    const patcher = new core.DeltaPatcher({
      requiredCompleteFieldSelectors: ['[componentName=TinyForm] > props > labelPosition'],
    })

    const partial = patcher.patchWithDelta(
      {},
      {
        componentName: 'Page',
        children: [{ componentName: 'TinyForm', props: { labelPosition: 'lef' } }],
      },
      false,
    ) as any
    expect(partial.children[0].props.labelPosition).toBeUndefined()

    const final = patcher.patchWithDelta(
      partial,
      {
        componentName: 'Page',
        children: [{ componentName: 'TinyForm', props: { labelPosition: 'left' } }],
      },
      true,
    ) as any
    expect(final.children[0].props.labelPosition).toBe('left')
  })

  it('matchJsonPath / jsonSelectorMatcher 仍可用于物料补全选择器', () => {
    const schema = {
      componentName: 'Page',
      children: [{ componentName: 'TinyForm', props: { labelPosition: 'left' } }],
    }
    const selector = '[componentName=TinyForm] > props > labelPosition'
    const path = 'children.0.props.labelPosition'

    expect(core.matchJsonPath(schema, selector, path)).toBe(true)
    expect(core.jsonSelectorMatcher(schema, selector, path)).toEqual({
      isMatch: true,
      matchPath: path,
    })
  })
})
