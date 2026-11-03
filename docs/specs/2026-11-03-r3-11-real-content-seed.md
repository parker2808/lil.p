# R3-11 — Real content seed

## Scope

- Read owner CV, company, project, education, and image evidence at seed time from an environment-provided private location. Keep that location and its contents outside git and logs.
- Map verified EN/VI content to exactly ten projects, experience, education, and hero stats. Keep the existing content migration unchanged.
- Research each cover from existing screenshots, public live sites, and public repositories; use a verified image or a clearly illustrative orange/green cosmic cover. Publish no private content or contact details.
- Update seed transformation/validation code and safe assets only. Add SQL only if the approved structure requires it.

## Acceptance

- Every factual claim and image choice traces to source evidence; no project is dropped and no placeholder, invented metric, or generic sample text is published.
- Covers exist for all ten projects, with real/illustrative provenance and private information removed.
- The screenshot is sourced from the public `parker2808/interview-senior-fe` README. Its development toolbar is visible; it is presented as a real project screenshot. The other nine assets are original illustrations, including the public repository fallback project, and do not depict product UI.
- Seed fails closed when source evidence is absent or invalid, is idempotent, and preserves unrelated CMS edits. Contact values remain masked.
- A separate GPT2 strict review finds no unresolved source or image discrepancy.

## Verification

- Focused source validation, image safety, missing-source, ten-project, and idempotence tests.
- The guarded script runs `SEED_PROFILE=real` twice after the migration checks and compares stable row snapshots; source data is never printed.
- An independent strict source and image review completed with no unresolved discrepancies after inherited metrics, role qualifiers, and employer links were corrected.
- Run `env -u DATABASE_URL bash apps/api/prisma/seed/migration-gate.sh` for the staged pre-PR2 → current SQL gate on a guarded random tmpfs MySQL container; compare five built-in page rows, schema constraints, and Prisma drift. The script destroys temporary resources on exit and refuses an inherited `DATABASE_URL`.
- `pnpm check:all`; update Graphify report, README, PROJECT_CONTEXT §§7/9, and one lesson.
