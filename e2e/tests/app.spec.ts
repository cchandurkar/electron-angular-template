import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built by `pretest:e2e` (tsc + preload bundle) — no electron-builder packaging needed,
// Playwright drives the plain `electron` devDependency binary directly against this package dir.
const MAIN_PACKAGE_DIR = path.join(__dirname, '../../packages/main');

test.describe('Electron app', () => {
  let app: ElectronApplication;
  let window: Page;

  test.beforeAll(async () => {
    // IMPORTANT: launch with the *directory* (like `electron .`), not the entry .js file path.
    // Electron resolves app.getAppPath() from the package.json of the launched directory; pass a
    // bare .js file instead and getAppPath() silently falls back to Electron's internal
    // default_app.asar, which breaks window.ts's loadFile()/preload path resolution (both are
    // relative to app.getAppPath()) with no error — the window just loads a blank error page.
    app = await electron.launch({ args: [MAIN_PACKAGE_DIR], cwd: MAIN_PACKAGE_DIR });
    window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await app.close();
  });

  test('renderer: main window loads the Angular app', async () => {
    await expect(window).toHaveTitle('Renderer');
    await expect(window.locator('app-root')).toBeAttached();
  });

  test('main process: is reachable and reports valid app metadata', async () => {
    const info = await app.evaluate(({ app: electronApp }) => ({
      name: electronApp.getName(),
      version: electronApp.getVersion()
    }));

    expect(info.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(info.name).toBeTruthy();
  });

  test('preload bridge: window.electronApi is exposed to the renderer', async () => {
    const hasElectronApi = await window.evaluate(
      () => typeof (window as unknown as { electronApi?: unknown }).electronApi !== 'undefined'
    );
    expect(hasElectronApi).toBe(true);
  });
});
