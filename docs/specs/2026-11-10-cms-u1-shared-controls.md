# CMS U1 — shared controls

Base: U0 PR #175 (`c5ac5ab`), stacked for review; ADR PR #172 is the approved working plan. Scope: shadcn-derived `packages/ui` primitives and their existing public/admin consumers. No API, database, or deployment changes.

## Plan

1. Regenerate Graphify before touching code; review U0 route/control inventory and screenshots.
2. Establish orange/green light/dark focus, disabled, invalid and checked styling in the shared primitives.
3. Add the free Radix/shadcn RadioGroup; migrate layout, surface and hue single-choice controls.
4. Keep ToggleGroup for actionable density, dashboard range and editor formatting toggles; retain DropdownMenuRadioGroup for theme choices in a menu.
5. Replace native select consumers in contact, create-page, audit and desktop locale with shared Select, preserving controlled values, form submission and labels.
6. Fold A3/#173 localized EN/VI editor labels into this branch, without merging its draft PR.
7. Add unit/a11y interaction tests, then compare U0 and U1 browser images at 1440/390, both locales and themes; record intentional differences and outstanding findings.
8. Update README, changelog (§9), context §7, LESSONS and Graphify; run guarded `check:all --e2e` and report CI.

## Acceptance

- Every migrated choice has the correct accessible role/name/state, focus return and keyboard selection. Form topics submit their actual value; empty filters reset to the unfiltered state. True radio choices cannot toggle themselves off.
- Checkbox (including indeterminate), Switch and DropdownMenu share keyboard-visible focus, readable states and 44px pointer targets. No route changes, server behavior changes or undocumented shortcuts.
- EN/VI localized widget fields have separate names. The U0 baseline's before/after screenshots, responsive layout, visual findings, WCAG AA contrast and 44px checks are reported honestly; only Linux Chromium can update tracked pixel baselines.
- A3/#173 stays draft. Rollback: revert this PR and restore the existing selects/controls; U0 tests and manifest remain intact.

## Control decisions

| Control                      | Context                                                                                                                      | Decision                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RadioGroup                   | Block layout, surface, and hue                                                                                               | Exclusive choice, never toggles off; group names come from localized field labels.                                                                    |
| ToggleGroup                  | Table density, dashboard range, editor formatting                                                                            | The first two are actionable view switches; formatting marks are independent toggles. Preserve their existing behavior.                               |
| DropdownMenuRadioGroup       | Theme menu                                                                                                                   | Exclusive choice within a menu; preserve focus return.                                                                                                |
| Select                       | Contact topic, create-page language/template, audit entity/user, desktop admin locale; existing site settings and navigation | Use the shared styled trigger and a portal above dialogs; keep contact's form name and empty-topic handling and audit's clear-all value.              |
| Checkbox/Switch/DropdownMenu | All existing shared consumers in U0 inventory                                                                                | Provide 44px pointer regions, checked/indeterminate, hover, disabled, invalid and focus states in the primitives, without changing mutation behavior. |

## Verification record

- U0 before: `docs/audits/2026-11-10-cms-u0-screenshot-manifest.json` (336 reviewed local Mac images; not Linux baselines). U1 after: `U0_CAPTURE_DIR="$HOME/Desktop/lilp-u1-capture-20261110-reviewed" U0_CAPTURE_BASELINE=feat/cms-u1-shared-controls R3_E2E_STATES=1 env -u DATABASE_URL -u DATABASE_URL_TEST bash scripts/r3-12-e2e-gate.sh u0-capture.spec.ts` passed 1/1 on disposable MySQL. The 336 U1 PNGs remain outside git; their hashes, keys and excluded cases are recorded in `docs/audits/2026-11-10-cms-u1-screenshot-manifest.json`. `node scripts/compare-cms-captures.mjs <U0 local manifest> <U1 local manifest>` verifies file hashes: 336 keys match, 229 image hashes changed, 107 unchanged. Hash difference is **not** a visual regression verdict: seeded records, time and dynamic content vary. Spot review covered mobile EN contact (select +12px height), mobile VI dark audit (styled filters), mobile VI Pages and desktop EN dark Site; no overlap or clipping in these samples. Do not commit Mac pixels as Linux baselines.
- On disposable MySQL, `pnpm check:all --e2e` passed **9/9** gates (format, lint, typecheck, unit, content, deps, build, API E2E, web E2E). Focused admin table/contact rerun passed **3/3**. The two changed computed-style snapshots raise table headers to 48.8906px because select-all checkboxes now have 44px hit areas. The first full run failed a stale 32px Topbar expectation, an early form-hydration interaction and these snapshots; all were corrected before the green run. A concurrent obsolete gate caused a transient port collision on a separate discarded run.
- Linux Chromium (`R3_VISUAL_UPDATE=1` guarded gate) regenerated 11 tracked images across 14 visual tests and passed **14/14**. Contact and the admin header reflect U1 controls; About/Notes also picked up seeded fixture drift unrelated to U1. A second guarded run with `R3_VISUAL_UPDATE=1 VISUAL_VERIFY=1` compared pixels without updates and passed **14/14**.
- Findings → fixes: native contact/audit select appearance and 32px hit area → shared 44px styled Select; create-page popup hidden under dialog → Select portal above modal; checkbox-selected table rows raised header height → intentional approved-style snapshot updates; early contact form input reset on hydration → wait for interactive Select before filling in E2E; a quick arrow key release moved Radix radio focus without selection → shared RadioGroup selects the focused unchecked item after roving focus (unit and real-browser keyboard tests); U0 public VI toast overlap remains pre-existing and outside U1. Unchanged tests do not prove all 43 routes meet AA; axe contrast and touch-target checks cover the sampled controls in the EN/VI, 1440/390, light/dark U1 Playwright matrix.
- Graphify ran before coding and again after the changes; it still omits CSS semantics and warns that 21 SQL files lack the optional parser and 192 code files yield no symbols. Control labels and these docs were checked directly, not inferred from graph edges.
