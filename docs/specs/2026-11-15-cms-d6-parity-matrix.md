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

The initial all-20 CI run exposed incomplete no-JavaScript HTML for async host
blocks: the tree renderer left their content in streamed React patches, unlike
the existing legacy block path. The host now resolves those block components
before producing the tree HTML. A unit regression covers EN/VI initial markup;
the four real-route shards must still pass on the corrected exact head before
any visual/SSR tuple is marked passed.

V03/V14 matrix is **pending exact-head CI and visual review**, not yet PASS.
Four independent shard files publish one real API page apiece, with one H1 and
four other host types in each page. Each file checks EN/VI × light/dark ×
neutral/lil.p × 390/768/1440, yielding 24 page tuples and 120 type tuples per
shard, 480 type tuples and 960 attached public/preview block PNGs overall.
Every page tuple checks raw server-rendered block type, props hash and visible
text against hydrated DOM, equal published/preview hydrated markup and paired
block screenshot bytes, and full WCAG 2/2.1/2.2 AA axe violations (including
moderate/minor), without waivers. A per-shard manifest records each tuple.
The animation-only hero canvas is excluded from pixel captures while its
semantic content remains in the SSR/hydration comparison.

The published route serves explicit lil.p host tokens. The **neutral fixture is
the same real published/preview host page with its root `data-brand` switched
in the browser**, reusing the real neutral core CSS, not a separate neutral
server/host deployment; dark is selected by next-themes and marked on the host
root for core tokens. Consequently neutral SSR brand selection, separate
tenant-host integration, and manual approval of visual artifacts remain GAP;
the suite cannot claim a distinct neutral published host or pixel design
approval from its pairwise equality alone. Four shards are pinned in
`shards.ts`, each under the existing 20-minute CI budget; if they exceed the
budget, the matrix stays GAP rather than weakening the gate.
