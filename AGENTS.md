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
- Releases are cut via `.github/workflows/create-release.yml` (`workflow_dispatch`, owner-only guard): it bumps all 4 `package.json` versions (root + 3 workspaces) in lockstep, generates release notes from conventional commits, commits, tags, pushes, creates a draft GitHub release, then dispatches `.github/workflows/release.yml` (a plain tag push can't — GITHUB_TOKEN-authored pushes don't trigger other workflows). `release.yml` builds/signs/notarizes/publishes per OS and its `finalize` job un-drafts the release once all 3 legs succeed. No `CHANGELOG.md` is maintained in the repo — the GitHub release notes are the changelog. Don't hand-edit package versions outside that workflow.
- `electron-builder.config.js` publishes to GitHub Releases (`publish.provider: "github"`, no hardcoded `owner`/`repo` — electron-builder auto-detects these from the repo's own git remote, so each fork publishes to its own releases). It's JS, not JSON, specifically so `extraMetadata.version` can read the root `package.json` version at build time — `packages/main/package.json`'s own version is unused (fixed at `0.0.1`), so don't "fix" that drift. Don't add a literal `owner`/`repo` pointing at a specific fork, and don't wire actual auto-update consumption (`electron-updater` in `packages/main`) without the user asking for it — the release pipeline only builds and publishes installers today; see README > Releasing.
- When you change behavior, add or update a test at the boundary that proves it (unit test in the owning package, E2E for cross-process flows). Tests should assert behavior, not only that something can be constructed.
- If you touch the example (note editor, `note:*` channels, `NoteData`), keep it minimal and removable. Do not grow the example into a product; prefer improving the template's structure, docs, or defaults.
