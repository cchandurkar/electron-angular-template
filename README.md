# Electron Angular Template

[![CI](https://github.com/cchandurkar/electron-angular-template/actions/workflows/ci.yml/badge.svg)](https://github.com/cchandurkar/electron-angular-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12.0-brightgreen)](.nvmrc)
[![Electron](https://img.shields.io/badge/Electron-44-9feaf9)](https://www.electronjs.org/)
[![Angular](https://img.shields.io/badge/Angular-22-dd0031)](https://angular.dev/)

A modern Electron application template with an Angular frontend and TypeScript support, structured as an npm workspace monorepo with separate packages for the main process, renderer process, and shared types.

## ⚡ This Is a Highly Opinionated Template

This is **not** a maximally flexible starter with every option left open. It makes deliberate, specific choices — architecture, security posture, tooling, even formatting — so you don't have to relitigate them on day one. If you disagree with a choice, it's usually a small, isolated change to rip out; but nothing here is accidental or a leftover default.

- **Standalone Angular components, zoneless change detection, no `NgModule`** anywhere — forces one modern idiom instead of supporting two (`NgModule` vs. standalone) side by side
- **A production-grade preload bridge, not a `preload.js` stub** — sandboxed, allowlisted, fully typed end-to-end. See [below](#-the-preload-bridge-is-the-point) for what that means in practice
- **`@local/shared` exports types only, never classes** — keeps the cross-process wire contract JSON-serializable by construction; there's nothing stateful to accidentally leak across the boundary
- **Naming and import-order conventions are documented, not lint-enforced** — kebab-case filenames, PascalCase types, and the import-grouping order in [CONTRIBUTING.md](CONTRIBUTING.md) aren't backed by an ESLint rule; they're conventions to follow, not gates that fail your build

For per-package documentation, see the README in each package (`packages/main`, `packages/renderer`, `packages/shared`) and [CONTRIBUTING.md](CONTRIBUTING.md) for cross-cutting conventions. [SECURITY.md](SECURITY.md) covers the security-specific decisions in detail.

## 🌉 The Preload Bridge Is the Point

The preload bridge here is treated as real infrastructure, not a handful of `contextBridge.exposeInMainWorld` calls bolted on to make the renderer work:

- **Sandbox stays enabled** — `sandbox: true`, with the preload script bundled to CommonJS via esbuild specifically so the sandbox never has to be disabled to work around the ESM/CJS preload conflict
- **Every channel is explicitly allowlisted at runtime** (`INVOKE_CHANNELS`/`SEND_CHANNELS`/`PUSH_CHANNELS`) — an unrecognized channel throws immediately instead of silently no-op'ing
- **`ipcRenderer` is never exposed directly** — only per-channel `invoke`/`send`/`on` methods reach the renderer
- **End-to-end type safety** — channel name → argument types → return type are all inferred automatically from one shared definition, so main, preload, and renderer can't drift out of sync with each other
- **Single source of truth** — the entire IPC contract lives in one file (`packages/shared/src/ipc`); adding a channel means touching one place, everything else is derived

None of this is theoretical — it's exercised end-to-end by the included note-taking demo (`note:save`/`note:load` round-trip through the full validated, typed path), not just described in a doc nobody reads.

Dig deeper: [`packages/main/README.md`](packages/main/README.md) (preload API surface and IPC handlers), [SECURITY.md](SECURITY.md) (why `sandbox: true` was worth the extra build step), [CONTRIBUTING.md#ipc-channel-contract](CONTRIBUTING.md#ipc-channel-contract) (why the contract lives in `packages/shared`, not next to the preload code).

## 🏗️ Architecture

```
electron-angular-template/
├── packages/
│   ├── main/                # Electron main process
│   │   ├── src/
│   │   │   ├── preload/     # contextBridge script — bundled to CJS separately (see packages/main/README.md)
│   │   │   ├── index.ts     # Entry point
│   │   │   ├── window.ts    # BrowserWindow config
│   │   │   └── ipc.ts       # IPC channel handlers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── renderer/            # Angular frontend (standalone, zoneless)
│   │   ├── src/app/         # Components, services, models
│   │   ├── angular.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/              # Cross-process wire types — interfaces only, no classes
│       ├── src/
│       │   ├── index.ts     # Public exports
│       │   ├── models/      # e.g. NoteData
│       │   └── ipc/         # IPC channel map
│       ├── package.json
│       └── tsconfig.json
├── .github/workflows/       # ci.yml (validate on push/PR) + release.yml (build + upload artifacts)
├── .vscode/                 # Editor settings, tasks, debug configs, recommended extensions
├── .editorconfig
├── .prettierrc              # Formatting source of truth
├── tsconfig.json            # Root composite TS config
└── package.json             # Workspace root — all run scripts live here
```

Build output is per-package (`packages/main/dist`, `packages/renderer/dist`, `packages/shared/dist`), not a top-level `dist/`. `npm run build` only compiles (no installers); packaged installers from `npm run package` land in a root-level `build/` directory.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.12.0 (v24 recommended — see `.nvmrc`)
- npm >= 10.0.0
- TypeScript ~6.0.3 (pinned across all packages — see root `package.json`)

### Installation

```bash
git clone https://github.com/cchandurkar/electron-angular-template.git
cd electron-angular-template
npm install
```

### Rebranding (if you used "Use this template")

```bash
npm run rebrand
```

Interactively prompts for repo name, GitHub username, app display name/ID, and author info, then
updates package identity, `electron-builder.json`, the in-app title, `LICENSE`, and the GitHub
URLs across README/CONTRIBUTING/issue templates. Entirely optional and never runs on its own
(not wired into `postinstall`) — review the changes yourself afterward (`git diff`); app icons
under `packages/main/assets/icons/` are left for you to replace by hand.

### Development

```bash
# Start development servers for both renderer and main process
npm start

# Start individual packages
npm run app:serve      # Start Angular dev server
npm run electron:serve # Start Electron main process
npm run electron:start # Start Electron without dev server
```

### Building

```bash
# Compile all packages (no installers)
npm run build

# Compile + package into installers (.dmg/.exe/.deb/.AppImage/.flatpak)
npm run package

# Build individual packages
npm run shared:build   # Build shared utilities
npm run app:build      # Build Angular app
npm run electron:build # Compile Electron app (tsc + preload, no installer)
```

### Releasing

Publishing a GitHub Release (or running `.github/workflows/release.yml` manually via
`workflow_dispatch`) builds installers for all 3 OSes and uploads them as **workflow-run
artifacts** (Actions tab, 30-day retention) — **not** attached to the Release page itself. This
is deliberate: it avoids coupling the template to a specific GitHub repo/publish identity (see
`packages/main/AGENTS.md`). If you want installers to show up directly on the Release page, you'll
need to add a step that uploads them via `gh release upload` or `softprops/action-gh-release`.

## 📝 What You Get Out of the Box

The template ships with a minimal note-taking demo, not a placeholder counter — it's small on purpose, meant to demonstrate the wiring end-to-end rather than be a real app. Replace it with your actual feature; the plumbing around it is what you keep.

## 🛠️ Available Scripts

### Root Level Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm start`            | Start development mode (Angular + Electron)              |
| `npm run build`        | Compile all packages (no installers)                     |
| `npm run package`      | Compile + package into installers (`.dmg`/`.exe`/etc.)   |
| `npm run clean`        | Clean all build artifacts                                |
| `npm run lint`         | Lint all packages                                        |
| `npm run lint:fix`     | Fix linting issues in all packages                       |
| `npm run format`       | Format code with Prettier                                |
| `npm run format:check` | Check code formatting                                    |
| `npm run test`         | Run tests in all packages                                |
| `npm run typecheck`    | Type-check all packages                                  |
| `npm run verify`       | Run format:check + lint + typecheck + test — same as CI  |
| `npm run dev:debug`    | Start development mode with remote debugging (port 9222) |

### Package-Specific Commands

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `npm run shared:build`     | Build shared package                     |
| `npm run app:serve`        | Start Angular development server         |
| `npm run app:build`        | Build Angular application                |
| `npm run electron:serve`   | Start Electron in development mode       |
| `npm run electron:start`   | Start Electron application               |
| `npm run electron:build`   | Compile Electron app (no installer)      |
| `npm run electron:package` | Compile + package Electron app installer |

## 🔧 Development Tools

- **VS Code**: comprehensive workspace config in `.vscode/` — auto-format on save, ESLint integration, debug configurations for both main and renderer processes, recommended extensions
- **ESLint + Prettier**: linting and formatting, run via `npm run lint`/`npm run format` — see `.prettierrc` for the formatting rules
- **TypeScript**: strict mode, project references for fast incremental builds, one pinned version across all three packages
- **npm workspaces**: dependency management and cross-package script orchestration

See [CONTRIBUTING.md](CONTRIBUTING.md) for import conventions, naming conventions, testing guidelines, and commit message format.

## 📖 Project Docs

| Doc                                                        | Purpose                                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [packages/main/README.md](packages/main/README.md)         | Main process: preload bridge, IPC handlers, dev/build                                                             |
| [packages/renderer/README.md](packages/renderer/README.md) | Renderer: Angular app structure, dev/build/test, code scaffolding                                                 |
| [packages/shared/README.md](packages/shared/README.md)     | Shared wire types: rules, IPC contract, build                                                                     |
| [CONTRIBUTING.md](CONTRIBUTING.md)                         | Setup, code standards, testing, commit format, PR process                                                         |
| [SECURITY.md](SECURITY.md)                                 | Security-relevant defaults in this template and how to report a vulnerability                                     |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)                   | Community behavior expectations                                                                                   |
| [LICENSE](LICENSE)                                         | MIT                                                                                                               |
| [AGENTS.md](AGENTS.md)                                     | Machine-readable knowledge base for AI coding agents/tooling — not written for humans; see the docs above instead |

## 🤝 Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and PR guidelines, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a PR.

1. Fork the repository and create a feature branch
2. Run `npm run format && npm run lint:fix && npm run verify` before committing (`verify` runs the same format/lint/typecheck/test checks CI does, in one command)
3. Open a PR with a clear description of what changed and why

## 📄 License

MIT — see [LICENSE](LICENSE).
