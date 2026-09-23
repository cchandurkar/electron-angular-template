# Preload bridge

- Expose only narrow methods through `contextBridge`. Never expose raw `ipcRenderer`, `require`, or other Node globals to the renderer.
- Use the channel definitions and allowlists from `@local/shared` (`packages/shared/src/ipc/index.ts`). New channels belong there; register handlers in `packages/main/src/ipc.ts`. The bridge is a routing layer, not runtime validation of sender or payloads.
- Keep `contextIsolation` and the renderer sandbox enabled. This preload is bundled to CommonJS by `packages/main/scripts/build-preload.mjs`; check that build path when changing imports.
