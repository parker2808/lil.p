#!/usr/bin/env bash
# Requires PROJECT_CONTEXT.md at HEAD and an update for changes outside docs/.
set -euo pipefail
if ! git cat-file -e "$2:PROJECT_CONTEXT.md" 2>/dev/null; then
  echo "::error::PROJECT_CONTEXT.md is missing at HEAD; restore it."
  exit 1
fi
files=$(git diff --name-only "$1...$2")
echo "Changed files:"; echo "$files"
if echo "$files" | grep -qx 'PROJECT_CONTEXT.md'; then echo "OK: PROJECT_CONTEXT.md updated."; exit 0; fi
outside=$(echo "$files" | grep -v '^docs/' | grep -v '^$' || true)
if [ -z "$outside" ]; then echo "OK: only docs/ changed."; exit 0; fi
echo "::error::This PR changes files outside docs/ but not PROJECT_CONTEXT.md. Update Open items (§7) and Changelog (§9), or add the 'skip-context' label."
exit 1
