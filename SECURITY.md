# Security Policy

## Supported Versions

This is a template repository intended to be forked, not a deployed service with long-term version support. Security fixes are made against the latest commit on the default branch only.

| Version                 | Supported |
| ----------------------- | --------- |
| latest (default branch) | ✅        |
| older tags/commits      | ❌        |

## Reporting a Vulnerability

If you find a security vulnerability in this template — for example, an IPC channel that bypasses the `contextBridge` allowlist, a `contextIsolation`/`nodeIntegration` misconfiguration, a path-traversal issue in `Storage`, or a vulnerable dependency — please **do not open a public GitHub issue**.

Instead, report it privately via [GitHub Security Advisories](../../security/advisories/new) for this repository. Include:

- A description of the issue and where it lives (file/line if known)
- Steps to reproduce, or a minimal repro
- The potential impact (what an attacker could do)

You should expect an initial response within a few days. This is a community-maintained template, not a funded security team, so timelines are best-effort.

## Scope

This template demonstrates several security-relevant Electron patterns:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` — the preload script is bundled to CommonJS via esbuild (`packages/main/scripts/build-preload.mjs`) specifically to keep the sandbox enabled; see [`packages/main/README.md`](packages/main/README.md)
- A `contextBridge`-exposed API restricted to an explicit IPC channel allowlist (`packages/main/src/preload/index.ts`)
- `webSecurity: true`, `setWindowOpenHandler`, and a default-deny `setPermissionRequestHandler` (`packages/main/src/window.ts`)
- Filename sanitization in `Storage` (`packages/main/src/storage.ts`)

If you're auditing a fork of this template, re-verify these are still in place — it's easy to accidentally loosen one of them while adding a feature.

## Not in Scope

- Vulnerabilities in third-party dependencies with no template-specific exploitation path — report those upstream instead (though a PR bumping the dependency here is welcome)
- Issues that only reproduce with `sandbox: true` intentionally disabled, or with `contextIsolation`/`nodeIntegration` deliberately misconfigured away from this template's defaults
