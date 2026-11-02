#!/usr/bin/env bash
# Idempotent daily job: turn new language-study notes into carousels and ship them. No paid API calls.
#
#   ./scripts/daily-sync.sh prepare [--lang=..] [--date=..]   # writes the pending file, prints PENDING=<path>
#   (the routine's assistant fills items[].carousel in that file)
#   ./scripts/daily-sync.sh finish [FILE]                     # validate + render + anonymity check + PR/merge
#
# FILE defaults to /workspace/shared/nadoo-language-carousel/pending-carousels.json
set -euo pipefail
cd "$(dirname "$0")/.."
PENDING_DEFAULT=/workspace/shared/nadoo-language-carousel/pending-carousels.json
phase="${1:-}"; shift || true

case "$phase" in
  prepare)
    git checkout -q main
    git pull -q --ff-only
    [ -d node_modules ] || npm ci --silent
    node scripts/sync-notes.mjs --prepare --out="$PENDING_DEFAULT" "$@"
    ;;
  finish)
    file="${1:-$PENDING_DEFAULT}"
    git checkout -q main
    git pull -q --ff-only
    [ -d node_modules ] || npm ci --silent
    node scripts/sync-notes.mjs --apply="$file"
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
    mv "$file" "$file.done-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    echo "Merged $branch — Vercel deploys main automatically."
    ;;
  *)
    echo "usage: $0 prepare [sync-notes args] | finish [pending-file]" >&2
    exit 2
    ;;
esac
