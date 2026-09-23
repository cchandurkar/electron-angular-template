# Agent guidance

This repository is an Electron + Angular **template**. Keep changes useful to someone who creates a new app from it; the note editor is an example, not the product.

## Boundaries

- `packages/main` owns Electron, the filesystem, and privileged IPC handlers. `packages/renderer` owns the Angular UI; it must not import Node or Electron APIs directly.
- `packages/shared/src/ipc/index.ts` defines channel names, argument/result types, and the preload channel allowlists. `packages/main/src/ipc.ts` registers handlers. Renderer calls normally go through `ElectronService`.
- Send plain data across IPC. TypeScript contracts and preload allowlists do not validate runtime payloads or sender identity; check both in main for privileged operations.
- Keep `sandbox: true`, `contextIsolation: true`, and `nodeIntegration: false`. Expose a narrow preload API, never raw `ipcRenderer`.

## Work in this repository

- Run commands from the repository root: `npm start` for development, `npm run build` for compilation, `npm run package` for local installers, and `npm run verify` for the full check (including E2E). For a small change, run the relevant focused check; run broader checks when a change crosses processes or affects packaging.
- Keep the lockfile in sync with dependency changes. Do not hardcode this template repository as an app's publishing destination or update feed; adopters configure their own.
