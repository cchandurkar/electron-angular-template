# PROJECT KNOWLEDGE BASE

## OVERVIEW

Electron 44 + Angular 22.1 desktop app template — npm workspace monorepo with three packages: `main` (Electron/Node), `renderer` (Angular SPA, zoneless), `shared` (TypeScript wire types). Node 24, TypeScript 6.0.3 strict.

## STRUCTURE

```
electron-angular-template/
├── packages/
│   ├── main/src/         # Electron main process + preload
│   ├── renderer/src/     # Angular 22 app (standalone components)
│   └── shared/src/       # Shared wire types (NoteData) — no classes, see shared/AGENTS.md
├── .github/workflows/    # ci.yml (validate on push/PR) + release.yml (build+upload on GitHub Release)
├── tsconfig.json         # Root composite TS config
├── package.json          # Workspace root; all run scripts here
└── .prettierrc           # Formatting source of truth
```

## WHERE TO LOOK

| Task                              | Location                                                          |
| --------------------------------- | ----------------------------------------------------------------- |
| Electron app init / crash handler | `packages/main/src/index.ts`                                      |
| IPC channel definitions           | `packages/main/src/ipc.ts`                                        |
| BrowserWindow setup               | `packages/main/src/window.ts`                                     |
| Preload bridge (contextBridge)    | `packages/main/src/preload/index.ts`                              |
| Angular app bootstrap             | `packages/renderer/src/main.ts`                                   |
| Angular app config / routing      | `packages/renderer/src/app/app.config.ts`, `app.routes.ts`        |
| Angular→Electron bridge (service) | `packages/renderer/src/app/services/electron/electron.service.ts` |
| Shared wire types                 | `packages/shared/src/models/note.ts`                              |
| Storage (userData files)          | `packages/main/src/storage.ts`                                    |
| Logging                           | `packages/main/src/logger.ts`                                     |
| All run scripts                   | root `package.json`                                               |

## CODE MAP

| Symbol             | Type              | Location                           | Role                                                                                                                                            |
| ------------------ | ----------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `app` (default)    | Electron App      | `main/src/index.ts`                | Entry; hot-reload in dev via chokidar                                                                                                           |
| `setupIpcHandlers` | Function          | `main/src/ipc.ts`                  | Registers all IPC channels                                                                                                                      |
| `createWindow`     | Function          | `main/src/window.ts`               | Creates frameless BrowserWindow                                                                                                                 |
| `serve` / `isMac`  | Config            | `main/src/config.ts`               | Dev-mode flag (`--serve`), platform detect                                                                                                      |
| `Storage`          | Class             | `main/src/storage.ts`              | saveFile/readFile/fileExists at `app.getPath('userData')`                                                                                       |
| `getLogger`        | Function          | `main/src/logger.ts`               | Factory: daily-rotate logger, 4MB cap                                                                                                           |
| `api`              | Preload object    | `main/src/preload/index.ts`        | Exposed as `window.electronApi` via contextBridge                                                                                               |
| `ElectronService`  | Angular Service   | `renderer/.../electron.service.ts` | `isElectron` getter; `saveNote`/`loadNote` via `invoke`                                                                                         |
| `AppComponent`     | Angular Component | `renderer/.../app.component.ts`    | Root standalone component                                                                                                                       |
| `Note`             | Class             | `renderer/src/app/models/note.ts`  | id(UUID), content, timestamps; `create()`/`from()`/`withContent()` — behavior lives renderer-side, shared only exports the `NoteData` wire type |

## CONVENTIONS

- **Standalone components only** — no NgModule anywhere in renderer
- **Shared package imported as** `@local/shared` (workspace alias, not relative path)
- **Frameless window** — `frame: false`, `titleBarStyle: 'hidden'` — renderer owns title bar UI
- **Renderer build output** goes to `../main/dist/renderer` (relative to renderer package)
- **Prod URL** is `./dist/renderer/browser/index.html`; dev URL is `http://localhost:4200`
- **IPC types**: `ipcMain.on` for fire-and-forget (window controls); `ipcMain.handle` for request/response
- **Prettier**: singleQuote, semi, trailingComma:none, printWidth:100, arrowParens:avoid
- **EditorConfig**: 2 spaces, LF, UTF-8

## ANTI-PATTERNS (THIS PROJECT)

- No NgModule — adding one breaks the standalone architecture
- No relative cross-package imports — always `@local/shared`
- No direct `ipcRenderer.send/invoke` in Angular — always via `ElectronService`
- No `nodeIntegration: true` — contextIsolation is enforced; use preload bridge
- No test suppression — main package has no tests by design (not an oversight to "fix")

## COMMANDS

```bash
npm start              # dev: Angular :4200 + Electron (hot reload)
npm run build          # prod compile only: shared → renderer → main (no installer)
npm run package        # build + electron-builder (local packaging only, no publish)
npm run test           # Karma tests (renderer only; main/shared have no tests by design)
npm run test:e2e       # Playwright E2E against the unpacked build (see packages/main/AGENTS.md)
npm run lint           # ESLint all workspaces
npm run typecheck      # tsc --noEmit all workspaces
npm run dev:debug      # start + --remote-debugging-port=9222
```

## NOTES

- `dev` script builds shared synchronously first (`shared:build`), then starts all three watchers in parallel — guarantees `packages/shared/dist/` exists before Angular/Electron start
- `wait-on tcp:4200` gates Electron startup in dev — Angular must be running first
- Hot reload (main process): chokidar watches `dist/main` + `../shared/dist`; on change, restarts via `child_process.spawn(..., { stdio: 'inherit' })` to keep terminal logs connected; 1500ms startup delay + 500ms debounce prevent restart storms
- Angular renderer uses Vite 7 dev server (via Angular CLI) with component HMR enabled (`hmr: true` in `angular.json`) — no full-page reload for template/style edits
- Renderer `tsconfig.json` points `@local/shared`/`@local/shared/*` straight at `../shared/src` (not `dist`) — Vite/esbuild transpile `.ts` on the fly, so renderer's lint/typecheck/test/dev/build all work with zero `packages/shared/dist` on disk. `packages/main`'s tsconfig still points at `../shared/dist` and genuinely needs it prebuilt: plain `tsc` emit enforces `rootDir`, so pointing it at shared's source breaks `tsc:build` with `TS6059`/`TS6307` (verified — it also silently emits stray `.js`/`.d.ts` into `packages/shared/src/` when this is attempted, so don't try it without also giving `packages/main` a separate non-emitting, source-pointing tsconfig). This asymmetry is why `lint`/`lint:fix`/`typecheck` (root scripts) still run `shared:build` first — that's for `packages/main`'s benefit only — while `test` doesn't need to anymore
- CI matrix: `.github/workflows/ci.yml` runs lint/format/typecheck/test/build on push/PR to `main` across ubuntu × windows × macos, Node 24 — validates packaging works but never uploads/publishes anything
- `.gitattributes` forces `eol=lf` on all text files (`.ico` excluded, marked `binary`) — without it, Windows runners (`core.autocrlf=true` by default) check files out as CRLF, and `.prettierrc`'s `endOfLine: "lf"` then flags every single file in `format:check`. This is a checkout-time issue, not a real formatting problem — if `format:check` ever fails on Windows only, for every file at once, check this first before touching any actual file content
- `.github/workflows/release.yml` runs only when a GitHub Release is published (or manual `workflow_dispatch`): builds the same way, then uploads the resulting installers as workflow-run artifacts via `actions/upload-artifact` (not attached to the Release, no GitHub-identity coupling)
- `// TODO: Show "Report Crash" dialog` in `main/src/index.ts` — crash handler is stubbed
- electron-log daily rotation is overridden in `logger.ts`; do not call `electronLog` directly
- `packages/main/src/preload` has its own AGENTS.md for contextBridge security rules
