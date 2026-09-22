// Bundles the preload script to CommonJS so it can run with `sandbox: true`.
//
// Why this exists: Electron's sandboxed preload environment runs as plain
// browser JS with a polyfilled `require()` — it never gets a real ESM loader,
// sandboxed or not (see https://electronjs.org/docs/latest/tutorial/esm). The
// rest of `packages/main` is plain ESM (`"type": "module"`), so this script
// bundles *only* `src/preload/index.ts` down to a single CommonJS file with
// esbuild, independent of the main process's `tsc` build.
//
// The output keeps the `.js` extension (rather than `.cjs`) by dropping a
// sibling `package.json` with `{ "type": "commonjs" }` next to it — that
// overrides the parent `"type": "module"` for just this subtree, which is
// the standard way to mix module formats without renaming files.
import { context, build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const entry = path.join(packageRoot, 'src/preload/index.ts');
const outdir = path.join(packageRoot, 'dist/main/preload');
const outfile = path.join(outdir, 'index.js');

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  sourcemap: true,
  external: ['electron'],
  logLevel: 'info'
};

async function writeCommonJsMarker() {
  await mkdir(outdir, { recursive: true });
  await writeFile(
    path.join(outdir, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
  );
}

async function main() {
  await writeCommonJsMarker();

  if (watch) {
    const ctx = await context(options);
    await ctx.watch();
    console.log('[preload] watching for changes...');
  } else {
    await build(options);
    console.log(`[preload] built -> ${path.relative(packageRoot, outfile)}`);
  }
}

main().catch(error => {
  console.error('[preload] build failed:', error);
  process.exit(1);
});
