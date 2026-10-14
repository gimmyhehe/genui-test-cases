import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

/**
 * playground 的 Vite dev server 端口，默认与 sites/web/vite.config.ts 保持一致。
 *
 * 用 E2E_PORT 可以换一个端口强制起一个全新的 dev server：
 * 默认端口上可能已经跑着开发者自己的 `pnpm dev`，那种情况下 Vite 的
 * 依赖预打包缓存（node_modules/.vite）可能是旧的，无法证明测的是当前版本。
 *   E2E_PORT=5199 pnpm test:e2e
 */
const PORT = Number(process.env.E2E_PORT ?? 5177)
const BASE_URL = `http://localhost:${PORT}`

/** 仓库根目录：packages/e2e-test -> ../.. */
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 复用仓库里已有的 playground，起点到终点都跑真实浏览器。
  // LLM 用 page.addInitScript 注入 fetch stub（见 tests/helpers/llm-stub.ts），
  // 因此这里不需要第二个服务，也不会和 `pnpm dev` 抢 3100 端口。
  webServer: {
    // 直接用 vite 可执行文件而不是 `pnpm ... dev -- --port`，
    // 因为 pnpm run 会把额外的 `--` 原样传给脚本，vite 会忽略后面的参数。
    command: `pnpm -F genui-sdk-playground-web exec vite --host --port ${PORT} --strictPort`,
    cwd: repoRoot,
    url: BASE_URL,
    // 指定了自定义端口时一定是新起的服务，不复用任何已有进程。
    reuseExistingServer: !process.env.CI && !process.env.E2E_PORT,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
