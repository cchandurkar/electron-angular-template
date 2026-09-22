# Shared

Cross-process TypeScript wire types, consumed by both `packages/main` (Node/Electron) and `packages/renderer` (Angular), always imported as `@local/shared`.

## What lives here

- `src/models/note.ts` — `NoteData`, the wire/storage shape for the demo note
- `src/ipc/index.ts` — the IPC channel contract: channel names, payload/result types, and the runtime allowlists (`INVOKE_CHANNELS`/`SEND_CHANNELS`/`PUSH_CHANNELS`) the preload bridge validates against
- `src/index.ts` — the only public export surface; add new exports here

## Rules

- **Types and interfaces only — never classes.** This package holds no behavior. If you're tempted to add a method, it belongs in whichever process actually needs it (see `packages/renderer/src/app/models/note.ts` for the pattern: a renderer-local class that `implements` a shared interface).
- No Angular/DOM imports, no Electron imports — this package must stay usable from both a browser bundle and a Node process.
- Always send plain data objects across IPC — structured clone can't serialize class instances/methods.

See [`CONTRIBUTING.md#ipc-channel-contract`](../../CONTRIBUTING.md#ipc-channel-contract) for why the IPC contract lives here specifically (not next to the preload script), and how to add a new channel.

## Build

```bash
npm run shared:build # from the workspace root
```

`packages/renderer` resolves this package straight from `src/` (Vite/esbuild transpile TypeScript on the fly), so it doesn't need this build for lint/typecheck/test/dev. `packages/main` genuinely needs it prebuilt first — its `tsc` build resolves `@local/shared` via the compiled `dist/`, not `src/`.

## Tests

No automated tests by design — this package is type/data definitions with no logic to meaningfully unit test.

## Learn more

- [Root README](../../README.md) — project overview, architecture, quick start
- [CONTRIBUTING.md#ipc-channel-contract](../../CONTRIBUTING.md#ipc-channel-contract) — the IPC contract design in full
