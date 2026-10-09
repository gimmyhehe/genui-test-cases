/**
 * 物料库预设：把「框架 + 物料包 + 输出目录 + frontmatter」集中描述，
 * 供编程式生成与 CLI 示例共用。
 */
export interface MaterialsPreset {
  /** 输出目录名与 CLI 配置名 */
  id: string
  /** 展示名 */
  title: string
  /** genPrompt 框架 */
  framework: 'vue' | 'angular' | 'react'
  /** 物料元数据模块 */
  materialsMetaModule: string
  /** 物料元数据导出名 */
  materialsMetaExport: string
  /** 根节点包裹组件，用于校验生成结果 */
  wrapperComponent: string
  /** SKILL.md frontmatter 的 name */
  skillName: string
  /**
   * 自定义 frontmatter。OpenTiny Vue 沿用包内置的 genui-schema-json frontmatter，
   * 其他组件库需要覆盖，否则会保留内置描述（含 TinyForm / TinyCard / TinyGrid 字样）。
   */
  defaultFrontmatter?: string
}

function frontmatter(name: string, description: string) {
  return ['---', `name: ${name}`, 'description: >-', `  ${description}`, '---', ''].join(
    '\n',
  )
}

export const MATERIALS_PRESETS: MaterialsPreset[] = [
  {
    id: 'opentiny-vue',
    title: 'OpenTiny Vue',
    framework: 'vue',
    materialsMetaModule: '@opentiny/genui-sdk-materials-vue-opentiny-vue/meta',
    materialsMetaExport: 'materialsMeta',
    wrapperComponent: 'TinyCard',
    skillName: 'genui-schema-json',
    // 不传 defaultFrontmatter：使用包内置的 genui-schema-json frontmatter
  },
  {
    id: 'element-plus',
    title: 'Element Plus (Vue)',
    framework: 'vue',
    materialsMetaModule: '@opentiny/genui-sdk-materials-vue-element-plus/meta',
    materialsMetaExport: 'materialsMeta',
    wrapperComponent: 'ElCard',
    skillName: 'genui-schema-json-element-plus',
    defaultFrontmatter: frontmatter(
      'genui-schema-json-element-plus',
      'Generates and edits interactive GenUI schemaJson cards built from Element Plus components (ElForm, ElCard, ElTable, charts). Use when the user asks to create, fix, or modify genui cards, schemaJson, forms, tables, or Element Plus UI layouts.',
    ),
  },
  {
    id: 'opentiny-ng',
    title: 'OpenTiny NG (Angular)',
    framework: 'angular',
    materialsMetaModule: '@opentiny/genui-sdk-materials-angular-opentiny-ng/meta',
    materialsMetaExport: 'materialsMeta',
    wrapperComponent: 'TiCard',
    skillName: 'genui-schema-json-opentiny-ng',
    defaultFrontmatter: frontmatter(
      'genui-schema-json-opentiny-ng',
      'Generates and edits interactive GenUI schemaJson cards built from OpenTiny NG components (TiForm, TiCard, TiGrid, charts) in Angular. Use when the user asks to create, fix, or modify genui cards, schemaJson, forms, tables, or OpenTiny NG UI layouts.',
    ),
  },
  {
    id: 'antd',
    title: 'Ant Design (React)',
    framework: 'react',
    materialsMetaModule: '@opentiny/genui-sdk-materials-react-antd/meta',
    materialsMetaExport: 'materialsMeta',
    wrapperComponent: 'AntCard',
    skillName: 'genui-schema-json-antd',
    defaultFrontmatter: frontmatter(
      'genui-schema-json-antd',
      'Generates and edits interactive GenUI schemaJson cards built from Ant Design components (Form, Card, Table, charts) in React. Use when the user asks to create, fix, or modify genui cards, schemaJson, forms, tables, or Ant Design UI layouts.',
    ),
  },
]

export function getMaterialsPreset(id: string): MaterialsPreset {
  const preset = MATERIALS_PRESETS.find((item) => item.id === id)
  if (!preset) {
    throw new Error(
      `未知物料库预设: ${id}，可用: ${MATERIALS_PRESETS.map((p) => p.id).join(', ')}`,
    )
  }
  return preset
}

/** 动态导入物料包的 meta 入口，返回 materialsMeta。 */
export async function loadMaterialsMeta(preset: MaterialsPreset) {
  const mod = (await import(preset.materialsMetaModule)) as Record<string, unknown>
  const meta = mod[preset.materialsMetaExport]
  if (!meta) {
    throw new Error(
      `${preset.materialsMetaModule} 未导出 ${preset.materialsMetaExport}，实际导出: ${Object.keys(mod).join(', ')}`,
    )
  }
  return meta as Parameters<
    typeof import('@opentiny/genui-sdk-skill-generator').generateSkillFiles
  >[1]
}
