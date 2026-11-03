# R3d Demo B fix

1. Custom pages require a visible prose body with meaningful copy in the page's primary locale. A header, hidden prose, deleted prose, or CTA alone cannot publish. Core page rules stay unchanged.
2. Publish validation returns field paths for an empty visible prose block and a page body error when no qualifying body exists. The admin translates these errors using its UI locale.
3. The process-local mock supports page creation, draft preview, block updates, and publish. It keeps data in memory and mirrors the real API's validation and response shapes.
4. Focused production captures exercise create, preview, rejected publish, edit, and successful publish in English and Vietnamese at 1440px and 390px.
5. Demo collection row icons remain visual affordances without keyboard or button semantics until matching actions exist.
6. Verify service tests, UI localization tests, browser captures, and `pnpm check:all`. No database or migration is used.
