const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    // @opentiny/genui-sdk-vue 的代码生成器依赖 prettier 3，其 ESM 产物使用了
    // class private methods。webpack 5 可以原生解析这类语法，但交给 babel 转译会
    // 因为缺少 @babel/plugin-transform-private-methods 而编译失败，因此这里跳过。
    config.module.rule('js').exclude.add(/[\\/]node_modules[\\/]prettier[\\/]/)
  }
})
