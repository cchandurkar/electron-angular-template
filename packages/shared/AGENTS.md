# SHARED PACKAGE

## OVERVIEW

Cross-process TypeScript **types** — used by both Electron main and Angular renderer via the `@local/shared` workspace alias. This package defines the wire contract between processes; it holds no behavior.

## WHERE TO LOOK

| Task                          | File                 |
| ----------------------------- | -------------------- |
| Note wire shape (IPC payload) | `src/models/note.ts` |
| IPC channel map               | `src/ipc/index.ts`   |
| Package public API            | `src/index.ts`       |

## NOTE MODEL

```typescript
/** Wire/storage shape — safe across IPC and JSON serialization. */
interface NoteData {
  id: string;
  content: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

There is no `Note` class here. Behavior (constructors, immutable updaters, hydration helpers) lives renderer-side in `packages/renderer/src/app/models/note.ts`, which imports `type NoteData` from `@local/shared` and implements it locally.

## CONVENTIONS

- **Shared exports interfaces/types only — never classes.** A class carries behavior and construction logic that belongs to whichever process actually needs it (today: the renderer). Keeping shared type-only means an accidental `import { SomeClass } from '@local/shared'` inside `packages/main` is structurally impossible, not just discouraged by convention.
- Import always as `@local/shared` — never relative cross-package paths.
- `index.ts` is the only public export surface — add new exports there.
- Always send plain data objects (e.g. `NoteData`) across IPC — structured clone cannot serialize class instances/methods, so there is nothing here to accidentally send wrong.
- If a consumer needs behavior around a shared shape (constructors, immutable updaters, computed helpers), define that class in the consuming package and `implements` the shared interface — don't add it here.

## ANTI-PATTERNS

- **No classes in `src/models/`** — interfaces/types only. If you're tempted to add a method, it belongs in the consuming package instead.
- No renderer-specific imports (Angular, DOM) — this package runs in Node too.
- No Electron imports — shared must be process-agnostic.
- No direct file in `src/` other than `index.ts` and `models/`/`ipc/` subdirs.

## NOTES

- Build order: shared → renderer → main (enforced by root `npm run build`).
- tsconfig references this package as a composite project reference.
