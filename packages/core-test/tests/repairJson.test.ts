import { describe, expect, it } from 'vitest'
import { repairJson, RepairJsonState, safeJsonParse } from '@opentiny/genui-sdk-core'

describe('repairJson / safeJsonParse', () => {
  it('正确导出且可修复截断 JSON', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 })

    const { state, value } = repairJson('{"componentName":"Page"')
    expect(state).toBe(RepairJsonState.REPAIRED)
    expect(value).toEqual({ componentName: 'Page' })
  })
})
