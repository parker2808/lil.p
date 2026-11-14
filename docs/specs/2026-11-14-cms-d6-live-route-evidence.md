# D6 live host-route evidence — partial release manifest

This instantiates `docs/specs/2026-11-11-cms-d6-evidence-manifest-template.md` from `docs/cms-prep-nonE2E` for the guarded API/Next route gate only. It does **not** certify the D4/D5 editor, migration, accessibility matrix or release. This record stays self-contained until that branch is integrated.

## Run header

| Field                     | Recorded evidence                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| D6 code and evidence head | `bb316abc83783e1068fb56b9c15be8552e124de3` before this manifest; Graphify source `1ed8cbfe`                                            |
| Stacked base              | `feat/cms-d-base` at `3bbd1b23397862c759d9fc49be3e39e586c6cd41`                                                                        |
| Included source           | D2 `0762e12`, D3 `0d2b94a`, D5 pure `c8fc833`; D4 UI and D5 UI are **not integrated**                                                  |
| Environment               | 2026-11-14 ICT, Node `22.21.1`, pnpm `10.34.9`, macOS Chromium via Playwright `1.64.1`, fresh disposable tmpfs MySQL 8.4 container     |
| Isolation                 | `cms-d6` held `~/.t3/locks/lilp-e2e.lock` for each run and released it immediately; no shared/production database or persistent volume |
| Approval                  | D2 DDL/rollback-reader approval, visual sign-off, merge and deploy remain **BLOCKED** pending Parker                                   |

## Executed gates

| Gate                      | Evidence                                                                                                                                                                                  | Result                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Focused live host browser | `apps/web/e2e/cms-tree-host-blocks.spec.ts`: 20 definition publish cycles, 40 EN/VI public/authenticated preview pairs, real Next host mounts, ordered node IDs and resolved-props hashes | **PASS 1/1** on disposable MySQL                                            |
| First full gate           | `bash scripts/r3-12-e2e-gate.sh` → `pnpm check:all --e2e`; API, D6 web cases and fixture passed; existing `admin-scroll.spec.ts` exact scroll pixel differed by 14 (`1572` vs `1586`)     | **FAIL 12/13**; 182 web cases passed, 14 skipped; no unrelated code changed |
| Fresh full retry          | Same command and source, new isolated container; format, lint, typecheck, unit, content, deps, build, public bytes, theme/tree browser, API E2E, web E2E and fixture E2E                  | **PASS 13/13**; web 383 s, API 68 s, fixture 38 s                           |
| PR CI                     | [#202 run 43616525119](https://github.com/parker2808/lil.p/actions/runs/43616525119), launched for `bb316ab`                                                                              | Verify final result before approval; no CI-green claim in this record       |

The HTTP parity assertion compares identical published tree and SEO payloads in EN and VI (excluding only the admin `invalidBlocks: []`). Next assertions compare ordered tree structure and a SHA-256 fingerprint of localized effective props for each mounted host component. Dynamic post/project collections can legitimately differ under draft mode, so their HTML is not compared byte-for-byte. `scripts/check-public-builder-bytes.mjs` passes with zero builder/editor bytes in public chunks. B1 goldens and legacy routes are unchanged.

## Release status

| Template scope                                                                                                                         | Status                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| J07 guarded host publish and preview/public SSR for each registered definition                                                         | **PASS for route-level evidence only**                                                    |
| J01–J06, J08–J09 complete mouse and keyboard journey, including client autosave, unknown/future data, restore and authorization matrix | **BLOCKED as a combined release gate**; isolated API/route tests do not substitute for it |
| D4+D5 UI integration, dirty-reload confirmation/export and full 20-definition editor interaction                                       | **BLOCKED**; current D6 branch has pure D5 helpers, not D5 UI                             |
| EN/VI × light/dark × 1440/768/390 screenshots, focus/axe/contrast and reduced-motion review                                            | **BLOCKED**; this run did not capture or review that matrix                               |
| D2 migration deployment/rollback-reader review, V01–V22, release and merge                                                             | **BLOCKED**; no deployment or merge authorized                                            |

Next gate: integrate accepted D4 `9e458a2` and the reviewed D5 UI head after its own green gate, then run real custom-page edit → interrupted save/reload → explicit recovery/export → publish → public/preview parity in EN/VI, followed by the complete visual/a11y matrix. Keep this separate from the passing route-level gate. Roll back route exposure by disabling `CMS_TREE_ROUTES`; retain drafts and immutable versions for a compatible reader.
