# Shared process contract

This package holds the wire contract used by Electron main, preload, and Angular renderer.

- Define channel names, payload/result types, and derived runtime channel allowlists in `src/ipc/index.ts`; export the public API through `src/index.ts`.
- Keep payloads plain and transferable across Electron IPC. Do not put renderer-only classes or Electron/Angular imports here. Runtime allowlists are intentional exports; this package is not literally type-only.
- TypeScript types do not validate incoming values. Main handlers remain responsible for runtime validation and sender checks before privileged work.
- Main builds against this package's compiled output, so build shared first when compiling main directly. Root scripts already handle the build order.
