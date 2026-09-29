#!/usr/bin/env node
// Generates the GitHub release notes body for the range between the last git tag (or the
// start of history, if this is the first release) and HEAD, grouped by conventional-commit
// type. Writes CHANGELOG_BODY.md for use as the release notes — nothing is persisted to the
// repo (no CHANGELOG.md); the GitHub release itself is the changelog's home.
//
// Usage: node generate-changelog.mjs <newVersion> <owner/repo>
//   newVersion  e.g. "1.2.3" (no leading "v")
//   owner/repo  e.g. "cchandurkar/electron-angular-template" (for the compare link)

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [, , newVersion, repoSlug] = process.argv;
if (!newVersion || !repoSlug) {
  console.error('Usage: generate-changelog.mjs <newVersion> <owner/repo>');
  process.exit(1);
}

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const MAX_ENTRIES = 150;
const TYPES = [
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['refactor', 'Refactoring'],
  ['perf', 'Performance'],
  ['revert', 'Reverts']
];

const typeLabel = new Map(TYPES);

let lastTag = '';
try {
  lastTag = sh('git describe --tags --abbrev=0');
} catch {
  // No tags yet — this is the first release; changelog covers full history.
}

const range = lastTag ? `${lastTag}..HEAD` : '';
const log = sh(`git log ${range} --format=%s`.trim());
const subjects = log ? log.split('\n') : [];

// Matches this repo's commit convention: `type(scope): description` (see root AGENTS.md).
const pattern = /^(\w+)(\(.+?\))?(!)?: (.+)$/;
const groups = new Map();
let matchedCount = 0;

for (const subject of subjects) {
  const m = subject.match(pattern);
  if (!m) continue;
  const [, type, scopeRaw, , message] = m;
  if (!typeLabel.has(type)) continue;
  matchedCount++;
  const scope = scopeRaw ? scopeRaw.slice(1, -1) : null;
  const line = scope ? `- **${scope}**: ${message}` : `- ${message}`;
  if (!groups.has(type)) groups.set(type, []);
  groups.get(type).push(line);
}

let truncatedNote = '';
if (matchedCount > MAX_ENTRIES) {
  let kept = 0;
  for (const [type] of TYPES) {
    const lines = groups.get(type);
    if (!lines) continue;
    if (kept >= MAX_ENTRIES) {
      groups.delete(type);
      continue;
    }
    const remaining = MAX_ENTRIES - kept;
    if (lines.length > remaining) {
      groups.set(type, lines.slice(0, remaining));
    }
    kept += groups.get(type).length;
  }
  truncatedNote = `\n_…and ${matchedCount - MAX_ENTRIES} more change(s) not shown here — see the full changelog link below._\n`;
}

const sections = TYPES.filter(([type]) => groups.has(type))
  .map(([type, label]) => `### ${label}\n\n${groups.get(type).join('\n')}`)
  .join('\n\n');

const compareLink = lastTag
  ? `**Full Changelog**: https://github.com/${repoSlug}/compare/${lastTag}...v${newVersion}`
  : `**Full Changelog**: https://github.com/${repoSlug}/commits/v${newVersion}`;

// Fallback for forks that don't use Conventional Commits: `sections` is only empty here when
// zero commits matched the type-prefixed pattern above. If commits exist but none matched,
// list them verbatim instead of silently claiming "no changes" when real work happened.
let sectionsBody = sections;
let noteSuffix = truncatedNote;
if (!sections && subjects.length > 0) {
  let rawList = subjects;
  if (rawList.length > MAX_ENTRIES) {
    noteSuffix = `\n_…and ${rawList.length - MAX_ENTRIES} more change(s) not shown here — see the full changelog link below._\n`;
    rawList = rawList.slice(0, MAX_ENTRIES);
  }
  sectionsBody = `### Changes\n\n${rawList.map(subject => `- ${subject}`).join('\n')}`;
}

const body =
  (sectionsBody || '_No user-facing changes recorded since the last release._') +
  noteSuffix +
  `\n\n${compareLink}\n`;

writeFileSync('CHANGELOG_BODY.md', body);

console.log(
  `Release notes generated for v${newVersion} (${matchedCount} matched commit(s), lastTag=${lastTag || '<none>'}).`
);
