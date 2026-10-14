import { describe, expect, it } from 'vitest'
import {
  StreamPatternExtractor,
  buildMaterialDefaultValueMap,
  genPrompt,
  genRootSchema,
  getPartialStartRegString,
  materialSchema,
  nodeSchema,
  repairJson,
  safeJsonParse,
  vueFrameworkConfig,
  type IMaterialsMeta,
} from '@opentiny/genui-sdk-core'

/**
 * 历史能力回归。
 * 这些能力在早期版本就已经存在，每次发布都要确认它们没被新特性带坏。
 */

const materialsMeta: IMaterialsMeta = {
  materials: [],
  examples: [
    {
      name: 'hello',
      schema: {
        componentName: 'Page',
        children: [{ componentName: 'DemoButton', props: { type: 'primary' } }],
      },
    },
  ],
  whiteList: ['Page', 'DemoButton'],
  wrapperComponent: 'DemoCard',
  rules: ['物料规则：优先使用 DemoButton'],
}

describe('提示词生成 genPrompt', () => {
  it('按物料元信息生成非空提示词', () => {
    const prompt = genPrompt(vueFrameworkConfig, materialsMeta)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('提示词里带上白名单组件与物料规则', () => {
    const prompt = genPrompt(vueFrameworkConfig, materialsMeta)
    expect(prompt).toContain('DemoButton')
    expect(prompt).toContain('物料规则：优先使用 DemoButton')
  })

  it('精简选项下仍然能生成提示词', () => {
    const prompt = genPrompt(vueFrameworkConfig, materialsMeta, undefined, {
      includeJsonSchema: false,
      includeSnippets: false,
      includeExamples: false,
      includeActions: false,
      includeAboutThis: false,
    })
    expect(prompt.length).toBeGreaterThan(0)
  })
})

describe('物料默认值 buildMaterialDefaultValueMap', () => {
  it('从物料元信息里提取嵌套属性默认值', () => {
    const map = buildMaterialDefaultValueMap({
      materials: [
        {
          data: {
            materials: {
              components: [
                {
                  component: 'DemoButton',
                  schema: {
                    properties: [
                      {
                        property: 'type',
                        defaultValue: 'primary',
                        content: [{ property: 'size', defaultValue: 'medium' }],
                      },
                    ],
                  },
                },
              ],
            },
          },
        } as never,
      ],
    })

    expect(map.DemoButton).toEqual({ type: 'primary', 'type.size': 'medium' })
  })

  it('不传物料元信息时返回空映射', () => {
    expect(buildMaterialDefaultValueMap()).toEqual({})
  })
})

describe('Schema 校验器', () => {
  it('genRootSchema 接受合法根节点', () => {
    const schema = genRootSchema(['Page', 'DemoButton'])
    const result = schema.safeParse({ componentName: 'Page' })
    expect(result.success).toBe(true)
  })

  it('nodeSchema / materialSchema 仍然可用', () => {
    expect(nodeSchema.safeParse({ componentName: 'Page' }).success).toBe(true)
    expect(typeof materialSchema.safeParse).toBe('function')
  })
})

describe('流式抽取 StreamPatternExtractor', () => {
  function textStream(chunks: readonly string[]): ReadableStream<string> {
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    })
  }

  async function readAll(stream: ReadableStream<string>): Promise<string> {
    const reader = stream.getReader()
    let out = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      out += value ?? ''
    }
    return out
  }

  it('separate 把输入流拆成 normal 与 handled 两条流', async () => {
    // StreamPatternExtractor.closeStream 会先 releaseLock 再 close，触发一个
    // 未处理的 rejection（core-test 里也记录了这个已知问题），这里先兜住它。
    const onError = () => {}
    process.on('unhandledRejection', onError)
    try {
      const [normal, handled] = StreamPatternExtractor.separate(
        textStream(['hello ```schemaJson\n{"componentName":"Page"', '\n}\n```']),
      )
      const [normalText, handledText] = await Promise.all([readAll(normal), readAll(handled)])

      expect(normalText).toContain('hello')
      expect(handledText).toContain('"componentName":"Page"')
      await new Promise((resolve) => setTimeout(resolve, 30))
    } finally {
      process.off('unhandledRejection', onError)
    }
  })
})

describe('JSON 修复与容错', () => {
  it('safeJsonParse 对非法 JSON 返回 undefined 而不是抛错', () => {
    expect(safeJsonParse('{invalid')).toBeUndefined()
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 })
  })

  it('repairJson 能补齐截断的 JSON', () => {
    const { value } = repairJson('{"componentName":"Page","children":[{"componentName":"Text"')
    expect(value).toBeDefined()
  })

  it('getPartialStartRegString 返回可用于匹配部分开头的正则字符串', () => {
    const reg = getPartialStartRegString('schemaJson')
    expect(typeof reg).toBe('string')
    expect(reg.length).toBeGreaterThan(0)
  })
})
