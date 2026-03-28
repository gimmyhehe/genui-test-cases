import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-jsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const plugins = [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'tiny-schema-renderer-element-ng',
        },
      },
    })
  ];

  if (command === 'serve') {
    plugins.push(
      nodePolyfills(), // tiny-schema-renderer 依赖 babel 间接依赖 process.env等内容
    );
  }

  return {
    server: {
      port: 5177,
    },
    envDir: './env',
    plugins,
  };
});
