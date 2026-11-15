# V19 public-bundle guard (D6 stacked PR)

**Scope:** build/CI-only guard for production public `(site)` routes. No runtime,
API, golden-contract, builder, migration or deployment change.

The baseline comes from the `e2e-build` artifact of successful CI run
`43678209402` at D6 feature head `4c4780a903f879f30d7f092640cdd1e7cd118059`:
10 public `page_client-reference-manifest.js` files reference 15 unique JavaScript
chunks totaling **90,291 B gzip** (Node 22 `gzipSync`, shared chunks counted once).
The published-tree catch-all references 13 of those chunks (85,673 B gzip).
The cap is **102,400 B gzip** (100 KiB; 12,109 B headroom). Do not substitute
the package-local core gzip measurement for this public route measurement.

`scripts/check-public-builder-bytes.mjs` retains the mandatory public catch-all
and inspects all public `(site)` route manifests and their referenced production
JS chunks. It rejects builder/editor/client core references in either module IDs
or emitted bytes, missing or unexpected chunks, and total unique gzip size above
the cap. The published-tree `[...rest]` route is required by its exact manifest
path; its referenced chunks and gzip bytes are reported separately, and those
same chunks are scanned for forbidden bytes. Only the separately gated
`r3-loading-test` browser fixture is excluded;
the production error route remains in scope. Its focused tests check shared-chunk
deduplication, the cap, leak rejection and required catch-all. This script is
not a real API/browser test, nor a replacement for SSR or deployed-asset review.

The CI `build` job checks out the exact PR head, builds the production web app,
runs the focused guard tests, then writes an artifact named
`public-bundle-<head SHA>` containing source/checkout SHAs, the route-to-chunk
graph, each chunk's gzip bytes, the baseline and the cap. A job summary records
the same SHAs and totals, including the published-tree subset. V19 remains OPEN
until the stacked PR's exact-head CI artifact verifies that route and its bytes;
the combined-head rerun and production deployment parity remain separate gates.

### Post-deploy parity design (not a deployment or PASS)

The report now includes SHA-256 of the **uncompressed emitted bytes** of every
public client chunk. After an authorized deployment of **the same source SHA**,
download the `public-bundle-<source SHA>` CI artifact and run
`node scripts/check-deployed-public-assets.mjs <public-bundle-report.json> <https-deployment-url>`.
The verifier fetches every recorded asset at the specified HTTPS origin, rejects
non-200 responses, mismatched source/checkout SHAs, missing route or catch-all
references, malformed paths and mismatched bytes. The same cap and forbidden
module checks remain in the build job; deployed-byte parity does not replace
them. Attach the command output, deployment ID/SHA and artifact/run ID to the
final V19 review. A live CDN check is **BLOCKED** until deployment is authorized;
the offline fixture tests only prove the verifier's fail-closed behavior.
