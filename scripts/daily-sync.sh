#!/usr/bin/env bash
# Idempotent daily job: turn new language-study notes into carousels and ship them.
# Safe to run any number of times — if no new notes exist it changes nothing and exits 0.
set -euo pipefail
cd "$(dirname "$0")/.."

git checkout -q main
git pull -q --ff-only
[ -d node_modules ] || npm ci --silent

node scripts/sync-notes.mjs "$@"
node scripts/check-anonymity.mjs

if [ -z "$(git status --porcelain -- content)" ]; then
  echo "No new carousels. Done."
  exit 0
fi

branch="carousel/notes-$(date +%Y%m%d-%H%M%S)"
git checkout -q -b "$branch"
git add content
git commit -q -m "carousel: add language notes $(date +%F)"
git push -q -u origin "$branch"
gh pr create --fill --base main
gh pr merge --squash --delete-branch
git checkout -q main
git pull -q --ff-only
echo "Merged $branch — Vercel deploys main automatically."
