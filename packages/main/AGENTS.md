# Electron main process

This package owns app lifecycle, windows, privileged IPC, storage, and packaging. The note editor's persistence is an example to replace in generated apps.

- `src/ipc.ts` registers handlers. Channel definitions and runtime allowlists live in `../shared/src/ipc/index.ts`; typed wrappers are in `src/ipc-bridge.ts`. When adding an operation, update the shared contract and main handler, then the renderer call site if applicable. The preload derives its allowed channels from shared definitions.
- Validate IPC sender and payloads in main before privileged operations. Types and preload allowlists do not validate incoming data at runtime. Keep filesystem access scoped to intended paths, and restrict URLs before passing them to `shell.openExternal`.
- Keep the renderer sandboxed and isolated (`sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`). Do not import renderer code into main or expose privileged APIs directly.
- `src/preload` is bundled separately as CommonJS by `scripts/build-preload.mjs` so it works in the sandbox. See `src/preload/AGENTS.md` when changing the bridge.
- `npm run build` compiles main and preload; the root build compiles shared and renderer first. `npm run package` creates local installers without publishing. Use the root E2E and packaging checks for changes to startup, IPC, or build configuration.
