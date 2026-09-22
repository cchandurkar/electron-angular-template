# Contributing to Electron Angular Template

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22.12.0 or higher (24.x recommended — see `.nvmrc`; Electron's bundled Node runtime is 24.x)
- **npm**: Version 10.0.0 or higher
- **TypeScript**: ~6.0.3 (pinned — see root `package.json`)
- **Git**: Latest version

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/electron-angular-template.git
   cd electron-angular-template
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### Code Standards

- TypeScript everywhere — no `.js` source files
- Must pass ESLint and Prettier (`npm run lint`, `npm run format:check`)
- No `any` unless there's genuinely no better option

### Before Committing

Fix up formatting and lint issues, then run everything that CI checks in one shot:

```bash
npm run format     # auto-fix formatting
npm run lint:fix   # auto-fix lint issues
npm run verify     # format:check + lint + typecheck + test, in that order — same checks CI runs
```

`npm run verify` exists specifically so it's hard to forget one of the checks — run it before every commit, not just `typecheck`/`lint:fix` individually. It doesn't include `npm run package` (that's slower and CI catches packaging issues separately), so run `npm run package` too before anything you'd consider a larger change.

### Package-Specific Development

#### Working on Renderer (`packages/renderer`)

```bash
npm run app:serve # Angular dev server
npm run app:build # Build Angular project with Production target
```

#### Working on Main Process (`packages/main`)

```bash
npm run electron:serve   # Launches electron in DEV mode with hot-reload
npm run electron:build   # Compile only (tsc + preload bundle, no installer)
npm run electron:package # Compile + package installer using electron-builder
```

#### Working on Shared Utilities (`packages/shared`)

```bash
npm run shared:build  # Build JS files
```

## 🏗️ Architecture Guidelines

### File Organization

```
packages/
│
├── main/
│   ├── src/
│   │   ├── preload/
│   │   │   ├── index.ts       # Preload script
│   │   │   └── index.d.ts     # Preload script types
│   │   │
│   │   ├── index.ts           # Entry point
│   │   ├── window.ts          # Window management
│   │   └── ipc.ts             # IPC Handles
│   │
├── renderer/
│   ├── src/
│   │   ├── app/
│   │   │   ├── assets/        # Fonts, scrollbars — global style partials
│   │   │   ├── components/    # Angular components (4 files each: .ts/.html/.scss/.spec.ts)
│   │   │   ├── services/      # Angular services
│   │   │   └── models/        # Renderer-local models (e.g. Note class)
│   │   │
└── shared/
    ├── src/
    │   ├── index.ts           # Main exports
    │   ├── models/            # Wire types (e.g. NoteData) — interfaces only, no classes
    │   └── ipc/               # IPC channel map
```

### IPC Channel Contract

`packages/shared/src/ipc/index.ts` is the single source of truth for every IPC channel: its name, its payload/result types, and the runtime allowlists (`INVOKE_CHANNELS`, `SEND_CHANNELS`, `PUSH_CHANNELS`) that the preload bridge validates against. This is a deliberate design choice, not an arbitrary place to put it — it exists in `packages/shared` specifically because **three independent runtimes consume it, and none of them can import from each other**:

```
packages/shared/src/ipc/index.ts   (channel names, payload types, allowlists)
        │
        ├──► packages/main/src/ipc-bridge.ts, ipc.ts    (main process itself — registers ipcMain.handle/on/broadcast)
        ├──► packages/main/src/preload/index.ts          (preload bridge — validates channels before forwarding to ipcRenderer)
        └──► packages/renderer/.../electron.service.ts   (renderer — types its own local state, e.g. AppVersions, UpdaterStatus)
```

Note that the **main process's own code** (`ipc-bridge.ts`/`ipc.ts`) is a separate consumer from the **preload script** — they're different files, running in different contexts, that both need the exact same channel/type definitions to stay in sync.

**Why this can't move into `packages/main/src/preload`:**

- The renderer would lose access entirely — it can never import from `packages/main` (that's the actual process boundary: `packages/main` pulls in Node/Electron APIs that have no place in a browser bundle, not just a style preference).
- Main's own `ipc-bridge.ts`/`ipc.ts` would end up reaching into a `preload/` subdirectory for something that used to be defined as an ordinary sibling — backwards, since preload is a narrow, privileged _consumer_ of the contract, not where the contract should be authored.
- The whole point of a single source of truth is that a channel rename or payload-shape change can't drift between what preload allows, what main handles, and what renderer expects. Splitting the definitions across packages reopens exactly that class of bug.

**Adding a new channel**: one line in `INVOKE_CHANNEL_DEFS` / `SEND_CHANNEL_DEFS` / `PUSH_CHANNEL_DEFS` in `packages/shared/src/ipc/index.ts` — the types and runtime allowlists are derived from those objects automatically, nothing else to touch there. You still need to add the corresponding `ipcMain.handle`/`on` in `packages/main/src/ipc.ts` and, if it should be reachable from the renderer, a method on `ElectronService`.

### Naming Conventions

- **Files**: kebab-case (`my-component.ts`)
- **Classes**: PascalCase (`MyComponent`)
- **Functions/Variables**: camelCase (`myFunction`)
- **Constants**: SCREAMING_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces/Types**: PascalCase, no `I` prefix (`NoteData`, `AppVersions`, `UpdaterStatus` — matches existing code in `packages/shared`)

### Import Guidelines

```typescript
// 1. Node modules
import { app } from 'electron';
import { Component } from '@angular/core';

// 2. Shared wire types (always the workspace alias, never a relative cross-package path)
import type { NoteData } from '@local/shared';

// 3. Local imports
import { MyService } from './my-service';
import { MyComponent } from '../components/my-component';
```

## 🧪 Testing Guidelines

### Writing Tests

- Write unit tests for all new functionality
- Place test files next to the code they test (`*.spec.ts`, same directory as the file under test)
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### Test File Naming

- Unit tests: `*.spec.ts` — this is the only test convention actually used today (Karma + Jasmine in `packages/renderer`; `packages/main`/`packages/shared` have no automated tests by design). There is no integration/e2e test setup in this template — add one deliberately if your fork needs it, rather than assuming `*.e2e.spec.ts` files are picked up by anything.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test:main
npm run test:renderer
npm run test:shared
```

## 📝 Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(main): add window management service
fix(renderer): resolve component loading issue
docs(readme): update installation instructions
test(shared): add utility function tests
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

The project includes recommended extensions in `.vscode/extensions.json`:

- **ESLint** (`dbaeumer.vscode-eslint`) and **Prettier** (`esbenp.prettier-vscode`) — linting and formatting; TypeScript support itself is built into VS Code, no extra extension needed
- **Angular Language Service** (`angular.ng-template`) — template diagnostics, completions, go-to-definition
- **Angular Snippets** (`johnpapa.angular2`) — TypeScript/HTML snippets for Angular

### VS Code Settings

The workspace includes optimized settings for:

- Auto-formatting on save
- ESLint integration
- TypeScript support
- Debugging configurations

## 🐛 Reporting Issues

Use the bug report template under Issues — it already prompts for repro steps, expected/actual behavior, and environment. For feature requests, open a Discussion first if the direction isn't obvious.
