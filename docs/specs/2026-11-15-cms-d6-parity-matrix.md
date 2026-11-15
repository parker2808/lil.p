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

The first all-20 CI run exposed empty initial wrappers for async host blocks.
The host now awaits the outer block renderers before building the tree; the
EN/VI unit regression covers those wrappers. The next exact-head run showed
nested async React children (e.g. fourth statistic, case title, contact fields)
still arrive in streamed HTML patches. The gate therefore checks SSR block
inventory and props hashes plus nonempty initial text where the seeded block
has content, and checks hydrated
preview/public semantic markup; it does not certify full no-JavaScript content.
That narrower SSR claim remains a separate GAP until a no-script browser test
proves all nested content appears without React stream patch scripts.

V03/V14 matrix is **pending exact-head CI and visual review**, not yet PASS.
Four independent shard files publish one real API page per locale/theme test,
with one H1 and four other host types in each page. Splitting each shard into
four retry-isolated cases bounds a stalled tuple to two minutes per attempt
instead of exhausting the 20-minute shard job; CI lists each case as it runs.
Each file checks EN/VI × light/dark ×
neutral/lil.p × 390/768/1440, yielding 24 page tuples and 120 type tuples per
shard, 480 type tuples and 960 attached public/preview block PNGs overall.
Every page tuple checks raw initial HTML block type, props hash and nonempty
text for nonempty fixtures; equal hydrated published/preview block type, props
hash and text; paired block PNGs with at most
0.5% differing pixels (per-channel difference >10), allowing rasterization
noise rather than falsely claiming byte-perfect pixels; and all WCAG
2/2.1/2.2 AA axe violations (including moderate/minor), without waivers. A
per-locale/theme manifest records six tuples (four manifests per shard). The animation-only hero canvas is
excluded from pixel captures; it is not evidence of canvas parity.

The seeded profile has no resume asset: `cv-download` must remain empty on
both initial SSR and hydration. This proves the empty-state contract, **not**
a visible CV download. Admin collection E2E creates education rows before the
matrix; those writes now expire the `education` public fetch tag before
returning, preventing a stale public render versus an uncached draft render.
Block screenshots exclude the fixed site header and locale suggestion overlay
outside the block (as well as the decorative shader canvas); otherwise those
overlays can obscure different scrolled portions of the same long block.
The `notes-browser` host now server-renders a data-backed suspense fallback
with localized links or empty text instead of the textless client-chunk
skeleton; the interactive browser remains split into an on-demand chunk and
the nested no-script stream remains a separate gate. The dark host scopes a
higher-contrast subtle text token for both
neutral and lil.p cards without changing the shared palette or suppressing
axe violations. Navigation transitions may briefly retain an old host; capture
waits for exactly one visible host directly under `#content` instead of using
an arbitrary first match. CI at `774d2aae` found eager notes imports raised public
unique chunk gzip from 90,266 B on `861ada7a` to roughly 147,363 B, over the
102,400 B cap; the split preserves the cap rather than raising it. Exact-head
CI must verify both changes before V03/V14 advance.

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
