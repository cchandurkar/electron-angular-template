# Electron Angular Template

[![CI](https://github.com/cchandurkar/electron-angular-template/actions/workflows/ci.yml/badge.svg)](https://github.com/cchandurkar/electron-angular-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12.0-brightgreen)](.nvmrc)

An Electron starter for developers who want to build a desktop app with Angular. It gives you a working window, a typed bridge between Angular and Electron, cross-platform builds, and a small note-taking example that saves data locally.

[![Angular](https://img.shields.io/badge/Angular-22-dd0031)](https://angular.dev/)
[![Electron](https://img.shields.io/badge/Electron-44-9feaf9)](https://www.electronjs.org/)

## ⚡ This Is a Highly Opinionated Template

The template starts with standalone, zoneless Angular, separate npm workspaces for the renderer, main process, and shared contract, and a frameless window. It gives you a working desktop app with a specific way to organize code and cross the process boundary. The note editor demonstrates that structure; it is not a required part of your app.

If those defaults fit what you want to build, you can start with the example and replace it piece by piece. If you want a different Angular setup or window design, expect to change those choices early.

## 🌉 The Preload Bridge Is the Point

The bridge between Angular and Electron is part of the starter, not something you have to design before building your first feature:

- The renderer stays sandboxed and isolated; the preload exposes a narrow `window.electronApi` instead of raw `ipcRenderer`.
- One shared IPC contract supplies channel names, TypeScript argument and result types, and the preload's channel allowlists.
- The note example exercises the path from Angular through preload to a main-process handler and local storage.

The allowlists check channel names, not payload values or sender identity. Validate both in main when you add privileged operations. See [the IPC guide](CONTRIBUTING.md#ipc-channel-contract) and [security notes](SECURITY.md) for details.

## 🚀 Get Started

You'll need:

- Node.js 22.12.0+ (v24 recommended — see `.nvmrc`)
- npm 10.0.0+
- TypeScript ~6.0.3 (pinned across all packages — see root `package.json`)

Use **[Use this template](https://github.com/new?template_name=electron-angular-template&template_owner=cchandurkar)** on GitHub to create your own repository, or clone this one to try it locally:

```bash
git clone https://github.com/cchandurkar/electron-angular-template.git
cd electron-angular-template
npm install
npm start
```

`npm start` builds the shared types, starts the Angular dev server, and opens Electron. Edit the Angular UI and it updates during development; changes to the main process or preload script restart Electron.

The app opens to a small note editor. Type something, close the app, and open it again to see the example's local save/load flow.

## 🛼 Make it yours

After creating a repository from the template, run the interactive rebrand helper:

```bash
npm run rebrand
```

It updates package and repository metadata, the app's display name and ID, the in-app title, the license, and several GitHub links. It runs only when you ask it to. Review the diff before committing.

Then replace the app icons in [`packages/main/assets/icons`](packages/main/assets/icons), the renderer's [`favicon.ico`](packages/renderer/public/favicon.ico), and the generic HTML title in [`packages/renderer/src/index.html`](packages/renderer/src/index.html). Remove the note example once you've used it to understand the wiring.

Before distributing an app, set the identity and release settings you need, including signing and notarization where applicable. The template intentionally does not configure a signing identity, an update server, or automatic updates.

## 🛠️ Available Scripts

Run these commands from the repository root:

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

The CI workflow runs checks and packaging on macOS, Windows, and Linux. Template tags and GitHub Releases can record tested source snapshots; the template does not need downloadable installers of the example app.

## 📖 Documentation

- [Main process](packages/main/README.md): Electron lifecycle, preload, IPC, and build
- [Renderer](packages/renderer/README.md): Angular structure, development, and tests
- [Shared package](packages/shared/README.md): wire types and channel contract
- [Contributing](CONTRIBUTING.md): setup, conventions, and pull requests
- [Security](SECURITY.md): security defaults and vulnerability reports

Contributions and issue reports are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

Licensed under [MIT](LICENSE).
