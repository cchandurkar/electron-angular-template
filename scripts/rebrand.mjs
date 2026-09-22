#!/usr/bin/env node
/**
 * One-shot, manually-run rebrand helper for people who used "Use this template".
 *
 * Run via `npm run rebrand` from the repo root. NOT run automatically (not wired into
 * postinstall) — this only touches files when you explicitly ask it to.
 *
 * What it updates: package identity (root/main/shared package.json), electron-builder
 * productName/appId, the in-app header title, LICENSE copyright, and the GitHub URLs/repo
 * name/product name in README, CONTRIBUTING, AGENTS.md, release.yml, and the issue templates.
 * See the printed summary at the end for exactly which files changed, plus a short list of
 * things left for you to do by hand (app icons, etc.) — this script deliberately does not
 * touch those.
 *
 * Nothing is committed or shown as a git diff — review the changes yourself afterward.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { input } from '@inquirer/prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function readJson(root, relPath) {
  const full = path.join(root, relPath);
  return { full, data: JSON.parse(await readFile(full, 'utf8')) };
}

async function writeJson(full, data) {
  await writeFile(full, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function replaceInFile(root, relPath, replacements) {
  const full = path.join(root, relPath);
  let content = await readFile(full, 'utf8');
  for (const [from, to] of replacements) {
    content = from instanceof RegExp ? content.replace(from, to) : content.split(from).join(to);
  }
  await writeFile(full, content, 'utf8');
}

const notBlank = value => value.trim().length > 0 || 'Required';

/**
 * Prompts the user for every rebrand input, interactively (via @inquirer/prompts). Exported
 * separately from `applyRebrand` so the file-mutation logic can be exercised directly (e.g.
 * in tests) without going through a real terminal prompt.
 */
export async function gatherAnswers(root = ROOT) {
  console.log('Rebrand this template — press Enter to keep a suggested default.\n');

  const { data: rootPkg } = await readJson(root, 'package.json');
  const { data: mainPkg } = await readJson(root, 'packages/main/package.json');

  const oldRepoName = rootPkg.name;
  const oldGithubUser =
    /github\.com[/:]([^/]+)\//.exec(rootPkg.repository?.url ?? '')?.[1] ?? 'cchandurkar';
  const oldProductName = mainPkg.productName;

  const repoName = await input({ message: 'GitHub repository name', default: oldRepoName });
  const githubUser = await input({
    message: 'GitHub username or org',
    required: true,
    validate: notBlank
  });
  const productName = await input({
    message: 'App display name (productName)',
    default: oldProductName
  });
  const appId = await input({
    message: 'App ID (reverse-DNS)',
    default: `com.${slug(githubUser)}.${slug(repoName)}`
  });
  const authorName = await input({ message: 'Author name', required: true, validate: notBlank });
  const authorEmail = await input({ message: 'Author email (optional)' });
  const year = await input({
    message: 'Copyright year',
    default: String(new Date().getFullYear())
  });

  return {
    repoName,
    githubUser,
    productName,
    appId,
    authorName,
    authorEmail,
    year,
    oldRepoName,
    oldGithubUser,
    oldProductName
  };
}

/**
 * Applies a resolved set of rebrand answers to the repo at `root`. Pure file mutation, no
 * prompting — this is the part that matters for correctness and is what tests exercise directly.
 */
export async function applyRebrand(answers, root = ROOT) {
  const {
    repoName,
    githubUser,
    productName,
    appId,
    authorName,
    authorEmail,
    year,
    oldRepoName,
    oldGithubUser,
    oldProductName
  } = answers;

  const changed = [];
  const homepage = `https://github.com/${githubUser}/${repoName}#readme`;
  const author = authorEmail ? { name: authorName, email: authorEmail } : { name: authorName };

  // Root package.json
  {
    const { full, data } = await readJson(root, 'package.json');
    data.name = repoName;
    data.homepage = homepage;
    data.bugs = { url: `https://github.com/${githubUser}/${repoName}/issues` };
    data.repository = {
      type: 'git',
      url: `git+https://github.com/${githubUser}/${repoName}.git`
    };
    data.author = author;
    await writeJson(full, data);
    changed.push('package.json');
  }

  // packages/main/package.json
  {
    const { full, data } = await readJson(root, 'packages/main/package.json');
    data.productName = productName;
    data.homepage = homepage;
    data.author = author;
    await writeJson(full, data);
    changed.push('packages/main/package.json');
  }

  // packages/shared/package.json — author is a plain string here, not an object
  {
    const { full, data } = await readJson(root, 'packages/shared/package.json');
    data.author = authorName;
    await writeJson(full, data);
    changed.push('packages/shared/package.json');
  }

  // packages/main/electron-builder.json — productName + a real appId (was deliberately unset)
  {
    const { full, data } = await readJson(root, 'packages/main/electron-builder.json');
    data.productName = productName;
    const ordered = { appId, ...data };
    await writeJson(full, ordered);
    changed.push('packages/main/electron-builder.json');
  }

  // In-app title bar text
  await replaceInFile(root, 'packages/renderer/src/app/app.component.html', [
    [`title="${oldProductName}"`, `title="${productName}"`]
  ]);
  changed.push('packages/renderer/src/app/app.component.html');

  // LICENSE copyright line
  await replaceInFile(root, 'LICENSE', [
    [/Copyright \(c\) \d{4} .+/, `Copyright (c) ${year} ${authorName}`]
  ]);
  changed.push('LICENSE');

  // Docs: GitHub URLs, repo-name mentions, and the product name in doc titles. Safe as plain
  // substring replacement — all three are specific enough (and scoped to these known files)
  // to not collide with unrelated text.
  const docReplacements = [
    [oldRepoName, repoName],
    [oldGithubUser, githubUser],
    [oldProductName, productName]
  ];
  for (const doc of [
    'README.md',
    'CONTRIBUTING.md',
    'AGENTS.md',
    '.github/workflows/release.yml',
    '.github/ISSUE_TEMPLATE/config.yml',
    '.github/ISSUE_TEMPLATE/bug_report.yml'
  ]) {
    await replaceInFile(root, doc, docReplacements);
    changed.push(doc);
  }

  // LICENSE has no prettier parser (plain text) — always exclude it, or every run reports a
  // spurious formatting error for a file that was never going to be formatted anyway.
  const formattable = changed.filter(file => file !== 'LICENSE');
  try {
    execFileSync('npx', ['prettier', '--write', ...formattable], { cwd: root, stdio: 'ignore' });
  } catch {
    // Non-fatal — formatting can be fixed later with `npm run format`.
  }

  return changed;
}

async function main() {
  const answers = await gatherAnswers(ROOT);
  const changed = await applyRebrand(answers, ROOT);

  console.log('\nDone. Updated:');
  for (const file of changed) console.log(`  - ${file}`);

  console.log('\nStill worth doing by hand:');
  console.log('  - Replace app icons in packages/main/assets/icons/ (see that dir for sizes)');
  console.log(
    '  - packages/renderer/src/index.html <title> is generic ("Renderer") — brand it if you want'
  );
  console.log('  - Run `npm install` once so package-lock.json picks up the new package name');
  console.log('  - Review the changes yourself (git diff) before committing');
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(err => {
    if (err.name === 'ExitPromptError') {
      console.log('\nCancelled — no files were changed.');
      process.exit(0);
    }
    console.error(err);
    process.exit(1);
  });
}
