# Portfolio notes — Particula (particula-fe)

Source: analysis of `/Users/parker/Desktop/web/kobizo/particula/particula-fe` on 2026-10-19.
Company: Kobizo. Product: Particula — rating & analytics platform for tokenized real-world assets (RWA) / digital assets (tokens, issuers, assets, providers, blockchains). Clients incl. white-label deployments (branches `moodys`, `polygon`).

## Facts (verified via git)

- Role: Frontend Developer, Jul 2024 – Dec 2025 (accounts: "Parker Vu" 300, hungvv2808 95, parker2808 21 commits on main ⇒ ~416/1,791 commits, top contributor).
- Repo: Nuxt 3 + Vue 3 + TypeScript, ~2,900 files / ~171k LOC in `src/v2` (30 feature modules), 1,055 Vue components.
- Stack: Nuxt 3 (hybrid SSR/SPA), Vue 3 `<script setup>`, TypeScript, Pinia (+persisted state), TanStack Vue Query, Axios, PrimeVue 4 + Tailwind (CSS layers), Tiptap (+ Pro AI extension), Chart.js (zoom/annotation/gradient/treemap + custom plugins), interactjs, vuedraggable, vee-validate + yup, jose (JWT RS256), Laravel Echo/Reverb, Storybook 8, Vitest, i18n EN/DE, AWS Amplify.

## Highlights authored by Parker

1. Led v1 → v2 architecture migration: PAR-2371 (2,003 files, −42.5k LOC; legacy `src/module` 1,313 files/70 modules → 266 files/11) + PAR-1977 (2,073 files, 40 → 23 modules, unified conventions). Wrote `STRUCTURE.md` (module layout, file-suffix conventions, scaffold command).
2. Report Generation Config (RGC) for AI-generated rating reports — owner (8/10 commits, ~5.5k LOC): custom Tiptap inline placeholder node `{{key}}` + bidirectional text⇄JSON parser; drag-and-drop section tree (vuedraggable, same-level groups, auto expand/restore); section × attribute-group assignment table with diff-only payload; unsaved-changes guard (beforeunload + route guard); URL-synced node selection.
3. Report Project Management (RPM): recursive document folder tree engine (path/breadcrumb in single traversal, auto-expand, folder filter); upload rules per folder type (ZIP ≤50MB for smart-contract folders, docs ≤100MB, XLS/XLSX/DOCX/MD/JSON); recursive file counts; confirm-before-close modal system (rewrote global modal Pinia store + `useFormDirtyData` deep-compare).
4. Rating module (top contributor, 39 commits): rating frameworks / rating script extension (per-attribute toggles rating/red-flag/transparency × pre/post-issuance); red-flag threshold editor with range validation (sorted single-pass overlap detection, ∞ end); manual grade override + audit log (shown in ~15 places); rating history.
5. Custom Alerts (PAR-2930, 41 files, +1.7k): alert rules on token/issuer/asset attributes, threshold/red-flag triggers, in-platform/email/hybrid notifications, infinite-scroll attribute picker.
6. Financial Statement module (sole author): key metrics, revenue vs expenses, fees vs supply-side, expense breakdown; period-aware chart granularity; multi-table CSV export via Blob.
7. Blockchain Ecosystem page & comparison: metric aggregation (sum/avg/last-non-empty over date series), time frames 7D→ALL, universal blockchain popup, compare-by-chain modal.
8. Admin AI Hub: transaction-volume anomaly list/detail — dual-query aligned time-series chart (volume line + anomaly points + zoom range selector), approve/reject with required comment; AI analysis of token T&C (AI vs final result, apply to tokens).
9. Basket Composition: XLSX template download → CSV/XLS/XLSX import with overwrite confirm; refactored 541-line component into composable + helper + 4 subcomponents; live allocation % banner.
10. Performance: rolled out 1-hour `staleTime` caching across 52 queries/stores (PAR-1508) on top of SSR dehydrate/hydrate.
11. Tiptap: refactored slash-only menu into generic `CommandsExtension(name, char)` factory (`/` and `#` triggers, per-trigger ProseMirror plugin key); editor theme persistence.
12. Security: server-side RS256 demo-token verification (jose) for restricted-access demo/white-label portals (public key kept in private runtime config).
13. Correctness fixes: top-holders "Others" scaling + divide-by-zero guard; market-share doughnut clamp (>100% bug); dedupe blockchains/exchanges/custodians.
14. Mobile: mobile navbar/footer/dashboard pages; QA: Playwright env + login spec + stress test (kept outside repo), `data-test` hooks across key flows.

## NOT Parker's (don't claim)

- Websocket layer (Laravel Echo/Reverb) — Tim Vu. Squarified treemap algorithm — Finn (Parker: font-size fix). Schema grid builder original — Finn (Parker: 24/39 later commits). Amplify config, branch-sync workflow, specific-token middleware — teammates.
- Zip is NOT unzipped client-side; anomaly detection & AI generation run on backend.
