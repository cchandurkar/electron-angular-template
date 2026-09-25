# Agent guidance

This repository is an Electron + Angular **template**. Keep changes useful to someone who creates a new app from it; the note editor is an example, not the product.

Package-specific rules live next to the code they govern. Read the relevant one before editing that package:

- [`packages/main/AGENTS.md`](packages/main/AGENTS.md): Electron main process, storage, packaging
- [`packages/main/src/preload/AGENTS.md`](packages/main/src/preload/AGENTS.md): the `contextBridge` script
- [`packages/renderer/AGENTS.md`](packages/renderer/AGENTS.md): the Angular app
- [`packages/shared/AGENTS.md`](packages/shared/AGENTS.md): the IPC wire contract

## Boundaries

- `packages/main` owns Electron, the filesystem, and privileged IPC handlers. `packages/renderer` owns the Angular UI; it must not import Node or Electron APIs directly.
- `packages/shared/src/ipc/index.ts` defines channel names, argument/result types, and the preload channel allowlists. `packages/main/src/ipc.ts` registers handlers. Renderer calls normally go through `ElectronService`.
- Send plain data across IPC. TypeScript contracts and preload allowlists do not validate runtime payloads or sender identity; check both in main for privileged operations.
- Keep `sandbox: true`, `contextIsolation: true`, and `nodeIntegration: false`. Expose a narrow preload API, never raw `ipcRenderer`.
- The renderer is zoneless. State read by templates must be a signal, go through AsyncPipe, or call markForCheck(); an arbitrary async callback does not trigger change detection.

## Work in this repository

- Run commands from the repository root: `npm start` for development, `npm run build` for compilation, `npm run package` for local installers, and `npm run verify` for the full check (format, lint, typecheck, unit tests, and E2E). For a small change, run the relevant focused check (`npm run lint:renderer`, `npm run typecheck:main`, `npm run test:renderer`, and so on); run broader checks when a change crosses processes or affects packaging.
- `main` and `renderer` compile against the built output of `@local/shared`. If you see `Cannot find module '@local/shared'`, run `npm run shared:build`. The root `lint`, `typecheck`, and `test:e2e` scripts already do this; package-level commands run directly inside `packages/*` do not.
- E2E tests (`npm run test:e2e`) build the app first and drive it with Playwright. Launch Electron with the `packages/main` directory, not the compiled `index.js`. On Ubuntu 24.04+ the Electron sandbox needs `kernel.apparmor_restrict_unprivileged_userns=0` and an X display (`xvfb-run`); see `.github/workflows/ci.yml`.
- Never edit files under `dist/`, `build/`, or `packages/*/dist/`; they are build output and are gitignored.
- Keep `package-lock.json` in sync with dependency changes (`npm install`, not hand edits). Do not bump Electron, Angular, or TypeScript majors as a side effect of another change; TypeScript is pinned to `~6.0.3` across all packages on purpose.
- Commit messages follow Conventional Commits: `type(scope): description`, where scope is usually `main`, `renderer`, `shared`, `e2e`, or `docs`. See [CONTRIBUTING.md](CONTRIBUTING.md#commit-guidelines).
- Formatting is Prettier; run `npm run format` before committing so `format:check` passes in CI. Files use kebab-case, types PascalCase with no `I` prefix.
- Do not hardcode this template repository as an app's publishing destination or update feed; adopters configure their own. `electron-builder.json` keeps `publish: null`.
- When you change behavior, add or update a test at the boundary that proves it (unit test in the owning package, E2E for cross-process flows). Tests should assert behavior, not only that something can be constructed.
- If you touch the example (note editor, `note:*` channels, `NoteData`), keep it minimal and removable. Do not grow the example into a product; prefer improving the template's structure, docs, or defaults.
