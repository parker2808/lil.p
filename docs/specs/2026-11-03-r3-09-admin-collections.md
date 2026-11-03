# R3-09: Admin collections

## Scope

Update real admin list routes for projects, posts, pages, experience, education, skills, tags, principles, process, users, inbox, domains and media. Keep existing API mutations, URL filters and navigation. Leave standalone and nested editors to PR 10.

## Acceptance

- Education cards use handle, index, clamped title and description, one-line visibility pill and actions. The header handle is centered, controls have 44px targets, and the second card fits at 390px.
- Media tiles have padded art/glyph with concentric radii. Inbox heading/count and detail back link align.
- Real EN/VI collection routes support keyboard focus, filters, actions, inbox status, education reorder and media controls in light/dark at 1440/390.
- Capture reachable route states only after passing assertions; record each tuple in a manifest and overwrite corresponding admin Desktop PNGs.

## Verification

Run focused component tests and production-build Playwright flows for lists, inbox, education and media. Measure layout and target geometry. Run `pnpm check:all`, update Graphify report, README, project context and lessons. No persistent database or deployment.
