import { describe, expect, it } from 'vitest'
import {
  PatternExtractor,
  SchemaJsonPattern,
  getPartialStartRegString,
} from '@opentiny/genui-sdk-core'

function collectExtractor(keepFlag?: false | 'handling' | 'normal') {
  const normal: string[] = []
  const handled: string[] = []
  const extractor = new PatternExtractor({
    onNormalWrite: (chunk) => normal.push(chunk),
    onHandledWrite: (chunk) => handled.push(chunk),
    keepFlag,
  })
  return {
    extractor,
    normalText: () => normal.join(''),
    handledText: () => handled.join(''),
  }
}

describe('PatternExtractor', () => {
  it('文档示例：将流式文本拆分为 markdown 与 schemaJson', () => {
    const { extractor, normalText, handledText } = collectExtractor()

    extractor.handleContent('hello ```schemaJson\n{"componentName":"Page"')
    extractor.handleContent('\n}\n```')

    expect(normalText()).toBe('hello ')
    expect(handledText()).toBe('\n{"componentName":"Page"\n}')
  })

  it('按字符增量输入时，partial 标记不会提前泄漏', () => {
    const { extractor, normalText, handledText } = collectExtractor()
    const text = 'hi ```schemaJson\n{"a":1}\n```'

    for (const ch of text) {
      extractor.handleContent(ch)
    }

    expect(normalText()).toBe('hi ')
    expect(handledText()).toBe('\n{"a":1}')
  })

  it('keepFlag=handling 时保留起止标记到 handled 流', () => {
    const { extractor, handledText } = collectExtractor('handling')
    extractor.handleContent('```schemaJson\n{"a":1}\n```')

    expect(handledText()).toContain('```schemaJson')
    expect(handledText()).toContain('```')
    expect(handledText()).toContain('{"a":1}')
  })

  it('reset 后可重新提取', () => {
    const { extractor, handledText } = collectExtractor()

    extractor.handleContent('```schemaJson\n{"a":1}\n```')
    extractor.reset()
    extractor.handleContent('```schemaJson\n{"b":2}\n```')

    expect(handledText()).toContain('"a":1')
    expect(handledText()).toContain('"b":2')
  })

  it('setState 可强制切换到 handling', () => {
    const { extractor, normalText, handledText } = collectExtractor()
    extractor.setState('handling')
    extractor.handleContent('{"partial":true}\n```')

    expect(normalText()).toBe('')
    expect(handledText()).toContain('{"partial":true}')
  })
})

describe('SchemaJsonPattern', () => {
  it('默认匹配 ```schemaJson 起止标记', () => {
    const pattern = new SchemaJsonPattern()
    expect(pattern.regExpMap.start.full.test('```schemaJson')).toBe(true)
    expect(pattern.regExpMap.end.full.test('\n```')).toBe(true)
  })

  it('getPartialStartRegString 生成可截断的部分匹配模式', () => {
    const partial = getPartialStartRegString('schemaJson')
    expect(new RegExp(partial).test('sch')).toBe(true)
    expect(new RegExp(partial).test('schemaJson')).toBe(true)
  })
})
