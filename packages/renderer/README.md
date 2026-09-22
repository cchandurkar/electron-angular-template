# Renderer

Angular 22 standalone SPA — the UI layer of this Electron app. Built with `@angular/build:application` (esbuild + Vite dev server).

## Development

Run from the workspace root:

```bash
npm start          # starts Angular dev server + Electron together
npm run app:serve  # start Angular dev server only (http://localhost:4200)
```

Component HMR is enabled — template and style changes apply without a full page reload.

## Build

```bash
npm run app:build  # production build → ../main/dist/renderer/
```

## Tests

```bash
npm run test:renderer  # Karma + Jasmine
```

## Code scaffolding

```bash
cd packages/renderer
npx ng generate component components/my-feature
```

Each component should have exactly 4 files: `.ts`, `.html`, `.scss`, `.spec.ts`.

## Notes

- All components are standalone (`standalone: true`) — no NgModule
- Cross-package imports use `@local/shared`, never relative paths outside this package
- `tsconfig.json` points `@local/shared` straight at `../shared/src` (not `dist`) — Vite/esbuild transpile TypeScript on the fly, so this package's lint/typecheck/test/dev/build all work without `packages/shared` being prebuilt first

## Learn more

- [Root README](../../README.md) — project overview, architecture, quick start
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — coding conventions, naming, testing guidelines, PR process
