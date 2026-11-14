# D6 — journey and release evidence manifest template

**DRAFT — template only; all gates BLOCKED until D1–D5 and B7 are integrated and an authorized owner executes them.** This file is not evidence that a command ran, a screenshot was reviewed, or a migration was approved. Instantiate a separate, immutable run record at D6 with actual SHA, baseline, files, outputs and reviewers; never mark a skipped gate PASS. Follow the [V01–V22 verification matrix](./2026-11-10-cms-core-verification-draft.md) after D6; D6 alone does not authorize C1–C3, deployment or merging.

## Run header (fill every field)

| Field                           | Value / evidence link (required before PASS)                                      |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Integrated head and base SHA    | `BLOCKED — record full commit SHAs and PR links`                                  |
| B7, D1–D5 source SHAs           | `BLOCKED — include fixed B7 visual head and D1 empty-publish-policy head`         |
| D2 DDL/rollback-reader approval | `BLOCKED — Parker's explicit decision, migration hash and compatibility evidence` |
| Test environment                | `BLOCKED — Node/pnpm, CI runner, DB isolation, browser/version and date`          |
| Lock owner and time window      | `BLOCKED — one authorized E2E/visual/disposable-DB owner only`                    |
| Reviewers / release decision    | `BLOCKED — functional and visual sign-offs separately; Parker merge/release OK`   |

## Journey steps (one row per mouse and keyboard run)

Each row records `run ID | locale/UI locale/page locale | route/page key | input modality | before revision + raw-data hash | action | expected response/status | after revision + raw-data hash | focus/announcement | test case/artifact | PASS/FAIL/BLOCKED | reviewer`. Duplicate the complete journey for **mouse and keyboard independently**; pointer success cannot stand in for keyboard proof.

| Step | Required transition / invariant                                                                                            | Status / artifact |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| J01  | Empty page adopts tree; no-H1 draft saves, reloads and autosaves; publish rejects incomplete tree without writing.         | `BLOCKED`         |
| J02  | Insert nested section → row/columns or grid → registered content; reject invalid slots/bounds without loss.                | `BLOCKED`         |
| J03  | Keyboard Layers pickup/drop, alternate move, cancel, Delete confirmation and focus restoration match pointer tree order.   | `BLOCKED`         |
| J04  | Edit base/mobile/tablet/desktop props; one-column mobile, inherited/unset values and preview match serialized tree.        | `BLOCKED`         |
| J05  | Undo/redo insert/move/edit/duplicate, retry offline/timeout, save/reload, concurrent 409 and explicit conflict resolution. | `BLOCKED`         |
| J06  | Server rejects unknown/future/deep/oversized/unsafe trees with 400 and unchanged revision/rows/audit/pointer.              | `BLOCKED`         |
| J07  | Authorized publish after H1, single host transaction and pointer/version creation; preview and public SSR agree.           | `BLOCKED`         |
| J08  | Restore both tree and old legacy snapshots, including missing SEO; preserve raw versions, legacy rows and goldens.         | `BLOCKED`         |
| J09  | Unauthorized read/save/publish/restore denied; rollback-read and incompatible binary downgrade are explicitly gated.       | `BLOCKED`         |

Record byte-for-byte or canonical hashes of original/current/future/unknown-field trees and legacy `{ seo, blocks }` before and after read, autosave, publish and restore. An unsupported version/field may reject with typed error or remain lossless; never silently strip. Pair preview/public SSR HTML after normalizing only nondeterministic attributes, and report differences rather than waiving them.

## Commands and owner (replace proposed paths only after they exist)

| Gate / owner             | Exact planned command or evidence                                                                                                                                                                                                                                                                                                                                  | Status    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Pure checks / D6         | `pnpm check:all` (without `--e2e`); `pnpm --filter @parker2808/cms-core test`; `pnpm --filter @parker2808/cms-core-fixture test`                                                                                                                                                                                                                                   | `BLOCKED` |
| API + DB / lock owner    | `pnpm --filter @portfolio/api exec vitest run --config vitest.e2e.config.ts test/cms-golden.e2e-spec.ts test/cms-builder-compat.e2e-spec.ts test/cms-builder-validation.e2e-spec.ts test/cms-builder-auth.e2e-spec.ts test/cms-builder-journey.e2e-spec.ts` (proposed new files must exist first)                                                                  | `BLOCKED` |
| Web/browser / lock owner | `pnpm --filter @portfolio/web exec playwright test cms-builder-journey.spec.ts cms-builder-keyboard.spec.ts cms-builder-properties.spec.ts cms-builder-responsive.spec.ts cms-builder-history.spec.ts cms-builder-autosave.spec.ts cms-builder-ssr-parity.spec.ts cms-builder-a11y.spec.ts cms-builder-bundle.spec.ts cms-builder-visual.spec.ts` (proposed paths) | `BLOCKED` |
| Full gate / lock owner   | `pnpm check:all --e2e` in the approved isolated environment; save CI run URL and test counts.                                                                                                                                                                                                                                                                      | `BLOCKED` |
| Package/bundle / D6      | `node scripts/measure-cms-core.mjs`; production chunk import graph asserts **zero builder/editor bytes** in public JS and retains reviewed 60/35 KiB package caps.                                                                                                                                                                                                 | `BLOCKED` |

Do not run DB, Docker, E2E, Playwright, visual captures, browsers/servers or take the shared lock from this docs-only branch. The future owner must verify each command's actual script/file and link logs; the existing B7 screenshot capture command is `FIXTURE_CAPTURE=1 pnpm --filter @parker2808/cms-core-fixture test:e2e` and is **lock-only**. Existing B1 `apps/api/test/cms-golden.e2e-spec.ts` assertions stay unchanged.

## Capture matrix and design review

For **every starter component and composed page/state** record `route | component/state | page locale | UI locale | theme | brand | viewport | input | screenshot path | source SHA | manifest SHA | reviewer | result | finding/fix/recapture links`. Minimum Cartesian product: **EN/VI × light/dark × 1440/390** for neutral core and token-only lil.p branding; add tablet (pin actual width, e.g. 768) for breakpoint override, mobile sheets, focus and reduced-motion. Required states: empty canvas, nested tree, palette/Layers/Properties, selected/disabled/error/unknown, invalid drop, conflict/retry/undone, unsaved/saving/saved, preview and public published/restored page. Store focus screenshots and paired preview/public images with the same run ID. Inspect typographic hierarchy, spacing, responsive clipping, VI wrapping, usable hierarchy and visual polish; compare U3's static reference without claiming it is functional evidence. Record each WCAG AA axe run **and computed text/surface/focus/feedback contrast pairs**, tab/focus order, screen-reader names/announcements, 44px targets and reduced-motion behavior. An axe pass alone or screenshot alone cannot prove all of these.

| Matrix / status                            | EN light 1440 | EN light 390 | EN dark 1440 | EN dark 390 | VI light 1440 | VI light 390 | VI dark 1440 | VI dark 390 | Tablet  |
| ------------------------------------------ | ------------- | ------------ | ------------ | ----------- | ------------- | ------------ | ------------ | ----------- | ------- |
| Neutral components and composed pages      | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED |
| Token-only branded components and pages    | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED |
| Builder keyboard, mobile sheets and states | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED |
| Preview ↔ SSR/public paired captures       | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED       | BLOCKED      | BLOCKED      | BLOCKED     | BLOCKED |

## Verdict and rollback

Copy V01–V22 from the verification matrix into the actual run and mark each `PASS | FAIL | BLOCKED`, with exact command, assertion count, CI URL and reviewer. Gate outcome is **BLOCKED** if any required file/test/capture/contrast pair is absent, skipped or stale, even when other CI checks pass. Log P0–P3 findings, fix SHA, recapture SHA and reviewer acceptance before changing a FAIL to PASS. Record old-row migration counts and rollback-read plan before release; rollback only UI/feature flag while retaining drafts, immutable versions and a compatible reader. Parker separately approves D2 DDL, each merge and any later private extraction; no production DDL or deployment is authorized by this manifest.
