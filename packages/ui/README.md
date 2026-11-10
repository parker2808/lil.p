# Shared UI (`@portfolio/ui`)

Host-owned shadcn/Radix controls, design tokens, and admin table chrome for the lil.p public site and CMS. This is **not** a standalone CMS builder or a generic headless UI package.

- Import primitives by their exported subpaths, for example `@portfolio/ui/components/ui/button`, `@portfolio/ui/components/ui/select`, and `@portfolio/ui/components/ui/radio-group`. Shared Select, RadioGroup, Checkbox, Switch and menus have consistent keyboard/focus/disabled states and 44px interactive targets. Exclusive choices use RadioGroup; density, ranges and editor formatting keep ToggleGroup.
- `AdminTable` supplies the host's link-row/search/sort/status presentation; `DataTable` owns selection, keyboard row actions, density, confirmation and help. Provide translated labels and route/mutation handlers from the web host. On a writable `DataTable`, Backspace/Delete requests archive or delete for selected rows, or the active row if none are selected; it opens a confirmation rather than persisting immediately.
- `src/styles/globals.css` defines shared tokens; `src/styles/redesign.css` contains existing lil.p surface styles. The future CMS core consumes host adapters rather than owning this package's branded controls.
- Run `pnpm --filter @portfolio/ui test`, `pnpm --filter @portfolio/ui typecheck`, and `pnpm --filter @portfolio/ui build-storybook` from the repository root. The workspace-wide quality gate is `pnpm check:all`.

See the [U1 shared-controls spec](../../docs/specs/2026-11-10-cms-u1-shared-controls.md) and [U2 route-pattern ledger](../../docs/audits/2026-11-10-cms-u2-route-pattern-ledger.md) for behavior and the core/host boundary.
