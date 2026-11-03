# R3-10 — Admin editors and settings

## Scope

Finish real project, post, page, experience, profile, and site editor routes and their loading states. Preserve API-backed saves, Tiptap, block editing, preview, publish, version history, and settings. Standalone experience routes use `/admin/experience/new` and `/admin/experience/[id]`.

## Acceptance

- Custom page drafts can save and preview. Publish rejects missing substantive visible body copy in the page locale, including untouched, hidden, and deleted starter prose; valid H1 and real copy permit publishing.
- The stable `PAGE_BODY_REQUIRED` code and `body` path render as an inline linked message in the admin UI locale, independently of the page locale. Vietnamese UI never displays the API's raw English validation message.
- Project, post, page, experience, profile, and site actions retain accessible validation, save, preview, publish, and confirmation behavior.
- Real route/state screenshots at 1440 and 390, EN/VI and light/dark, are bound to passing production-build assertions and recorded in a manifest.

## Checks

Focused unit and production-build Playwright tests for all editor families, including four UI/page locale combinations, keyboard and focus states, standalone experience create/edit errors, and destructive confirmations. Run `pnpm check:all` and update the Graphify report.

## Verification

- `pnpm check:all`: seven gates passed. Focused editor unit tests: 8/8 passed. Production-build editor Playwright: 10/10 passed on a guarded, no-volume disposable MySQL container.
- Ten admin route/state manifests map to 376 unique, present PNGs in `~/Desktop/lilp-admin-demo-20261102/`; each covers an asserted EN/VI, light/dark, 1440/390 state. The final cross-PR route/state audit belongs to PR 12.
