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

V03/V14 **remain GAP**: the paired screenshots cover only heading + paragraph
in the lil.p host under its default theme. There are no paired screenshots or
axe results for the other 18 host types, either theme-specific light/dark tuple
for any of the 20 types, or any neutral-fixture tuple. Their complete matrix
would require 20 types × 2 locales × 2 themes × 3 widths × 2 routes = 480
route captures per host (960 across the two hosts); these are not implied by
the 12 screenshots in this focused CI slice. Existing all-20 host API/DOM
checks remain independent evidence, not a visual or design acceptance.
