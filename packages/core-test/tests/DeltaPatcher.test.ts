import { describe, expect, it } from 'vitest'
import { DeltaPatcher } from '@opentiny/genui-sdk-core'

describe('DeltaPatcher', () => {
  it('文档示例：流式未完成时缓冲不完整字段，完成后全量写入', () => {
    const patcher = new DeltaPatcher({
      requiredCompleteFieldSelectors: [
        '[componentName=TinyForm] > props > labelPosition',
      ],
    })

    const afterPartial = patcher.patchWithDelta(
      {},
      {
        componentName: 'Page',
        children: [{ componentName: 'TinyForm', props: { labelPosition: 'lef' } }],
      },
      false,
    ) as any

    expect(afterPartial.componentName).toBe('Page')
    expect(afterPartial.children[0].componentName).toBe('TinyForm')
    expect(afterPartial.children[0].props.labelPosition).toBeUndefined()

    const afterFinal = patcher.patchWithDelta(
      afterPartial,
      {
        componentName: 'Page',
        children: [{
          componentName: 'TinyForm',
          props: { labelPosition: 'left', labelWidth: '100px' },
        }],
      },
      true,
    ) as {
      children: Array<{ props: Record<string, string> }>
    }

    expect(afterFinal.children[0].props.labelPosition).toBe('left')
    expect(afterFinal.children[0].props.labelWidth).toBe('100px')
  })

  it('isCompleted=true 时跳过缓冲，直接写入不完整字段', () => {
    const patcher = new DeltaPatcher({
      requiredCompleteFieldSelectors: [
        '[componentName=TinyForm] > props > labelPosition',
      ],
    })

    const result = patcher.patchWithDelta(
      {},
      {
        componentName: 'Page',
        children: [{ componentName: 'TinyForm', props: { labelPosition: 'lef' } }],
      },
      true,
    ) as {
      children: Array<{ props: Record<string, string> }>
    }

    expect(result.children[0].props.labelPosition).toBe('lef')
  })

  it('流式中仅缓冲字段变更时继续抑制；同批带上非缓冲字段时一并写入', () => {
    const patcher = new DeltaPatcher({
      requiredCompleteFieldSelectors: [
        '[componentName=TinyForm] > props > labelPosition',
      ],
    })

    let schema = patcher.patchWithDelta(
      {},
      {
        componentName: 'Page',
        children: [{ componentName: 'TinyForm', props: { labelPosition: 'lef' } }],
      },
      false,
    ) as {
      children: Array<{ props: Record<string, string> }>
    }
    expect(schema.children[0].props.labelPosition).toBeUndefined()

    schema = patcher.patchWithDelta(schema, {
      componentName: 'Page',
      children: [{ componentName: 'TinyForm', props: { labelPosition: 'left' } }],
    }, false) as typeof schema
    expect(schema.children[0].props.labelPosition).toBeUndefined()

    schema = patcher.patchWithDelta(schema, {
      componentName: 'Page',
      children: [{
        componentName: 'TinyForm',
        props: { labelPosition: 'left', labelWidth: '100px' },
      }],
    }, false) as typeof schema
    expect(schema.children[0].props).toEqual({
      labelPosition: 'left',
      labelWidth: '100px',
    })
  })
})
