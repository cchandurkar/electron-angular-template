# Main Process

Electron main process for this template — window management, IPC handlers, file persistence, logging, and the preload security bridge.

## Development

Run from the workspace root:

```bash
npm run electron:serve # Electron in dev mode, hot-reload on file change
npm run electron:start # Electron without the Angular dev server (loads the production renderer build)
```

## Build

```bash
npm run electron:build   # tsc build + preload bundle only (no installer)
npm run electron:package # electron:build + electron-builder packaging
```

## Preload bridge

`src/preload/index.ts` exposes a typed `window.electronApi` surface to the renderer via `contextBridge`, running with Electron's sandbox enabled (`sandbox: true`). It's bundled to CommonJS separately from the rest of this package (`scripts/build-preload.mjs`, via esbuild), because Electron's sandboxed preload environment has no ES module loader — see [SECURITY.md](../../SECURITY.md) for why that tradeoff is worth it.

Every channel is validated against an explicit allowlist before being forwarded to `ipcRenderer` — an unrecognized channel throws immediately instead of silently doing nothing. See [`CONTRIBUTING.md#ipc-channel-contract`](../../CONTRIBUTING.md#ipc-channel-contract) for how the channel contract works and how to add a new channel.

## IPC handlers

Registered in `src/ipc.ts`, wrapped by `src/ipc-bridge.ts`'s typed `handle`/`listen`/`broadcast` helpers.

| Channel                                                | Direction       | Purpose                                  |
| ------------------------------------------------------ | --------------- | ---------------------------------------- |
| `window:close` / `window:minimize` / `window:maximize` | renderer → main | Custom title bar window controls         |
| `app:versions`                                         | renderer → main | App/Node/Chrome/Electron version info    |
| `note:save` / `note:load`                              | renderer → main | Persist/read the demo note in `userData` |

## Tests

`packages/main` has no automated tests by design — it's thin glue around Electron APIs that's expensive to mock meaningfully. Application logic lives in `packages/renderer`, which does have tests.

## Learn more

- [Root README](../../README.md) — project overview, architecture, quick start
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — coding conventions, IPC channel contract, PR process
- [SECURITY.md](../../SECURITY.md) — sandboxing and `contextIsolation` rationale
