# Angular renderer

This is a standalone, zoneless Angular app. The note editor and frameless title bar are examples for adopters to replace.

- Keep UI code in the renderer; do not import Node or Electron modules here. Use `ElectronService` for IPC and platform information. The existing header calls the exposed window controls directly; do not extend that exception to new features.
- Use `@local/shared` for cross-process payload types. Convert renderer-local classes to plain data before sending them through IPC.
- State used by templates must notify Angular when it changes (for example, signals, `AsyncPipe`, or `markForCheck`). Do not assume an arbitrary async callback triggers change detection in this zoneless app.
- Follow the existing standalone component and SCSS conventions. Add focused tests when changing behavior; choose a test at the boundary where it proves the result, including E2E for cross-process flows. New tests should assert behavior rather than only that a component can be constructed.
- `src/app/app.config.ts` configures providers and `src/app/app.routes.ts` defines routes. `src/app/services/electron/electron.service.ts` is the usual renderer entry point to Electron.
