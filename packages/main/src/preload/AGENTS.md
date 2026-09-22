# PRELOAD BRIDGE

## OVERVIEW

contextBridge security boundary — exposes a typed `window.electronApi` surface to the renderer. No Node APIs leak beyond this file.

## WHERE TO LOOK

| Task                          | File                      |
| ----------------------------- | ------------------------- |
| `window.electronApi` shape    | `index.ts` — `api` object |
| TypeScript types for renderer | `types/index.d.ts`        |

## API SURFACE (`window.electronApi`)

```typescript
invoke(channel: InvokeChannel, ...args): Promise<InvokeResult<C>>
  // → ipcRenderer.invoke(channel, ...args); throws if channel not in INVOKE_CHANNELS
send(channel: SendChannel, ...args): void
  // → ipcRenderer.send(channel, ...args); throws if channel not in SEND_CHANNELS
on(channel: PushChannel, listener): () => void
  // → ipcRenderer.on(channel, wrapped); throws if channel not in PUSH_CHANNELS
  // returns an unsubscribe function (removes the listener)
```

Each method validates the channel name against an allowlist `Set` built from
`INVOKE_CHANNELS` / `SEND_CHANNELS` / `PUSH_CHANNELS`, all imported from `@local/shared`
(single source of truth shared with the main process — see `../ipc.ts`). An
unrecognized channel throws immediately instead of silently no-op'ing.

Actual channels (defined in `../ipc.ts`, wrapped by `../ipc-bridge.ts`):

- Fire-and-forget (`send`): `window:close`, `window:minimize`, `window:maximize`
- Request/response (`invoke`): `app:versions`, `note:save`, `note:load`
- Push (`on`): `theme:changed`, `updater:status` — declared in `PUSH_CHANNELS`/`@local/shared` and allowed through this bridge, but nothing in `../ipc.ts` calls `broadcast()` to actually send them yet (future scaffolding, e.g. an update-checker)

Exposes `window.process` = `{ type: 'renderer', platform: process.platform }` — NOT the full Node process.

## ANTI-PATTERNS

- Never expose `ipcRenderer` directly — only wrap specific channels
- Never expose `require`, `__dirname`, or other Node globals
- Never add a channel here without a corresponding `ipcMain.handle/on` in `../ipc.ts`
- Never disable `contextIsolation` — it is the security guarantee of this bridge

## NOTES

- Output: bundled to `dist/main/preload/index.js` as **CommonJS** by esbuild (`../scripts/build-preload.mjs`), not by the main process's `tsc` build — this file is excluded from `../tsconfig.json` (see `../tsconfig.preload.json` for its type-checking config)
- CJS, not ESM, because Electron's sandboxed preload (`sandbox: true` in `../window.ts`) never gets a real ESM loader — only a polyfilled `require()`. A sibling `dist/main/preload/package.json` (`{ "type": "commonjs" }`) overrides the parent's `"type": "module"` so the bundle can keep the `.js` extension instead of `.cjs`
- Page components access this via `ElectronService`; header component calls window controls directly (guarded by `isElectron`)
