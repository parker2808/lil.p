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
header × public/version preview, with JavaScript disabled. The response HTML
must contain the server-selected brand; each of five host wrappers must have
an SSR props hash, visible painted text, and matching published/preview hash.
Record a raw full-page PNG and five raw host PNGs for every tuple; compare
paired public/preview host pixels without relaxing the existing 0.5% threshold.
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
