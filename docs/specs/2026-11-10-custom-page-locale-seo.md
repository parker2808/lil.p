# Custom-page VI-only SEO fallback

Status: proposed · base `origin/main` (`d0d474b`) · no migrations.

## Plan

1. Reproduce VI-only custom-page published SEO failure with a focused test.
2. Reuse the existing custom-page preview fallback for published snapshots.
3. Assert EN/VI, built-in and bilingual behavior without changing unrelated responses.
4. Refresh Graphify, README, context §7/§9 and lessons.
5. Run focused checks and guarded disposable-MySQL E2E, then draft PR and CI.

## Contract and acceptance

A custom page created in VI with no English SEO title must return its Vietnamese SEO title and `lang: vi` on both public reads and version previews, including requests for EN, matching its existing draft-preview fallback. The description follows the same VI-only group. Built-in pages and custom pages with an English SEO title keep the existing `pickGroup` behavior, including English fallback when a translated group is incomplete. Block localization and raw snapshot values remain unchanged.

The only intentional golden change is the B1 `KNOWN BUG` case (`docs/specs/2026-11-10-cms-b1-golden-http.md`, on the separate B1 branch): for the VI-only custom page, `seo.title: null, seo.lang: en` becomes `seo.title: <VI title>, seo.lang: vi`. B1's owner should update that one expectation when stacking this fix; no other golden changes are intended. No schema or API shape changes.

## Verification

- Before the fix, four new EN/VI public/version-preview assertions failed with `title: null, lang: en`; afterward, all 34 focused tests passed (including built-in and bilingual fallback assertions).
- `graphify update .` refreshed the code graph from main; it cannot classify 21 migration SQL files without `tree_sitter_sql` and does not substitute for this manual spec/README review.
- `pnpm check:all` passed 7/7; guarded `scripts/r3-12-e2e-gate.sh` ran `pnpm check:all --e2e` with a disposable tmpfs MySQL and passed 9/9, including API and web E2E. No production resources were used.
