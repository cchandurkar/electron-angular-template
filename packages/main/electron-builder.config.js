// Electron-builder config as JS (not JSON) so `extraMetadata.version` can read the version
// straight from the repo root's package.json at build time.

import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPackageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

export default {
  productName: 'Electron Angular Template',
  directories: {
    output: '../../build/',
    buildResources: 'assets/icons'
  },
  publish: {
    provider: 'github'
  },
  extraMetadata: {
    version: rootPackageJson.version
  },
  artifactName: '${productName}-v${version}.${ext}',
  asar: true,
  forceCodeSigning: false,
  npmRebuild: false,
  files: ['./dist/**/*', './assets/**/*', './package.json'],
  win: {
    target: ['nsis', 'portable']
  },
  nsis: {
    artifactName: '${productName}-v${version}-Setup.${ext}'
  },
  linux: {
    target: ['deb', 'AppImage', 'rpm', 'tar.gz', { target: 'flatpak', arch: ['x64'] }]
  },
  flatpak: {
    runtime: 'org.freedesktop.Platform',
    runtimeVersion: '25.08',
    sdk: 'org.freedesktop.Sdk',
    base: 'org.electronjs.Electron2.BaseApp',
    baseVersion: '25.08'
  },
  mac: {
    hardenedRuntime: true,
    gatekeeperAssess: false,
    target: ['dmg', 'zip'],
    notarize: false
  }
};
