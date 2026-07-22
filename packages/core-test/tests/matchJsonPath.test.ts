import { describe, expect, it } from 'vitest'
import { jsonSelectorMatcher, matchJsonPath } from '@opentiny/genui-sdk-core'

describe('matchJsonPath / jsonSelectorMatcher', () => {
  it('正确导出且可匹配选择器', () => {
    const json = {
      componentName: 'Page',
      children: [{ componentName: 'TinyForm', props: { labelPosition: 'left' } }],
    }
    const selector = '[componentName=TinyForm] > props > labelPosition'
    const path = 'children.0.props.labelPosition'

    expect(matchJsonPath(json, selector, path)).toBe(true)
    expect(jsonSelectorMatcher(json, selector, path)).toEqual({
      isMatch: true,
      matchPath: path,
    })
  })
})
