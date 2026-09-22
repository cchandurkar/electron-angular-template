# MAIN PROCESS

## OVERVIEW

Electron main process — app lifecycle, BrowserWindow, IPC handlers, storage, logging.

## WHERE TO LOOK

| Task                                                  | File                                       |
| ----------------------------------------------------- | ------------------------------------------ |
| App entry, crash handler, hot reload                  | `index.ts`                                 |
| IPC channel registrations (add features here)         | `ipc.ts`                                   |
| Type-safe IPC wrapper (`handle`/`listen`/`broadcast`) | `ipc-bridge.ts` — rarely touched           |
| BrowserWindow creation/config                         | `window.ts`                                |
| Dev-mode flag, platform detection                     | `config.ts`                                |
| File persistence (userData)                           | `storage.ts`                               |
| Logging setup                                         | `logger.ts`                                |
| contextBridge / preload API                           | `preload/index.ts` — see preload/AGENTS.md |
| Preload CommonJS bundling (esbuild)                   | `scripts/build-preload.mjs`                |
| Packaging config (installers, targets, publish)       | `electron-builder.json`                    |

## IPC CHANNELS

| Channel           | Type                        | Direction              | Payload                         |
| ----------------- | --------------------------- | ---------------------- | ------------------------------- |
| `window:close`    | `ipcMain.on`                | renderer→main          | none                            |
| `window:minimize` | `ipcMain.on`                | renderer→main          | none                            |
| `window:maximize` | `ipcMain.on`                | renderer→main          | none                            |
| `app:versions`    | `ipcMain.handle`            | renderer→main          | → `AppVersions`                 |
| `note:save`       | `ipcMain.handle`            | renderer→main          | `(filename, NoteData)`          |
| `note:load`       | `ipcMain.handle`            | renderer→main          | `(filename)` → `NoteData\|null` |
| `theme:changed`   | `broadcast` (main→renderer) | declared, not yet sent | `{ mode: 'light'\|'dark' }`     |
| `updater:status`  | `broadcast` (main→renderer) | declared, not yet sent | `UpdaterStatus`                 |

## CONVENTIONS

- Use `ipcMain.on` for fire-and-forget (window controls); `ipcMain.handle` for request/response — both wrapped by `ipc-bridge.ts`'s `handle`/`listen` for type safety
- `ipc-bridge.ts` also exports `broadcast()` for main→renderer push channels (`theme:changed`, `updater:status`) — declared in `@local/shared` but not wired to a sender yet; use it when you add one (e.g. an update-checker)
- All file I/O goes through `Storage` class — never `fs` directly in `ipc.ts`
- Logger: use `import logger from './logger'`; never call `electronLog` directly
- `serve` flag from `config.ts` controls dev vs prod URL loading

## ANTI-PATTERNS

- Never `nodeIntegration: true` — `contextIsolation` is enforced
- Never add IPC channels without updating `preload/index.ts` bridge
- Never import renderer code from main
- Crash handler in `index.ts` is stubbed — `// TODO: Show "Report Crash" dialog`

## NOTES

- Hot reload in dev: chokidar watches `./dist/main` **and** `../shared/dist`; on change, spawns a new Electron process via `child_process.spawn(process.execPath, process.argv.slice(1), { stdio: 'inherit' })` then exits — keeps terminal stdout/stderr connected across restarts
- 1500ms startup delay before the watcher activates (prevents the relaunched process catching in-flight tsc writes that triggered it); 500ms debounce coalesces burst file-change events from one compilation into a single restart
- Do **not** replace the `spawn` restart with `app.relaunch()` — that breaks the terminal pipe (logs disappear after first hot reload)
- `createWindow` loads `http://localhost:4200` in dev, `./dist/renderer/browser/index.html` in prod
- Preload is bundled separately from the rest of main: `src/preload/**` is excluded from `tsconfig.json` (see its `exclude`) and instead bundled to CommonJS by `scripts/build-preload.mjs` (esbuild) → `./dist/main/preload/index.js`. This is required because Electron's sandboxed preload environment has no ESM loader — it only runs a polyfilled `require()` — and the rest of `packages/main` is `"type": "module"`. A sibling `dist/main/preload/package.json` (`{ "type": "commonjs" }`), written by the same script, lets that one file keep the `.js` extension despite the parent package being ESM.
- `sandbox: true` + `contextIsolation: true` is the correct secure config and the current setting (`window.ts`) — `contextIsolation` is the real security boundary, but sandboxing is Electron's own recommended default since v20
- `src/preload/**` has its own type-check path: `tsconfig.preload.json` (noEmit, referenced by `npm run typecheck` in this package and by `eslint.config.js`'s `projectService.allowDefaultProject`) since it's no longer covered by the main `tsconfig.json`
- Preload build/watch scripts: `npm run preload:build` (one-shot) / `npm run preload:watch` (esbuild watch, run alongside `tsc:watch` in `npm run serve`) — always run `preload:build` after `tsc:build` in one-shot flows (`build`, `start`) since order matters for the shared output directory
- Storage persists to `app.getPath('userData')` — platform-specific location
- `child_process` is a Node built-in — no install needed; the import is already in `index.ts`
- **Forking this template:** packaging/build config has no GitHub identity coupling — `electron-builder.json` has no `publish` block and no `appId`, so nothing needs updating there to build or package out of the box. Without an explicit `appId`, electron-builder falls back to its own default (`com.electron.<package name>`) — set your own reverse-DNS `appId` (and, if you want one, a `mac.category`/`linux.category`) in `electron-builder.json` before shipping a real app; left unset deliberately here since this is a template. Root `package.json`'s `repository`/`homepage`/`bugs.url` still point at the original template author's GitHub as informational metadata only (safe to update to your own, but nothing functional depends on them).
- **`build` vs `package` naming** (this package and root `package.json` both follow it): `build`/`electron:build` only compiles (`tsc:build` + `preload:build` → `dist/`, no installer) — this is what `pretest:e2e` and CI's `Test`-adjacent steps use, since they don't need an installer. `package`/`electron:package` compiles _and_ runs `electron-builder` to produce actual installers (`.dmg`/`.exe`/`.deb`/etc.) — this is what CI's packaging-validation step and `release.yml` use. There is no root `release` script; `release.yml` calls `npm run package` directly.
- CI: `.github/workflows/ci.yml` runs lint/format/typecheck/test/e2e/package on every push/PR to `main` across all 3 OSes — the `package` step validates packaging works but never uploads anything. `.github/workflows/release.yml` runs only when a GitHub Release is published (or via manual `workflow_dispatch`): packages the same way, then uploads the resulting installers (`.dmg`/`.exe`/`.deb`/`.AppImage`/`.flatpak`) as workflow-run artifacts via `actions/upload-artifact` (30-day retention, downloadable from the Actions run page — not attached to the Release itself). Both pin Node 24.
- Linux targets are `deb`, `AppImage`, and `flatpak` (x64 only — see `linux.target` in `electron-builder.json`). The `flatpak` target needs `flatpak`/`flatpak-builder` plus the `org.freedesktop.Platform`/`org.freedesktop.Sdk`/`org.electronjs.Electron2.BaseApp` runtimes (version pinned via the top-level `flatpak.runtimeVersion`/`flatpak.baseVersion` config, currently `25.08`) installed on the build machine before packaging — both workflows install these via apt + `flatpak install --system` from Flathub before the build step. This adds real time/bandwidth to the Linux CI job (runtime downloads are large); if that's not worth it for a fork, drop `flatpak` from `linux.target` and delete the two Flatpak steps from both workflow files. Windows also builds a `portable` `.exe` alongside the NSIS installer (no installer, "Portable" — run/copy) — no extra CI setup needed for that one.
- No auto-update support: `electron-builder`'s `publish` config (which also generates the `latest.yml`/`latest-mac.yml` feed files `electron-updater` needs) was deliberately removed to avoid coupling the template to a specific GitHub repo. If you want real auto-updates later, re-add a `publish` block to `electron-builder.json` pointing at your own repo, restore a `--publish=always` build step, and wire up `electron-updater` against the `updater:status`/`theme:changed` push-channel scaffolding already declared in `@local/shared` (see IPC CHANNELS above — currently declared but not sent).
- **E2E tests** (`/e2e` at the repo root, not a workspace package — deliberately kept out of `workspaces` in root `package.json`): Playwright's `_electron.launch()` drives the real, unpacked app (`packages/main/dist/main` + `dist/renderer`, no `electron-builder` packaging needed) and can assert on both processes in one spec — `page` methods (`e2e/tests/app.spec.ts`'s `window`) for the renderer, `electronApp.evaluate(({ app }) => ...)` for the main process. Run via `npm run test:e2e` from the repo root; its `pretest:e2e` npm hook builds `shared` + `renderer` + main's `tsc`/preload automatically via the lean `electron:build` (see the `build` vs `package` note above — no `electron-builder` step needed here). `npm run typecheck` picks up `e2e/tsconfig.json` automatically via the `typecheck:*` glob in root `package.json`; no wiring needed when adding new e2e-scoped scripts following that `<task>:e2e` naming.
  - **Gotcha (the reason `e2e/tests/app.spec.ts` launches with a directory, not the `.js` entry file):** `electron.launch({ args: [...] })` — and `electron <path>` generally — only resolves `app.getAppPath()` correctly when given a _directory containing a `package.json`_ (like `electron .`). Pass a bare `.js` file instead and `app.getAppPath()` silently falls back to Electron's internal `default_app.asar` path, with no error — it just breaks anything resolved relative to it. That includes `window.ts`'s `win.loadFile(distURL)` (silently loads nothing, blank window) and the preload script path (`electronApi` never gets exposed). If you ever see `chrome-error://chromewebdata/` from `_electron.launch()`, check this first.
  - CI runs E2E on all 3 OSes after `Test`; Linux wraps it in `xvfb-run --auto-servernum --` (no real display on `ubuntu-latest`) — deliberately not using a marketplace xvfb action (e.g. `GabrielBB/xvfb-action`, which is unmaintained/deprecated and Node-20-pinned); `xvfb` is just one more package in the existing apt install line. macOS/Windows runners have a real session already, so those steps run E2E directly.
  - **Gotcha: `electron.launch()` fails outright on `ubuntu-latest` without a CI-only workaround.** Since Ubuntu 24.04, `kernel.apparmor_restrict_unprivileged_userns=1` is the default, which blocks the unprivileged user namespace Electron's sandbox needs to initialize — `electron.launch()` throws before ever producing an app handle (see `electron/electron#41066`, `microsoft/playwright#34251`). `ci.yml` has a Linux-only step (`sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`) before the E2E step to work around it — this is a CI-runner-only setting, it doesn't touch the shipped app or weaken its actual sandbox usage. Confirmed via the exact upstream issue threads, not guessed — a plain Debian Docker container (used to sanity-check the E2E setup locally) does **not** reproduce this, since the restriction is an Ubuntu-specific AppArmor default applied at the host-kernel level, not something `docker run`ing an Ubuntu image reproduces either (it depends on the actual host kernel's sysctl, not the container's distro).
