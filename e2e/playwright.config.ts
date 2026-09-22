import { defineConfig } from '@playwright/test';

/**
 * E2E config for testing the packaged-but-unpacked Electron app (main + preload + renderer)
 * via Playwright's Electron support (`_electron.launch`). Run `npm run test:e2e` from the repo
 * root — it builds `dist/main`/`dist/renderer` first via the `pretest:e2e` npm hook.
 *
 * Only one Electron app can be driven per worker, so this intentionally runs single-threaded.
 * See e2e/tests/app.spec.ts and packages/main/AGENTS.md for details.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    trace: 'retain-on-failure'
  }
});
