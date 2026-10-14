import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    server: {
      deps: {
        // 物料包以浏览器 ESM 产物发布：内部使用无扩展名的子路径导入
        // （@opentiny/vue-theme/theme-tool）并且会 import CSS。
        // 全部交给 Vite 处理，否则在 node 环境下会报 ERR_MODULE_NOT_FOUND / Unknown file extension ".css"。
        inline: [/@opentiny\//],
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@opentiny\/vue-theme\/theme-tool$/,
        replacement: '@opentiny/vue-theme/theme-tool.js',
      },
    ],
  },
})
