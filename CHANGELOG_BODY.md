### Features

- **ci**: add create-release workflow for automated version bump
- **ci**: publish releases via electron-builder github provider
- **build**: add mac pkg/zip and linux rpm/tar.gz targets
- **ci**: add notarized release workflow
- **main**: support optional macOS notarization and split CI validation
- **renderer**: add tiptap editor and modernize scrollbars
- **renderer**: show note saved timestamp in footer

### Bug Fixes

- **scripts**: rebrand renderer <title> and fix cross-platform prettier spawn
- **scripts**: Fix scripts/rebrand.mjs windows compatibility
- **renderer**: Fix window buttons height and width

### Refactoring

- **ci**: drop persisted CHANGELOG.md, keep release notes only
- **ci**: drop unused APPLE_TEAM_ID from release workflow
- **ci**: share build env setup via composite action

### Reverts

- **build**: drop mac pkg target

**Full Changelog**: https://github.com/cchandurkar/electron-angular-template/commits/v0.2.0
