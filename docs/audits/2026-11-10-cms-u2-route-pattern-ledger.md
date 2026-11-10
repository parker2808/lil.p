# CMS U2 — route/pattern migration ledger

This ledger covers the 43 `page.tsx` sources enumerated in the [U0 inventory](2026-11-10-cms-u0-route-control-baseline.md). “Keep” means preserve the current shared owner and behavior, not evidence of a passed accessibility review. EN routes also serve VI; the admin locale is selected by cookie. Dynamic routes require seeded IDs/slugs. Redirect-only sources have no independent interactive screen.

| Source route                          | Current owner/pattern → U2 target                                     | Route state and risk                                   | Future boundary                          |
| ------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `/[locale]`                           | HomeIndex, site navigation/CMS blocks → shared site shell             | Live; preserve blocks and locale                       | Host navigation / core block surface     |
| `/[locale]/about`                     | AboutIndex, CMS sections → shared site shell                          | Live; preserve published sections                      | Host content / core sections             |
| `/[locale]/contact`                   | ContactIndex, ContactForm → U1 field/Select + consistent feedback     | Live; preserve optional topic and pre-hydration values | Core field/feedback / host submission    |
| `/[locale]/craft`                     | Craft experience, site shell → shared navigation/loading              | Live; preserve interaction                             | Host experience / core shell             |
| `/[locale]/notes`                     | NotesIndex, search/cards → shared empty/loading/navigation            | Live; seeded note data                                 | Core empty/loading / host note cards     |
| `/[locale]/notes/[slug]`              | NotesDetail, article → shared site navigation/error                   | Live with published slug                               | Core error / host article                |
| `/[locale]/projects`                  | ProjectsIndex, filter/cards → shared filter/empty/loading             | Live; preserve filters                                 | Core filter/empty / host project cards   |
| `/[locale]/projects/[slug]`           | ProjectsDetail, case study → shared site shell/error                  | Live with published slug                               | Core error / host case study             |
| `/[locale]/[...rest]`                 | Custom published CMS page → shared site shell/error                   | Live for unreserved slug; other slugs 404              | Core renderer / host route policy        |
| `/[locale]/r3-loading-test/[variant]` | PublicRouteSkeleton fixture → shared loading                          | Flag-only `R3_E2E_STATES=1`; no production screen      | Core skeleton / host test fixture        |
| `/[locale]/r3-site-error-test`        | PublicErrorState fixture → shared error                               | Flag-only; deliberate throw                            | Core error / host test fixture           |
| `/[locale]/r3-locale-error-test`      | Locale error fixture → shared error                                   | Flag-only; deliberate throw                            | Core error / host test fixture           |
| `/admin/login`                        | AdminAuthLogin, LoginForm → shared fields/feedback                    | Live, unauthenticated                                  | Core fields / host auth                  |
| `/admin`                              | AdminDashboardIndex, cards/table → shared admin shell/empty           | Live, authenticated                                    | Core cards / host dashboard              |
| `/admin/analytics`                    | AdminInsightsAnalytics, AdminTable → shared table/loading/error       | Live, authenticated                                    | Core table / host metrics                |
| `/admin/audit`                        | AdminInsightsAudit, U1 Select/AdminTable → shared filter/table        | Admin-only; preserve authorization                     | Core filter/table / host audit           |
| `/admin/domains`                      | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/education`                    | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/experience`                   | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/experience/new`               | ExperienceForm/editor → shared field/feedback/loading                 | Live; preserve create payload                          | Core form shell / host experience        |
| `/admin/experience/[id]`              | ExperienceForm/editor → shared field/feedback/loading                 | Live with seeded ID                                    | Core form shell / host experience        |
| `/admin/inbox`                        | AdminInboxIndex/AdminListTable → shared list/table/empty              | Admin-only; preserve filtering                         | Core table / host inbox                  |
| `/admin/inbox/[id]`                   | AdminInboxDetail → shared navigation/loading/error                    | Admin-only; invalid ID 404                             | Core navigation/error / host inbox       |
| `/admin/media`                        | AdminMediaIndex → shared list/empty/feedback                          | Live, authenticated; preserve upload                   | Core empty / host media adapter          |
| `/admin/pages`                        | AdminPagesIndex → shared list/empty/navigation                        | Live, authenticated; preserve create                   | Core list / host page policy             |
| `/admin/pages/[key]`                  | AdminPagesEditor/conditional AboutTabs → shared editor form/tabs      | Live for built-in/custom key; invalid key 404          | Core form/tabs / host registry           |
| `/admin/pages/about/experience/new`   | No independent pattern → experience editor                            | Redirect in page source                                | Host redirect/policy                     |
| `/admin/pages/about/experience/[id]`  | No independent pattern → experience editor                            | Redirect in page source                                | Host redirect/policy                     |
| `/admin/posts`                        | AdminPostsTabs/list → shared tabs/table/empty                         | Live; preserve tags tab                                | Core tabs/table / host posts             |
| `/admin/posts/new`                    | AdminPostsEditor → shared form/feedback/loading                       | Live; preserve create draft                            | Core form shell / host posts             |
| `/admin/posts/[id]`                   | AdminPostsEditor → shared form/feedback/loading                       | Live with seeded ID                                    | Core form shell / host posts             |
| `/admin/principles`                   | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/process`                      | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/profile`                      | AdminSiteProfile → shared form/feedback/loading                       | Live, authenticated                                    | Core field/feedback / host profile       |
| `/admin/projects`                     | AdminProjectsIndex → shared table/empty/filter                        | Live, authenticated                                    | Core table / host project listing        |
| `/admin/projects/new`                 | AdminProjectsEditor → shared form/tabs/feedback                       | Live; preserve editor values                           | Core form shell / host portfolio project |
| `/admin/projects/[id]`                | AdminProjectsEditor → shared form/tabs/feedback                       | Live with seeded ID                                    | Core form shell / host portfolio project |
| `/admin/site`                         | AdminSiteIndex, SettingsForm/SocialTable → shared form/table/feedback | Live, authenticated                                    | Core form/table / host settings          |
| `/admin/skills`                       | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/stats`                        | No independent pattern → About tab                                    | 307 redirect                                           | Host redirect/policy                     |
| `/admin/tags`                         | No independent pattern → Posts tags tab                               | 307 redirect                                           | Host redirect/policy                     |
| `/admin/users`                        | AdminUsersIndex → shared table/empty/feedback                         | Admin-only; preserve authorization                     | Core table / host roles                  |
| `/admin/[...rest]`                    | Admin catch-all → notFound                                            | Unrecognized admin section 404                         | Core error / host route policy           |

## Shared component ownership

| Proposed core primitive                                      | Current implementation (U2 source)                 | `lil.p` adapter and migration risk                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Field, Input, Textarea, Select, RadioGroup, Checkbox, Switch | `packages/ui/src/components/ui/` (U1)              | Host supplies EN/VI labels, schemas, submissions and orange/green tokens; preserve optional/invalid form values.        |
| AdminTable, DataTable, EmptyState, ErrorState, PageSkeleton  | `packages/ui/src/components/`                      | Host owns row actions, API data, search/filter state, localization and loading boundaries; preserve keyboard row links. |
| PageHeader, NavLink, SectionNav, DropdownMenu                | `packages/ui/src/components/` and `components/ui/` | Host owns destinations, flags, role gating and URL locale; keep redirects independent of nav visibility.                |
| Button, Alert, Sonner/Toast, Dialog                          | `packages/ui/src/components/ui/`                   | Host owns mutation lifecycle and message text; no implicit retry or publish in core.                                    |

No code is moved into the private core during Phase U. “Core” in this table is the intended extraction interface, not a current package or a claim that a component is already reusable outside `lil.p`.
