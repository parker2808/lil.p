# V03/V14 all-20 real-host SSR verification

Stacked draft into `feat/cms-d6-verify`; no production request or schema change.
This closes the intersection missing from #256's nested CTA sample and #260's
responsive override sample: use the registered block defaults as the fixture,
one H1 and four other types in each of four groups, with a real disposable API
page and immutable published version. The optional CV host receives an actual
local in-memory media upload linked to the demo profile; restore the profile and
delete the upload after the test. No mocked public endpoints or synthetic brand
attribute changes are permitted.
The first H1 host has an explicit EN/VI localized visible label; the remaining
hosts reuse registry defaults, which do not certify full translation coverage.

Each group tests EN/VI × light/dark × 390/768/1440 × actual neutral/lil.p Host
header × public/version preview, with JavaScript disabled. The matrix
is split into one bounded test per group/locale/theme/viewport after CI
`43769497764` showed a four-minute timeout per 12-tuple test and two shards
exceeded their 20-minute job budget. Twelve registered specs distribute the
three viewport slices of each group across five CI shards; each test still
captures both brands and both public/preview modes, with exactly four manifest
tuples. Diagnostic phase markers identify slow navigation or rendering without
changing assertions or performance budgets. The response HTML must contain
the server-selected brand; each of five host wrappers must have
an SSR props hash, visible painted text, and matching published/preview hash.
Record a raw full-page PNG and five raw host PNGs for every tuple; compare
paired public/preview host pixels without relaxing the existing 0.5% threshold.
CI `43773289505` exposed a Chromium full-page Playwright screenshot stall at
the first no-JS capture on every shard, before any image attachment. Capture
the same full content rectangle directly through Chromium's screenshot protocol
and assert the PNG's width and height match measured layout dimensions. Keep a
bounded height assertion to fail visibly on pathological layouts rather than
silently timing out, while retaining all host crops and parity checks.
CI `43777125938` still timed out in the capture phase after the CDP change;
the first neutral/public 768px screenshot produced no artifact. Emit distinct
font, CDP session, measured-layout, screenshot, attachment, crop and axe phase
markers on the next exact-head run to identify the blocked operation before
changing the capture implementation or attributing the failure to rendering.
Check the neutral/brand accent at first paint and run unwaived WCAG A/AA axe
against the content (including minor/moderate violations). Attach all JSON
results and screenshot SHA-256 values to a provenance manifest. The preview
banner remains in the raw full-page PNG; only its chrome is hidden when
comparing the equivalent host crop.

The fixture reuses the actual block defaults and shared parity pixel comparator.
It does not imply arbitrary merchant content or external production deployment
is visually certified. V03/V14 remain GAP until exact-head five-shard CI is
green and an independent reviewer inspects raw captures for meaningfully
painted content, responsive layout and neutral/brand distinction.
