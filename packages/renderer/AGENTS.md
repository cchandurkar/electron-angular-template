# RENDERER (Angular)

## OVERVIEW

Angular 22 standalone, zoneless SPA — the UI layer of this Electron + Angular scaffolding template. This package is meant to be forked/reused, so keep conventions generic, explicit, and easy for a new contributor to follow.

## STRUCTURE

```
renderer/
├── src/
│   ├── main.ts                  # Bootstrap entry point
│   ├── styles.scss              # Global styles (imports assets/styles partials)
│   └── app/
│       ├── app.component.*      # Root component — hosts title bar + router-outlet
│       ├── app.config.ts        # Providers: zoneless change detection, Router, Animations
│       ├── app.routes.ts        # Route table
│       ├── assets/styles/       # fonts.scss, scrollbars.scss — global partials only
│       ├── components/         # ALL components live here — see DO/DON'T below
│       ├── models/              # Renderer-local model aliases — NOT for IPC payloads
│       └── services/            # ALL injectable services live here — see DO/DON'T below
├── angular.json
└── tsconfig*.json
```

## WHERE TO LOOK

| Task                                          | Location                                |
| --------------------------------------------- | --------------------------------------- |
| Add a route                                   | `app.routes.ts`                         |
| Add a global provider                         | `app.config.ts`                         |
| Call Electron IPC                             | `services/electron/electron.service.ts` |
| Add a new page/feature component              | `components/<name>/`                    |
| Add UI shared across routes (chrome, widgets) | `components/shared/<name>/`             |
| Title bar / window controls                   | `components/shared/header/`             |

## DO

- Put every component under `components/`. One subdirectory per component, named after the component in kebab-case.
- Components shared across routes/pages go under `components/shared/<name>/`. Page/feature components get their own top-level subdirectory directly under `components/`.
- Ship exactly 4 files per component: `<name>.component.ts`, `.html`, `.scss`, `.spec.ts`. Never skip the spec.
- Put every injectable service under `services/<name>/<name>.service.ts` (+ matching `.spec.ts`).
- Use standalone components only — never introduce an `NgModule`.
- Use signal-based state (`signal()`, `computed()`, `input()`, `model()`) for anything a template reads. This app is **zoneless** (`provideZonelessChangeDetection()` in `app.config.ts`, no `zone.js`) — a plain mutable field will not reactively update the view.
- Prefer immutable update patterns for signal-held state (return/set a new value rather than mutating in place) — mutating an object referenced by a signal does not notify consumers under default equality.
- Use `inject()` for dependency injection, not constructor-parameter injection.
- Use `@if` / `@for` / `@switch` control flow, not `*ngIf` / `*ngFor` / `*ngSwitch`.
- Define host bindings/listeners via the `host: {...}` object in the `@Component`/`@Directive` decorator, not `@HostBinding`/`@HostListener`.
- Talk to Electron only through `ElectronService` (`services/electron/electron.service.ts`) — the one exception is `HeaderComponent`'s window controls, which call `window.electronApi` directly and only behind an `ElectronService.isElectron` guard.
- Keep `ElectronService`'s public surface signal-based (`readonly x: Signal<T> = this._x.asReadonly()`) so components can read it reactively without polling.
- Use `@local/shared` for any type that crosses the IPC boundary (main ⟷ renderer). `models/note.ts` defines the renderer-local `Note` class (behavior: `create()`/`from()`/`toData()`/`withContent()`), importing only `type NoteData` from `@local/shared` — it must never diverge from that shared wire shape.
- Follow the existing `app-` component selector prefix and SCSS as the styling extension (both set in `angular.json`) for new components.
- Use `loadComponent` for route-level code-splitting of larger feature components — there are no NgModules to lazy-load in this app.

## DON'T

- Don't create components anywhere outside `components/` (no page components living loose in `app/`, no ad-hoc folders).
- Don't create services anywhere outside `services/`, and don't inline IPC or cross-cutting business logic directly inside a component.
- Don't add an `NgModule` — this is a 100% standalone-components app.
- Don't call `window.electronApi` / `ipcRenderer` directly from a component — route it through `ElectronService` (header's window controls are the one pre-existing, guarded exception).
- Don't use a renderer-local model (e.g. `models/note.ts`) as an IPC payload type — always import the wire-safe type from `@local/shared` for anything sent across the Electron IPC boundary.
- Don't rely on zone.js patterns (`NgZone.run()`, assuming a stray async callback will incidentally trigger change detection) — there is no zone.js here. State that drives a template must flow through a signal, `markForCheck()`, `AsyncPipe`, or a template-bound event.
- Don't add a component or service without its accompanying `.spec.ts` — untested pieces silently rot in a template meant to be forked by others.
- Don't hardcode Electron/OS assumptions in components — use `ElectronService.isElectron` / `.platform` / `.isMac` / `.isWindows` / `.isLinux` so the same UI degrades gracefully if it's ever run outside Electron (e.g. in a plain browser during development).

## NOTES

- `ChangeDetectionStrategy.OnPush` is the Angular v22 default — no need to set it explicitly on new components. (Existing components in this repo still set it explicitly from before this became the default; harmless/redundant, not wrong — clean up opportunistically rather than as a required pass.)
- Angular v22 ships Signal Forms (`form()`, `FieldTree`, `@angular/forms/signals`) — this app uses them for the note editor (`note.component.ts`). Bind fields in templates via `[formField]="someForm.someField"` (import `FormField` from `@angular/forms/signals`), not `[formControl]`.
- Build output goes to `../main/dist/renderer` (relative to this package). The main process loads `./dist/renderer/browser/index.html` in production and `http://localhost:4200` in dev.
- Testing is Karma + Jasmine. Because the app is zoneless, every spec's `TestBed.configureTestingModule` must include `provideZonelessChangeDetection()` in its `providers` array, or the run will error with no `Zone` global present.
- No UI component library is included by default (Bootstrap/ng-bootstrap were removed as unused scaffolding weight) — add one deliberately if your fork needs it.
- `assets/styles/` holds global style partials (fonts, scrollbars) imported from `styles.scss`. Component-local styling belongs in that component's own `.scss` file, not here.
