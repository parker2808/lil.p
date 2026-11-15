# D6 parity matrix: isolated verification slice

Base: `feat/cms-d6-verify` (#202). Draft stacked branch:
`test/cms-d6-parity-matrix`. No production database or deployment access.

1. V04: `tree-parity-roundtrip.test.mjs` checks nested page/section/row/column/grid
   migrator output, canonical serialized no-loss reverse projection, repeat migration,
   unknown fields at each nested slot, and opt-in unknown host-block payload retention.
2. V06/V09: `cms-d6-parity-matrix.spec.ts` creates a real authenticated custom
   page, saves and publishes serialized base/mobile/tablet/desktop overrides,
   verifies API version data, and compares public vs version-preview SSR and
   hydrated `main.cms-core` markup plus attached screenshot bytes for EN/VI at
   390/768/1440. It checks visible responsive copy, not only hidden variant markup.
3. V10: the same browser spec drives legacy UI publish → version history →
   restore → republish with SSR/read snapshots. Existing tree API publish/restore
   tests remain separate; builder tree UI publish is disabled by design, so the
   complete tree UI journey is **not passed** by this work.
4. V17: `cms-d6-parity-contract.e2e-spec.ts` checks old/new GET route inventory,
   historical legacy raw JSON bytes, immutable rows, semantic snapshots and
   historical VI preview across a real tree publish on disposable MySQL.

CI must run Node 22 checks and `ready-e2e` API + four browser shards on the
exact PR head; attachments are generated in the Playwright report, not a
committed platform-specific pixel baseline. This slice does not close J06/J08,
V11/V12/V21/V22, all-20 editor-origin, design review or rollout gates.

V03/V14 **remain GAP**. The new bounded real-API host test publishes four pages:
one page with a single H1 block and all 16 non-H1 host blocks, plus one page
for each remaining H1 type. For every type it compares public/version-preview
SSR and hydrated DOM and attaches block-level screenshot pairs at **EN/VI ×
1440 × computed light** (40 type/locale pairs, 80 PNGs), with ten public and
ten paired preview page-level WCAG axe reports. CI attachments are evidence only after the exact-head shard
passes; they are not a manually reviewed pixel baseline. The earlier heading
and paragraph test adds EN/VI × 390/768/1440 default-host screenshot pairs.

Uncovered tuples: **all 20 types** at 390/768 and dark on the published host
(except heading/paragraph at 390/768 in the earlier test); **all 20 types** at
EN/VI × light/dark × 390/768/1440 in the separate neutral fixture; and the
explicit lil.p brand-token variant across every type/locale/theme/width. The
public `BlocksPage` currently renders `main.cms-core` with no selectable
`data-brand`, so a host-default light screenshot cannot prove either branded
variant. The full cartesian gate remains open pending visual-owner scope and
review; 20 types × 2 locales × 2 themes × 3 widths × 2 routes = 480 route/type
captures per host, 960 for two distinct hosts. No mock or unmounted fixture is
claimed as a published route.
