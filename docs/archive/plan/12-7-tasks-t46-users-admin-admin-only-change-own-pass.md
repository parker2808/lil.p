<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T46 · Users admin (admin only) + change own password); links re-pointed. Index: ../../PLAN.md -->

#### T46 · Users admin (admin only) + change own password

**Roadmap** p22 (rounding out M4) · **Spec** §4.3 (Users; "owner only" becomes admin only by D7), §1.5 (`User`) · **Depends** T37 · **Size** M

**Goal.** An `admin` can add accounts, set their role (`admin` or `user`), deactivate them and sign them out everywhere. Every signed-in account can change its own password.

**Scope.**
- API `modules/users/admin-users.controller.ts`, `@Roles('admin')` on the class (explicit, though it is also the default):
  - `GET /admin/users` (page list: name, email, role, `isActive`, `lastLoginAt`), `POST /admin/users` (email, name, role, initial password of at least 12 characters), `PATCH /admin/users/:id` (name, role, `isActive`).
  - `POST /admin/users/:id/sign-out-everywhere` (increments `tokenVersion`; 204) and `POST /admin/users/:id/password` (admin sets a new password; also increments `tokenVersion`).
  - A change of `role` or `isActive` also increments `tokenVersion`, so the old role cannot be refreshed.
  - Guardrails: an admin cannot demote or deactivate themselves, and the last active admin cannot be demoted or deactivated (409 `LAST_ADMIN`, checked inside the same transaction as the update).
- API `PATCH /auth/password` (`@Roles('admin', 'user')`, `changePasswordSchema`: `currentPassword`, `newPassword` with at least 12 characters): verifies the current password, stores the new argon2id hash, increments `tokenVersion`, then sets a fresh cookie pair for this browser so it stays signed in.
- Contracts `users/`: admin user DTO (never `passwordHash` or `tokenVersion`), `createUserSchema`, `updateUserSchema`, `setPasswordSchema`; `auth/auth.schema.ts` gains `changePasswordSchema`.
- Web `admin-users`: `AdminUsersIndex` (`DataTable`: name, email, role pill, active switch, last login; row menu with "Sign out everywhere" and "Set password" behind an `alert-dialog`) and `UserForm` in a `sheet`. Route `app/admin/(cms)/users/page.tsx`; the sidebar item is wrapped in `RoleGate allow={['admin']}`.
- Web `admin-auth/components/ChangePasswordDialog`, opened from the topbar user menu for both roles.

**Files.** `apps/api/src/modules/users/{admin-users.controller.ts,users.service.ts,users.service.spec.ts,dto/*}`, `apps/api/src/modules/auth/{auth.controller.ts,auth.service.ts}`, `packages/contracts/src/users/*`, `packages/contracts/src/auth/auth.schema.ts`, `apps/api/test/users.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/admin/(cms)/users/page.tsx`, `apps/web/src/modules/admin-users/{views/AdminUsersIndex.tsx,components/{UsersTable,UserForm}/*,hooks/use-admin-users.hook.ts,services/admin-users.service.ts}`, `apps/web/src/modules/admin-auth/components/ChangePasswordDialog/*`, `apps/web/src/modules/admin-core/components/{AdminSidebar,Topbar}/*`.

**Design.** Admin table pattern (`15:2`).

**Backend steps, explained.**
1. **Role on the class.** `@Roles('admin')` on the controller class protects every route in it; the `RolesGuard` from T36 does the check. Writing it out, even though admin-only is the default, tells the next reader this module is sensitive.
2. **Hash on create.** The initial password goes through the same argon2id hashing as login (T35); the API never returns it or logs it.
3. **Sign out everywhere, without sessions.** There are no session rows to delete (D24). Incrementing `tokenVersion` makes every refresh token signed with the old number fail at the next refresh, so that user is out within one access-token lifetime (15 min). Need it faster? Lower `JWT_ACCESS_TTL_SECONDS`.
4. **Guardrails in a transaction.** "Is this the last active admin?" and the update run in one `prisma.$transaction`, so two admins demoting each other at the same moment cannot leave the site with no admin.
5. **Changing your own password.** Asking for the current password first means someone at an unlocked laptop cannot lock you out. Bumping `tokenVersion` signs out other devices; re-issuing cookies keeps this one signed in.

**Acceptance.**
- [ ] A `user` calling any `/admin/users` route gets 403, and does not see the Users item.
- [ ] After "Sign out everywhere", that user's next `POST /auth/refresh` returns 401 (e2e).
- [ ] Demoting or deactivating yourself, or the last active admin, returns 409.
- [ ] After changing your own password, the old password fails at login, another browser's refresh returns 401, and the current browser stays signed in.
- [ ] No users API response contains `passwordHash`, `tokenVersion` or a token.

**PR title:** `feat: users admin`

### M5 — Realtime, media, publishing

#### T47 · Contact + inbox API

**Roadmap** p23 · **Spec** §1.5 (`ContactMessage`), §1.6 (Rate limit), §5.6 · **Depends** T36 · **Size** M

**Goal.** A public endpoint that stores contact messages safely, and admin endpoints to read and triage them.

**Scope.**
- Model `ContactMessage` (`name`, `email`, `topicId?`, `message` Text, `locale`, `status` `NEW|READ|REPLIED|SPAM`, `ipHash`). Migration `add-contact`.
- Contracts `contact/`: `contactSchema` (shared with the web form: name, email, topic, message length limits, honeypot field `website`), admin DTO, list params (`status`).
- `public-contact.controller.ts`: `POST /public/contact` (`@Public()`, throttled 3 per 10 minutes per IP). A filled honeypot returns 201 and stores the row as `SPAM`. `ipHash` from `common/utils/ip-hash.util.ts` (SHA-256 of IP + daily salt).
- `admin-contact.controller.ts`: `GET /admin/messages`, `GET /admin/messages/:id`, `PATCH /admin/messages/:id` (status), `GET /admin/messages/unread-count`. All admin only (no `@Roles()`, D7): messages hold visitor emails, so a `user` gets 403. The dashboard's unread count (a number only) stays readable by both roles.
- Emit an in-process event `contact.created` (`@nestjs/event-emitter`); T49 streams it. Dashboard stats gain the unread count.
- Logs never include the email or message body.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-contact`, `apps/api/src/modules/contact/{contact.module.ts,public-contact.controller.ts,admin-contact.controller.ts,contact.service.ts,dto/*,entities/*}`, `apps/api/src/common/utils/ip-hash.util.ts` (+ spec), `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/contact/*`, `apps/api/test/contact.e2e-spec.ts`, `apps/api/api.http`.

**Design.** Spec §5.6 (fields).

**Backend steps, explained.**
1. **Public write = untrusted input.** Validate with the shared schema, cap lengths, rate-limit by IP, and never echo the content back in public responses.
2. **Honeypot.** A hidden field humans never fill. Bots fill everything; answering 201 anyway means they do not learn they were caught.
3. **Hashing the IP.** Rate limits and spam checks need to compare IPs, not store them. A daily salt means hashes cannot be linked across days.
4. **Events.** The service announces "a message arrived" without knowing who listens. T49 adds the listener that pushes it to the admin.

**Acceptance.**
- [ ] A valid message returns 201; invalid input returns 400 with `fieldErrors`; the 4th message in the window returns 429.
- [ ] Honeypot messages are stored as `SPAM` and excluded from the default inbox list.

**PR title:** `feat(api): contact + inbox endpoints`

#### T48 · Contact page + Server Action

**Roadmap** p23 · **Spec** [§5.6](../../design/portfolio-design-system.md#s-5-6), §4.2 (`ContactForm`), §4.6 (Contact form row), §6 Day 20 · **Depends** T14, T47 · **Size** M

**Goal.** The contact page with a form that works with and without JavaScript.

**Scope.**
- Route `app/[locale]/(site)/contact/page.tsx` → `contact/views/ContactIndex.tsx`. `ContactIndex` renders `BlocksPage` for `contact`. New block type `contact-form` (rule 8; H1; layout `TWO` or `ONE`) draws the split layout on the faint grid: left the block's eyebrow, H1 and intro, `contactIntro`, `replyTimeNote`, channel cards (email with `CopyEmailButton`, address shown only via `mailto:`; GitHub; LinkedIn, from `socialLinks`); right `ContactForm` on `--card-glass`.
- `ContactForm` (client): TanStack Form + `field`, validators = `contactSchema`; fields name, email, topic (`select`, hidden when there are no topics), message, hidden honeypot; validate on blur, error summary on submit that receives focus; success replaces the form with a status panel; a submit error shows an `alert` above the form and keeps the inputs.
- `contact/actions/contact.action.ts` (`'use server'`): validates with `contactSchema`, calls `POST /public/contact` with `Origin: WEB_ORIGIN` and `x-forwarded-for` from the incoming request (so throttling sees the visitor's IP), returns `{ ok }` or `{ fieldErrors }`. The `<form action>` uses it directly (no JS, `useActionState`); with JS, a `useMutation` calls the same action.

**Files.** `apps/web/app/[locale]/(site)/contact/page.tsx`, `apps/web/src/modules/contact/{views/ContactIndex.tsx,components/{ChannelCards,ContactForm}/*,actions/contact.action.ts,services/contact-topics.service.ts}`, `apps/web/src/modules/blocks/components/ContactFormBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/contact-form.block.ts,block-registry.constant.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `packages/ui/src/components/ui/{select,textarea}.tsx`.

**Design.** Figma `12:2`. Mockup `contact.html` (one field in its error state). Tokens: `--card-glass`, `--grid-line`, `--destructive`, `text-title`, `text-body`.

**Acceptance.**
- [ ] With JavaScript disabled, the form submits and shows the result (spec §6 Day 20).
- [ ] Field errors appear under the right inputs and in the summary; screen readers announce them.
- [ ] No email address appears in the HTML except inside the `mailto:` link and the copy handler.
- [ ] Screenshot compared with `12:2`.

**PR title:** `feat(web): contact page`

#### T49 · SSE events + inbox UI + NotificationBell

**Roadmap** p23 · **Spec** §1.6 (Realtime), §4.3 (`NotificationBell`), §4.6 (Realtime row), §6 Day 17 · **Depends** T39, T47 · **Size** M

**Goal.** A new contact message appears in the admin within seconds, with a toast and an unread badge, and the stream recovers after restarts.

**Scope.**
- API `modules/events`: `events.controller.ts` (`GET /admin/events`, `@Sse()`, admin only because events carry sender names), `events.service.ts` (a `Subject` fed by `contact.created` and, from T52, `content.published`); heartbeat comment every 25s; headers `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
- Web `admin-core/hooks/use-admin-events.hook.ts`: one `EventSource('/api/admin/events')` in the admin layout; on `contact.created` → `setQueryData(qk.admin.inbox.unread, n => n + 1)`, invalidate the messages list, `sonner` toast "New message from {name}" with Open; closes on unmount; the browser reconnects on its own. Mounted only for `admin`. On `error`, if the stream does not reopen within 5s (an expired access token makes the reconnect fail with 401, which `EventSource` cannot read), call `refreshOnce()` from `api-client.service.ts` and open a new `EventSource`; after 3 failed refreshes stop and send the user to login.
- `admin-core/components/NotificationBell` (topbar, unread badge, `aria-live="polite"`, never steals focus).
- `admin-inbox`: `AdminInboxIndex` (`DataTable`: status filter, mark read optimistic, mark spam) and `AdminInboxDetail`. Routes `app/admin/(cms)/inbox/page.tsx`, `inbox/[id]/page.tsx`. Dashboard gains an inbox card (latest 5).
- Check that the Next rewrite does not buffer the stream; note the result in the PR.

**Files.** `apps/api/src/modules/events/*`, `apps/web/src/modules/admin-core/{hooks/use-admin-events.hook.ts,components/NotificationBell/*}`, `apps/web/src/modules/admin-inbox/*`, `apps/web/app/admin/(cms)/inbox/{page.tsx,[id]/page.tsx}`, `apps/web/src/modules/admin-dashboard/components/InboxCard/*`.

**Design.** Figma `14:2` (bell, inbox card). Mockup `admin-dashboard.html`.

**Backend steps, explained.**
1. **Server-Sent Events.** One long HTTP response that the server keeps writing small `data:` lines to. The browser's `EventSource` reads them and reconnects by itself. One-way is enough for notifications.
2. **Heartbeats.** Proxies close idle connections. A comment line every 25s keeps it open and lets the client notice a dead connection.
3. **Auth works for free, until the token expires.** It is a normal same-origin request, so the `access_token` cookie and `JwtAuthGuard` apply. The guard runs once, when the stream opens; an open stream keeps flowing after the token expires. Only a reconnect needs a fresh token, which is why the hook refreshes before reopening.

**Acceptance.**
- [ ] Submitting the public form shows the new row in the inbox without a reload within 2s (roadmap p23).
- [ ] After an API restart, `EventSource` reconnects and heartbeats resume (roadmap p23).

**PR title:** `feat: contact + sse inbox`

#### T50 · Media API: upload, variants, relations

**Roadmap** p24 · **Spec** §1.5 (`Media`, `ProjectImage`), §1.6 (Uploads) · **Depends** T36 · **Size** L

**Goal.** Safe uploads stored on a volume, with WebP variants and alt text, linked to the entities that use images.

**Scope.**
- Models `Media`, `ProjectImage`. Turn the plain id columns into relations: `SiteSettings.ogImage`, `Profile.avatar`, `Profile.resumeEn`, `Profile.resumeVi`, `Project.cover`, `Post.cover` (`onDelete: SetNull`). Migration `add-media`.
- `admin-media.controller.ts`: `POST /admin/media` (`FileInterceptor`, 10 MB limit, allowlist JPG/PNG/WebP/AVIF/PDF checked by magic bytes, D14; `sharp` strips metadata and writes WebP variants at 480/960/1600 widths; random stored names under `UPLOAD_DIR`), `GET /admin/media` (cursor pagination, D6; `@Roles('admin', 'user')`), `PATCH /admin/media/:id` (alt), `DELETE /admin/media/:id` (409 `IN_USE` when referenced). Upload, patch and delete are admin only.
- `public-media.controller.ts`: `GET /public/media/:file` streams known files only, long cache headers, `X-Content-Type-Options: nosniff`.
- Public DTOs gain image objects `{ url, srcset, width, height, alt }` (alt picked by locale). Admin project DTO gains `images` with captions and order.
- Content health gains "images missing alt text".
- `apps/api/uploads/` git-ignored; `.env.example` `UPLOAD_DIR`.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-media`, `apps/api/src/modules/media/{media.module.ts,admin-media.controller.ts,public-media.controller.ts,media.service.ts,image-variants.service.ts,dto/*,entities/*}`, `apps/api/src/modules/{projects,posts,profile,site-settings}/entities/*.mapper.ts`, `packages/contracts/src/media/*`, `apps/api/test/media.e2e-spec.ts`, `.env.example`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Multipart upload.** Files arrive as `multipart/form-data`. `FileInterceptor` (multer) parses it and enforces the size limit before your code runs.
2. **Never trust the file name or the declared type.** Check the first bytes of the file to find its real type, and store it under a random name.
3. **Variants.** `sharp` resizes once at upload time; pages then pick the smallest size that fits (`srcset`).
4. **Files on disk, metadata in the DB.** The `Media` row is the source of truth; the file is a blob on a Docker volume. A `MediaService` interface means cloud storage can replace the disk later.

**Acceptance.**
- [ ] Uploading a JPG creates the WebP variants, and the public DTO has `srcset` and alt (roadmap p24).
- [ ] A 20 MB upload or an `.exe` renamed to `.jpg` is rejected with 400 (roadmap p24).
- [ ] A PDF is accepted without variants; GPS EXIF data is gone from stored images.

**PR title:** `feat: media uploads`

#### T51 · Media UI: library, uploader, pickers

**Roadmap** p24 · **Spec** §4.3 (`MediaUploader`, `MediaLibrary`), §4.6 (infinite + virtual list), §6 Day 18 · **Depends** T42, T50 · **Size** M

**Goal.** Upload with progress and cancel, browse a large library, and pick images wherever the editors need them; public pages render responsive images.

**Scope.**
- `packages/ui` `MediaLibrary` (grid, alt-missing warning) and `MediaUploader` (drop zone, per-file `progress`, cancel).
- `admin-media`: `AdminMediaIndex` (`useInfiniteQuery` + TanStack Virtual, alt editing in a sheet), `services/media-upload.service.ts` (XHR, because `fetch` has no upload progress; `AbortController` cancel), `components/MediaPickerDialog`.
- Pickers in editors: project cover and images with captions (T43), post cover (T44), avatar and resumes (T45 profile), OG image (T45 settings). `MarkdownEditor`: `@tiptap/extension-file-handler` (MIT, D25) on paste and drop calls `onUploadImage(file)`, inserts the image with the returned `/api/public/media/…` URL, and opens the alt-text popover (publish requires alt, T52); the toolbar image button opens the media picker `dialog`.
- Public: `core/utils/image-loader.util.ts` (`next/image` loader that maps width → nearest variant); covers on case study and featured card, avatar on About, CV download card links.

**Files.** `packages/ui/src/components/{MediaLibrary,MediaUploader}/*`, `packages/ui/package.json` (`@tiptap/extension-file-handler`, same version as the other `@tiptap/*`), `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,extensions/create-markdown-extensions.ts}`, `apps/web/src/modules/admin-core/components/MarkdownField/*`, `packages/ui/src/components/ui/progress.tsx`, `apps/web/src/modules/admin-media/*`, `apps/web/app/admin/(cms)/media/page.tsx`, `apps/web/src/modules/admin-{projects,posts,site}/components/*` (picker wiring), `apps/web/src/modules/core/utils/image-loader.util.ts`, `apps/web/next.config.ts`, `apps/web/src/modules/{projects,about,home}/components/*`.

**Design.** Mockup `admin-editor.html` (cover field), `case-study.html` (21:9 cover). Tokens: `--radius-xl`, `--muted`, `--warning`.

**Acceptance.**
- [ ] Upload shows progress and can be cancelled (spec §6 Day 18).
- [ ] Public `<img>` elements have `srcset` and alt (roadmap p24).
- [ ] The library scrolls smoothly with 1,000 seeded media rows.

**PR title:** `feat(web): media library and pickers`

#### T52 · Publish workflow + revalidate + draft preview

**Roadmap** p25 · **Spec** §1.5 (status), §4.6 (tags, revalidate), §5.5, §6 Day 19 · **Depends** T27, T28, T43, T44 · **Size** L

**Goal.** Publishing makes a change live in seconds without a redeploy; drafts are visible only in a signed-in preview.

**Scope.**
- API `modules/publishing`: `publishing.service.ts` (`revalidate(tags)` → `POST ${WEB_INTERNAL_URL}/api/revalidate` with `x-revalidate-secret`; one retry; failures are logged and never block the write), `tags.util.ts` (entity → tags: `site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`).
- Routes (admin only): `POST /admin/projects/:id/publish|unpublish`, `POST /admin/posts/:id/publish|unpublish`. Publish checks required English fields, `publishLint`, and alt text on used images → 400 with `fieldErrors`; sets `status` and `publishedAt` (first publish only); emits `content.published`.
- Every admin write that changes public data calls `revalidate` with its tags.
- Preview API: `GET /admin/preview/projects/:slug`, `GET /admin/preview/posts/:slug` (public DTO shape, any status, `@Roles('admin', 'user')`).
- Web: `app/api/revalidate/route.ts` (checks the secret, `revalidateTag` per tag), `app/api/draft/route.ts` (checks the access token via `/auth/me` with `withAuth`, either role; enables `draftMode()`, redirects to the page; `?exit=1` disables it). Services use the preview endpoints with the forwarded `access_token` cookie and no cache when draft mode is on; if it has expired, the draft banner links to `/admin/login?next=` the current page. A draft banner with an exit link.
- Editor publish button and status in the properties pane (projects, posts); preview link.
- `.env.example`: `REVALIDATE_SECRET`, `WEB_INTERNAL_URL`.
- Pages (D26) reuse this draft mode; their publish, versions and live preview are T52a.

**Files.** `apps/api/src/modules/publishing/*`, `apps/api/src/modules/{projects,posts}/{admin-*.controller.ts,*.service.ts}`, `apps/api/src/modules/*/` (revalidate calls), `apps/api/test/publishing.e2e-spec.ts`, `apps/web/app/api/{revalidate,draft}/route.ts`, `apps/web/src/modules/core/{services/api-server.service.ts,components/DraftBanner/*}`, `apps/web/src/modules/{projects,notes}/services/*.service.ts`, `apps/web/src/modules/admin-{projects,posts}/components/*`, `.env.example`.

**Design.** Spec §5.9 (publish in header), `StatusPill`.

**Backend steps, explained.**
1. **Publish is a state change with rules.** Drafts can be incomplete; publishing checks the rules once, in one place.
2. **Cache tags.** The web caches each public page with tags. The API knows what changed, so it tells the web "everything tagged `post:my-slug` is stale", and only those pages rebuild on the next visit.
3. **Shared secret.** The revalidate route is public on the web, so it requires a secret header known only to the API.
4. **Draft mode.** A signed-in `admin` or `user` gets a cookie that makes the web skip the cache and read the preview endpoints; everyone else still gets 404 for drafts.

**Acceptance.**
- [ ] On a production build (`pnpm build && pnpm start`), publishing shows the change on the public page in under 5s without a redeploy (roadmap p25).
- [ ] A draft is visible only in preview; the public URL still returns 404 (roadmap p25).
- [ ] Publishing a post containing `TODO` returns 400 with `fieldErrors` (spec §6 Day 10 v2).
- [ ] A wrong revalidate secret returns 401.

**PR title:** `feat: publish + on-demand revalidate`

#### T52a · Page publish, versions, live preview

**Roadmap** p25 · **Spec** §4.6 (tags, revalidate), §1.5 (status), D26 · **Depends** T45b, T52 · **Size** L

**Goal.** Visitors see a page's published version, never its draft. An `admin` publishes with one click, can restore any earlier version, and watches the draft live next to the builder before publishing.

**Scope.**
- Model `PageVersion`: `pageId`, `version` (1, 2, 3… per page), `snapshot Json` (`{ seo, blocks: [{ type, key, schemaVersion, props, layout, surface, isVisible, sortOrder }] }`), `note` `VarChar(200)?`, `createdById` → `User` (`onDelete: SetNull`), `createdAt`; `@@unique([pageId, version])`. `Page` gains `publishedVersionId` (unique, → `PageVersion`) and `publishedAt`. Migration `add-page-versions`. The seed publishes v1 of every page.
- Public read switches to snapshots: `GET /public/pages/:key` serves the published snapshot, each block still through `parseBlock`, so an old snapshot is migrated or its bad blocks are dropped, never a 500. A page that was never published returns `blocks: []` (the shell still renders) and content health flags it.
- Admin routes (admin only unless noted):
  - `POST /admin/pages/:key/publish` `{ note? }`. Checks first:
    - the T32a page rules;
    - strict `parseBlock` on every visible block (400 `INVALID_BLOCKS` with issues per block; hidden invalid blocks are left out of the snapshot);
    - `publishLint` on every text value, and English required fields.
    - Then, in one transaction, it writes version n+1 and sets `publishedVersionId` and `publishedAt`.
    - Afterwards it revalidates `page:{key}` through the T52 publishing service, emits `content.published`, and records an audit `PUBLISH` row once T55 lands.
  - `GET /admin/pages/:key/versions` (page-based list: version, date, author name, note, block count) and `GET /admin/pages/:key/versions/:version` (snapshot). Both are `@Roles('admin', 'user')`.
  - `POST /admin/pages/:key/versions/:version/restore`: replaces the draft rows with that snapshot in one transaction (`deleteMany` + `createMany`). It does not publish, so "roll back" means restore, then publish.
  - `POST /admin/pages/:key/discard`: restores the published version into the draft.
  - `GET /admin/preview/pages/:key?locale` (`@Roles('admin', 'user')`): the draft in the public DTO shape, with invalid blocks listed separately.
  - `GET /admin/pages` gains `publishedVersion` and `hasUnpublishedChanges` (`Page.updatedAt` later than `publishedAt`).
- Web public:
  - `blocks/services/pages.service.ts` reads the preview endpoint (forwarded `access_token`, no cache) when `draftMode()` is on.
  - In draft mode, `BlockRenderer` adds `data-block-id` to each block and shows `UnknownBlockNotice` (a dashed box with the type and its issues) where a visitor sees nothing.
- `core/components/PreviewBridge` (client, mounted by the site layout only in draft mode): it handles `message` events whose `origin` equals `location.origin`. `preview:refresh` calls `router.refresh()` and keeps the scroll position; `preview:focus { blockId }` scrolls to that block and outlines it.
- Builder (`admin-pages`):
  - `PagePreview`: an `iframe` of `/api/draft?path=/{locale}{route}` (the T52 draft route; `path` must be a public route).
    - It sits next to the list on `xl` and in a `sheet` below that.
    - A viewport toggle (390, 768, 1440: the iframe width, scaled to fit) checks the responsive rules, and an EN/VI toggle switches locale.
    - After each successful save the builder posts `preview:refresh`; selecting a block posts `preview:focus`.
  - `PublishBar`: an "Unpublished changes" badge, Publish (optional note) inside `RoleGate allow={['admin']}`, and Discard changes. A 400 `INVALID_BLOCKS` highlights the rows.
  - `VersionHistory` `sheet`: the versions list; open one in the preview as a read-only snapshot; Restore behind an `alert-dialog` (admin only).
- Content health (T38) gains four checks:
  - pages never published;
  - unpublished changes older than 7 days;
  - blocks that fail validation in a draft or in the published version;
  - block references to missing or unpublished items.
- The preview frames the public site from the same origin, so T59 sets `frame-ancestors 'self'` instead of `'none'`.
- e2e `test/page-versions.e2e-spec.ts`:
  - publishing shows the change on the public page, and a later draft edit leaves it unchanged;
  - publishing with an invalid visible block returns 400;
  - restoring v1 and publishing brings v1 back;
  - a `user` gets 403 on publish and restore, and 200 on versions and preview.

**Out of scope.** Scheduled publishing (Q4). Comparing two versions side by side.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-page-versions`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/src/modules/pages/{admin-pages.controller.ts,pages.service.ts,page-versions.service.ts,page-versions.service.spec.ts,entities/*}`, `apps/api/src/modules/publishing/tags.util.ts`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/pages/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/api/test/page-versions.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/api/draft/route.ts`, `apps/web/app/[locale]/(site)/layout.tsx`, `apps/web/src/modules/blocks/{services/pages.service.ts,components/{BlockRenderer,UnknownBlockNotice}/*}`, `apps/web/src/modules/core/components/PreviewBridge/*`, `apps/web/src/modules/admin-pages/{components/{PagePreview,PublishBar,VersionHistory}/*,hooks/use-page-versions.hook.ts,services/admin-pages.service.ts}`, `apps/web/src/modules/admin-dashboard/components/ContentHealthCard/*`.

**Design.** Spec §5.9 (publish in the header), `StatusPill`. Tokens: `--warning` and `--warning-subtle` (unpublished badge), `--border`, `--muted` (preview frame background), `--shadow-2`, `--ring` (focused block outline).

**Backend steps, explained.**
1. **Draft and published copies.** The `PageBlock` rows are the draft you edit. Publishing copies them into one JSON snapshot (`PageVersion`) and points the page at it. Visitors only ever read snapshots, so a half-finished rearrangement never shows.
2. **Why a snapshot and not a status per block?** A page is published as a whole: order, layout and text belong together. One JSON copy per publish is easy to read, easy to restore, and small (a few KB).
3. **Version numbers.** `@@unique([pageId, version])`, with n+1 computed inside the transaction, means two publishes at the same moment cannot both create version 4. One fails and can retry.
4. **Restore keeps the history.** Restoring copies an old snapshot into the draft and never deletes a version. Publishing after it creates a new version, so the history only grows.
5. **Draft mode for pages.** The preview is the real public route, rendered by the same server components, but reading the draft through an admin endpoint with your cookie. What you see in it is exactly what visitors get after you publish.

**Acceptance.**
- [ ] On a production build, publishing a reordered home shows the new order in under 5s, and editing without publishing changes nothing for visitors (roadmap p25).
- [ ] The live preview updates about a second after each autosave, and at 390px it shows every block in one column.
- [ ] Restoring v1 and publishing brings the public page back to v1, and the history keeps every version.
- [ ] Publishing with an invalid visible block returns 400 and highlights it; an old snapshot whose block type was removed still renders its other blocks.
- [ ] A visitor without draft mode never receives draft blocks (`curl` the public page while a draft change exists).
- [ ] Signed in as `user`, preview and history work; Publish, Discard and Restore are hidden and refused by the API.

**PR title:** `feat: page publish + versions + live preview`

