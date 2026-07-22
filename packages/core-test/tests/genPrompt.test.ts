import { describe, expect, it } from 'vitest'
import type { IMaterialsMeta } from '@opentiny/genui-sdk-core'
import {
  genPrompt,
  getFrameworkConfig,
  vueFrameworkConfig,
  reactFrameworkConfig,
  angularFrameworkConfig,
} from '@opentiny/genui-sdk-core'
import { materialsMeta } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta'

const materials: IMaterialsMeta = {
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

const slimOptions = {
  includeJsonSchema: false,
  includeSnippets: false,
  includeExamples: false,
  includeActions: false,
  includeAboutThis: false,
}

describe('getFrameworkConfig()', () => {
  it('大小写不敏感，映射到内置配置', () => {
    expect(getFrameworkConfig('Vue')).toEqual(vueFrameworkConfig)
    expect(getFrameworkConfig('vue')).toEqual(vueFrameworkConfig)
    expect(getFrameworkConfig('React')).toEqual(reactFrameworkConfig)
    expect(getFrameworkConfig('Angular')).toEqual(angularFrameworkConfig)
  })

  it('未知框架回退到 Vue 配置', () => {
    expect(getFrameworkConfig('Svelte')).toEqual(vueFrameworkConfig)
  })
})

describe('genPrompt() — 各技术栈', () => {
  it('Vue：注入表单 model / modelValue 交互规则', () => {
    const prompt = genPrompt('Vue', materials, undefined, slimOptions)

    for (const rule of vueFrameworkConfig.rules ?? []) {
      expect(prompt).toContain(rule)
    }
    for (const rule of materials.rules ?? []) {
      expect(prompt).toContain(rule)
    }
  })

  it('React：不注入 Vue 表单规则', () => {
    const prompt = genPrompt('React', materials, undefined, slimOptions)

    for (const rule of vueFrameworkConfig.rules ?? []) {
      expect(prompt).not.toContain(rule)
    }
    for (const rule of materials.rules ?? []) {
      expect(prompt).toContain(rule)
    }
  })

  it('Angular：不注入 Vue 表单规则，与 React 规则段落一致', () => {
    const reactPrompt = genPrompt('React', materials, undefined, slimOptions)
    const angularPrompt = genPrompt('Angular', materials, undefined, slimOptions)

    for (const rule of vueFrameworkConfig.rules ?? []) {
      expect(angularPrompt).not.toContain(rule)
    }
    expect(angularPrompt).toBe(reactPrompt)
  })

  it('未知框架名回退 Vue 规则', () => {
    const svelte = genPrompt('Svelte', materials, undefined, slimOptions)
    const vue = genPrompt('Vue', materials, undefined, slimOptions)
    expect(svelte).toBe(vue)
  })

  it('可直接传入自定义 frameworkConfig', () => {
    const customRules = ['自定义框架规则：禁止使用表格']
    const prompt = genPrompt(
      { rules: customRules },
      materials,
      undefined,
      { ...slimOptions, includeBaseRules: false },
    )

    for (const rule of customRules) {
      expect(prompt).toContain(rule)
    }
    for (const rule of vueFrameworkConfig.rules ?? []) {
      expect(prompt).not.toContain(rule)
    }
  })

  it('真实物料包 + Vue：prompt 含白名单组件', () => {
    const prompt = genPrompt('Vue', materialsMeta, undefined, {
      includeJsonSchema: false,
      includeSnippets: false,
      includeExamples: false,
      includeActions: false,
    })

    for (const rule of vueFrameworkConfig.rules ?? []) {
      expect(prompt).toContain(rule)
    }
    expect(prompt).toContain('可用组件')
    for (const name of materialsMeta.whiteList.slice(0, 3)) {
      expect(prompt).toContain(name)
    }
  })
})
describe('genPrompt() — 模式与段落开关', () => {
  it('默认 Target 模式：任务说明 + 允许 Mock', () => {
    const prompt = genPrompt('React', materials, undefined, slimOptions)

    expect(prompt).toContain('# 任务说明')
    expect(prompt).toContain('可以使用Mock数据')
    expect(prompt).not.toContain('# 技能说明')
    expect(prompt).not.toContain('禁止使用任何Mock数据')
  })

  it('Skill 模式：技能说明 + 禁止 Mock', () => {
    const prompt = genPrompt('React', materials, undefined, {
      ...slimOptions,
      isSkill: true,
    })

    expect(prompt).toContain('# 技能说明')
    expect(prompt).toContain('禁止使用任何Mock数据')
    expect(prompt).not.toContain('# 任务说明')
  })

  it('include* 开关可裁剪各段落', () => {
    const full = genPrompt('Vue', materialsMeta)
    const slim = genPrompt('Vue', materialsMeta, undefined, {
      includeJsonSchema: false,
      includeSnippets: false,
      includeExamples: false,
      includeActions: false,
      includeAboutThis: false,
    })

    expect(slim.length).toBeLessThan(full.length)
    expect(full).toContain('JSON Schema')
    expect(slim).not.toContain('JSON Schema')
    expect(full).toContain('this 上下文声明')
    expect(slim).not.toContain('this 上下文声明')
  })

  it('includeBaseRules=false 时只保留模式规则与额外规则', () => {
    const extraRules = ['额外规则：输出必须简洁']
    const prompt = genPrompt('React', materials, undefined, {
      ...slimOptions,
      includeBaseRules: false,
      rules: extraRules,
    })

    expect(prompt).toContain('可以使用Mock数据')
    for (const rule of extraRules) {
      expect(prompt).toContain(rule)
    }
    for (const rule of materials.rules ?? []) {
      expect(prompt).toContain(rule)
    }
    expect(prompt).not.toContain('schemaJson 必须是一个根节点')
    expect(prompt).not.toContain('最高优先级规则')
  })})

describe('genPrompt() — 自定义配置', () => {
  it('文档示例：customActions 写入 Action 定义段', () => {
    const prompt = genPrompt(
      'Vue',
      materialsMeta,
      {
        customActions: [
          {
            name: 'openPage',
            description: 'Open a page by path',
            parameters: {
              type: 'object',
              properties: { path: { type: 'string' } },
              required: ['path'],
            },
          },
        ],
      },
      { includeJsonSchema: false },
    )

    expect(prompt).toContain('## Action 定义')
    expect(prompt).toContain('openPage')
    expect(prompt).toContain('Open a page by path')
    expect(prompt).toContain('this.callAction')
  })

  it('continueChat / saveState 会追加对应生成规则', () => {
    const prompt = genPrompt(
      'React',
      materials,
      {
        customActions: [
          { name: 'continueChat', description: '继续对话' },
          { name: 'saveState', description: '保存状态' },
        ],
      },
      {
        includeJsonSchema: false,
        includeSnippets: false,
        includeExamples: false,
        includeAboutThis: false,
      },
    )

    expect(prompt).toContain('continueChat')
    expect(prompt).toContain('saveState')
    expect(prompt).toContain('调用 continueChat')
    expect(prompt).toContain('调用 saveState')
  })

  it('customComponents 扩展白名单并出现在可用组件中', () => {
    const prompt = genPrompt(
      'React',
      materials,
      {
        customComponents: [
          {
            component: 'MyWidget',
            description: '自定义小组件',
            schema: { properties: [{ property: 'title', type: 'string', description: '标题' }] },
          },
        ],
      },
      slimOptions,
    )

    expect(prompt).toContain('MyWidget')
    expect(prompt).toContain('必须使用以下支持的 componentName')
    expect(prompt).toMatch(/Page.*DemoButton.*MyWidget|Page.*MyWidget.*DemoButton/)
  })

  it('wrapperComponent 写入根节点包裹规则', () => {
    const prompt = genPrompt('React', materials, undefined, slimOptions)
    expect(prompt).toContain(materials.wrapperComponent!)
    expect(prompt).toContain('根节点请尽可能使用')
  })})
