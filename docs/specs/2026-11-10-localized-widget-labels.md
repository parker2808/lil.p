# Accessible localized widget labels

## Problem

The EN input in `LocalizedWidget` receives the only visible label. The VI input/textarea has no associated label, and Markdown labels hardcode English language names.

## Plan

1. Add translated full language names in both EN/VI message catalogs.
2. Give each localized input, textarea, and Markdown editor its own language-qualified name.
3. Add an accessibility test for both UI locales and both plain input/textarea widgets.
4. Update the README, `PROJECT_CONTEXT.md` §7/§9 and lessons; refresh Graphify and run `pnpm check:all --e2e`.

## Acceptance and rollback

Each EN/VI field has a distinct accessible name in either UI locale. No saved data or API contract changes. Revert this PR to roll back.
