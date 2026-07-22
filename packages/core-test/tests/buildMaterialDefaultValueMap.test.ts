import { describe, expect, it } from 'vitest'
import { buildMaterialDefaultValueMap } from '@opentiny/genui-sdk-core'

describe('buildMaterialDefaultValueMap()', () => {
  it('从最小物料提取嵌套属性默认值', () => {
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

    expect(map.DemoButton).toEqual({
      type: 'primary',
      'type.size': 'medium',
    })
  })

  it('缺省 materialsMeta 时返回空映射', () => {
    expect(buildMaterialDefaultValueMap()).toEqual({})
  })
})
