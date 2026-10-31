<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T42 · Editor shell + Tiptap MarkdownEditor + autosave); links re-pointed. Index: ../../PLAN.md -->

#### T42 · Editor shell + Tiptap MarkdownEditor + autosave

**Roadmap** p22 · **Spec** [§5.9](../../design/portfolio-design-system.md#s-5-9), §4.3 (`MarkdownEditor`, `SaveStatus`, `LocaleTabs`, `PropertyList`), §4.6 (Autosave), D25 · **Depends** T39 · **Size** L

**Goal.** The shared editor frame every entity editor uses: a Tiptap rich-text editor that reads and writes Markdown, a toolbar built from shadcn parts, a preview that is exactly the public renderer, locale tabs, a properties pane, autosave with conflict detection, a dirty guard, and a read-only mode for `user`.

**Scope.**
- **Dependencies** (`packages/ui`, every `@tiptap/*` pinned to the same exact version and upgraded together, because their peer dependencies require it): `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` (`Placeholder`, `CharacterCount`), `@tiptap/extension-code-block-lowlight` + `lowlight` + `highlight.js` (BSD-3-Clause, free), `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/suggestion` + `@floating-ui/dom`. All MIT except highlight.js. Nothing from `@tiptap-pro/*` or the Tiptap private registry (D25).
- **`scripts/check-deps.mjs`** + root script `check:deps`, run in CI: fails if `pnpm-lock.yaml` contains `@tiptap-pro/` or `@tiptap-cloud/`, if any `.npmrc` points at `registry.tiptap.dev`, or if an installed `@tiptap/*` package's `license` is not `MIT`.
- **`packages/ui` `MarkdownEditor`** (`'use client'`). Props: `value` (Markdown), `onChange(markdown)`, `onBlur`, `editable`, `variant` (`full` | `compact`), `labels` (chrome strings, since `packages/ui` has no i18n), `renderPreview(markdown)` (slot filled by the web), `onUploadImage?` (wired in T51).
  - `useEditor({ extensions: createMarkdownExtensions(), content: value, contentType: 'markdown', editable, immediatelyRender: false })`. `immediatelyRender: false` is required with Next.js server rendering, otherwise hydration fails.
  - `extensions/create-markdown-extensions.ts` is the editor's schema, and it follows the T23 allowlist exactly: `StarterKit.configure({ heading: { levels: MARKDOWN_HEADING_LEVELS }, underline: false, codeBlock: false, link: { openOnClick: false, autolink: true, isAllowedUri: isAllowedMarkdownUrl } })`, `Markdown`, `CodeBlockLowlight` (a `lowlight` instance with only `MARKDOWN_CODE_LANGUAGES` registered), `Image` (`isAllowedImageSrc`, `alt` attribute), the Table extensions, `Placeholder`, `CharacterCount`, plus the three custom extensions below. Nothing outside the allowlist is registered, so pasted HTML is reduced to allowed nodes by ProseMirror's schema and unknown Markdown HTML stays as plain text.
  - `extensions/heading-clamp.extension.ts`: extends `Heading` so that an H1 in loaded Markdown becomes H2, matching the public renderer.
  - `extensions/callout.extension.ts`: a block node `callout` (`kind`: `NOTE` | `WARNING`) with a `markdownTokenizer` for `> [!NOTE]` / `> [!WARNING]` and a `renderMarkdown` that writes the same syntax back; rendered through `ReactNodeViewRenderer` with the public `Callout` look.
  - `extensions/slash-command.extension.ts`: `@tiptap/suggestion` on `/`, listing Heading 2, Heading 3, bullet list, ordered list, quote, Note, Warning, code block, image, table and divider; the menu is shadcn `command` in a floating panel.
  - Code blocks: a `ReactNodeViewRenderer` header with a language `select` (`MARKDOWN_CODE_LANGUAGES` + "Plain text") and the same filename/language look as the public `CodeBlock`. Highlight colors come from `packages/ui/src/styles/editor.css`, which maps `.hljs-*` classes to the T23 `--shiki-token-*` variables, so writing and reading use one palette. The Preview mode shows the exact Shiki output.
  - Pasting plain text that looks like Markdown inserts it as Markdown (`insertContent(text, { contentType: 'markdown' })`), through a small `handlePaste` in `extensions/markdown-paste.extension.ts` if `@tiptap/markdown` has no built-in option for it.
  - Modes on shadcn `tabs`: **Write** (the editor), **Split** (editor and preview side by side on `resizable`, `xl` and up), **Preview** (`renderPreview`, debounced 500ms), **Markdown** (read-only `<pre>` of `getMarkdown()`: exactly what will be stored). Word count from `CharacterCount` in the footer.
  - `editable: false`: the toolbar, slash menu and paste/drop handling are off, the placeholder is hidden, `aria-readonly="true"`, links open on click. `useEffect` calls `editor.setEditable(editable)` when the prop changes.
  - Stories: empty, kitchen-sink fixture, read-only, compact, dark.
- **Toolbar** (`MarkdownEditor/components/EditorToolbar`): `role="toolbar"` with arrow-key roving focus, sticky at the top of the editor; every icon button has a `tooltip` showing its shortcut in `kbd`; groups split by a vertical `separator`. `variant="compact"` (experience highlights, bio) shows only bold, italic, link and lists; the schema stays the same, so no stored content is lost.

| Control | shadcn parts | Markdown it writes | Shortcut |
| --- | --- | --- | --- |
| Undo, redo | `button` (`ghost`, `sm`) | n/a | `Mod-Z`, `Shift-Mod-Z` |
| Block type: Paragraph, Heading 2, Heading 3 | `dropdown-menu` | `## `, `### ` | `Mod-Alt-0/2/3` |
| Bold, italic, strikethrough, inline code | `toggle-group` (`multiple`, `aria-pressed`) | `**…**`, `*…*`, `~~…~~`, `` `…` `` | `Mod-B`, `Mod-I`, `Mod-Shift-S`, `Mod-E` |
| Link | `popover` + `input` + `button` (Apply, Remove); URL checked with `isAllowedMarkdownUrl` | `[text](url)` | `Mod-K` |
| Bullet list, ordered list, quote | `toggle` | `- `, `1. `, `> ` | `Mod-Shift-8/7/B` |
| Callout: Note, Warning | `dropdown-menu` | `> [!NOTE]`, `> [!WARNING]` | `/note`, `/warning` |
| Code block | `button`; language `select` in the block header | fenced block with language | `Mod-Alt-C` |
| Image | `button` → `popover` (URL + required alt) until T51, then the media picker `dialog` | `![alt](url)` | `/image` |
| Table | `dropdown-menu` (insert 3×3, add/remove row or column, delete table) | GFM table | `/table` |
| Mode | `tabs` (Write, Split, Preview, Markdown) | n/a | n/a |

- **Web `admin-core/components/MarkdownField`**: binds a TanStack Form field to `MarkdownEditor`. It loads the editor with `next/dynamic` (`ssr: false`, skeleton while loading), so Tiptap ships only in admin chunks. It passes `labels` from `admin.editor.*` in `en.json`, `renderPreview` (calls `content/actions/preview.action.ts`) and `editable={!readOnly}`.
- **Autosave integration** (`hooks/use-autosave.hook.ts`):
  - On every Tiptap `update`, `getMarkdown()` runs debounced 250ms and calls `field.handleChange(markdown)`. The form listener then debounces 1.5s and sends `PATCH` with `updatedAt`. Blur, a locale tab switch and leaving the page flush both debounces at once.
  - **No save on open.** `@tiptap/markdown` may normalize hand-written Markdown (for example `*` bullets become `-`). Right after load, `MarkdownField` stores `baseline = editor.getMarkdown()`, and the field is dirty only when the current Markdown differs from that baseline, not from the raw DB string.
  - **Outside changes** ("Load latest" after a 409 conflict, an offline copy restored, a locale switch) call `editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })`, but only when `value` differs from the last emitted Markdown, so the cursor never jumps while typing.
  - 409 → `SaveStatus` "Conflict" with "Load latest" / "Overwrite"; offline → the Markdown string is kept in `localStorage` per entity and locale. Neither keeps editor JSON.
- **Read-only mode** (D7): `EditorShell` `readOnly` is true when `useIsAdmin()` is false. Then every `MarkdownField` gets `editable: false`, other fields are disabled, autosave and the dirty guard are off, the publish slot is hidden, and the header shows a "Read only" badge. Every editor in T43–T45 passes it through.
- **`packages/ui`**: also `SaveStatus` (`Saving…`, `Saved 12s ago`, `Offline, changes kept locally`, `Conflict: newer version` with Load latest / Overwrite), `LocaleTabs` (EN/VI with completeness dots), `PropertyList`.
- **`content`**: split the T23 pipeline into `markdown-to-hast` (server) and `hast-to-react.util.ts` (shared); `content/actions/preview.action.ts` (Server Action that returns sanitized HAST for the preview pane, with the same sanitize schema and Shiki theme as the public pages).
- **`admin-core`**: `EditorShell` (header with title, `SaveStatus`, publish slot; editor; properties pane 320px on `lg`; live preview column on `2xl`; properties in a `sheet`/`drawer` on mobile), `hooks/use-dirty-guard.hook.ts`, `utils/map-field-errors.util.ts` (`ApiError.fieldErrors` → form field errors).
- **Tests**:
  - `MarkdownEditor` round-trip with the T23 kitchen-sink fixture: load → `getMarkdown()` → load → `getMarkdown()` gives the same string, and every construct survives.
  - The unsafe fixture through the editor: the output has no `<script>`, `<iframe>`, `onerror`, `javascript:` or external image, and no H1.
  - That editor output through the public pipeline renders every kitchen-sink element.
  - Callout and code-block language Markdown round-trips.
  - Opening a document does not mark it dirty.
  - The autosave state machine, field error mapping, and read-only mode (no `PATCH` is sent, `editor.isEditable` is false).

**Files.** `packages/ui/package.json`, `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,MarkdownEditor.stories.tsx,MarkdownEditor.test.tsx,components/{EditorToolbar,SlashMenu,LinkPopover,CodeBlockView,CalloutView}/*,extensions/{create-markdown-extensions.ts,heading-clamp.extension.ts,callout.extension.ts,slash-command.extension.ts,markdown-paste.extension.ts}}`, `packages/ui/src/styles/{globals.css,editor.css}`, `packages/ui/src/components/{SaveStatus,LocaleTabs,PropertyList}/*`, `packages/ui/src/components/ui/{tabs,resizable,drawer,toggle,toggle-group,tooltip,kbd,dropdown-menu,popover,command,select,separator}.tsx`, `apps/web/src/modules/content/{services/markdown.service.ts,utils/hast-to-react.util.ts,actions/preview.action.ts}`, `apps/web/src/modules/admin-core/{components/EditorShell/*,components/MarkdownField/*,hooks/use-autosave.hook.ts,hooks/use-dirty-guard.hook.ts,utils/map-field-errors.util.ts}`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `package.json`, `.github/workflows/ci.yml` ([root STRUCTURE: packages/ui](../../../STRUCTURE.md#package-layout-packagesui)).

**Design.** Figma `18:2`. Mockup `admin-editor.html` (toolbar `B I H1 H2 🔗 </> 🖼 callout [Split]`, slash menu). The mockup's "H1 H2" buttons map to Heading 2 and Heading 3, because the page title is the only H1. Tokens:
- toolbar: `--card` background, `--border` bottom border, controls 28px (`sm`), `text-ui`, active toggle `--accent` / `--accent-foreground`, focus `--ring`;
- menus and popovers: `--popover`, `--shadow-2`, `--z-dropdown`, `--radius-md`;
- writing surface: `Prose` (`text-prose`, `--measure`), so line length matches the public page; placeholder `--muted-foreground`; selection `--primary-subtle`;
- code blocks: `--muted`, `--font-mono`, `--shiki-token-*`; callouts: `--info-subtle` (Note) and `--warning-subtle` (Warning);
- word count: `text-ui-meta`; save states: `--success`, `--warning`.

**Acceptance.**
- [ ] Typing `## `, `- ` or a code fence turns into the block, and the Markdown tab shows the matching Markdown; the stored value in the DB is Markdown, never HTML or JSON (D3).
- [ ] The kitchen-sink fixture round-trips unchanged, and the unsafe fixture loses every disallowed item (tests).
- [ ] Opening an item never triggers a `PATCH`; autosave fires 1.5s after typing stops and shows `Saved …`; a stale save shows `Conflict` with both actions (tested).
- [ ] Leaving with unsaved changes asks for confirmation.
- [ ] Signed in as `user`, an editor opens read-only (`editable: false`, no toolbar) and sends no writes.
- [ ] Preview output uses the same sanitized pipeline and Shiki theme as the public site (shared fixtures).
- [ ] `pnpm check:deps` passes, and fails when a `@tiptap-pro/` package is added in a test branch.
- [ ] `next build` shows no growth in First Load JS for public routes (Tiptap only in `/admin` chunks).
- [ ] Toolbar keyboard pass: Tab reaches the toolbar once, arrows move between controls, every control has an accessible name and shows its shortcut.

**PR title:** `feat(web): editor shell + markdown editor`

#### T43 · Project editor

**Roadmap** p22 · **Spec** §5.9, §5.11 ("Card & facts"), §4.6 (TanStack Form field arrays) · **Depends** T42 · **Size** L

**Goal.** Create and edit projects with every case-study field, metrics, and a live `CaseCard` preview.

**Scope.**
- Routes `app/admin/(cms)/projects/new/page.tsx` and `projects/[id]/page.tsx` → `admin-projects/views/AdminProjectsEditor.tsx`.
- Tabs: Content (title, tagline, the six case-study markdown fields per locale, each a `MarkdownField` (T42); only the active locale's editors are mounted; Scope and Trade-offs show the hint "Use `###` headings to split into columns/cards", because T23's `split-sections.util.ts` splits on H3), Card & facts (domain select, key facts textarea with 2–4 line counter, fact chips input with max 6, live `CaseCard` preview), Metrics (field array: label, before, after, value; reorder), SEO.
- Properties pane: status, slug, dates, featured, confidential, experience link, skills multi-combobox, version from/to, live/repo URLs. Cover picker comes in T51; publish button in T52.
- Autosave via `use-autosave`; create redirects to the edit route.
- Read-only for `user`: `AdminProjectsEditor` passes `readOnly` to `EditorShell`, every `MarkdownField` gets `editable: false`, and the metric field array hides add, remove and reorder.

**Files.** `apps/web/app/admin/(cms)/projects/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-projects/{views/AdminProjectsEditor.tsx,components/{ProjectContentTab,ProjectCardFactsTab,ProjectMetricsTab,ProjectSeoTab,ProjectProperties}/*,hooks/use-admin-project.hook.ts}`, `packages/ui/src/components/ui/{calendar,popover,command}.tsx`.

**Design.** Figma `18:2` (Card & facts tab active). Mockup `admin-editor.html`.

**Acceptance.**
- [ ] Submitting an empty EN title returns 400 and the error shows on that input (roadmap p22).
- [ ] Edits show on the public page after save (roadmap p22; after T52 only on publish).
- [ ] Editing in two tabs produces the Conflict state in the second.
- [ ] Signed in as `user`, all six case-study editors are read-only and the page sends no `PATCH`.
- [ ] Screenshot compared with `18:2`.

**PR title:** `feat(web): admin editors`

#### T44 · Post + experience editors

**Roadmap** p22 · **Spec** §5.9, §5.11 (takeaways) · **Depends** T42 · **Size** M

**Goal.** Editors for posts and experience on the shared shell.

**Scope.**
- Post editor (`AdminPostsEditor`): title, excerpt, body (`MarkdownField`, `full` toolbar) per locale, takeaways textarea (≤ 5 lines), tags multi-combobox with create, featured, SEO fields; publish-lint warnings shown inline using `publishLint` from contracts. Routes `posts/new`, `posts/[id]`.
- Experience editor (`AdminAboutExperienceEditor`): company, URL, location, employment type, role, summary, highlights (`MarkdownField`, `compact` toolbar), month-precision dates (`calendar`), skills. Routes `experience/new`, `experience/[id]`.
- Both editors pass `readOnly` to `EditorShell`, so a `user` gets `editable: false` editors, disabled inputs and no tag creation.

**Files.** `apps/web/app/admin/(cms)/posts/{new,[id]}/page.tsx`, `apps/web/app/admin/(cms)/experience/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-posts/{views/AdminPostsEditor.tsx,components/*,hooks/use-admin-post.hook.ts}`, `apps/web/src/modules/admin-about/{views/AdminAboutExperienceEditor.tsx,components/ExperienceForm/*}`.

**Design.** Mockup `admin-editor.html` (same shell).

**Acceptance.**
- [ ] A body containing `TODO` shows a publish-lint warning before saving.
- [ ] Creating a tag from the combobox adds it to the post.
- [ ] Signed in as `user`, both editors are read-only and send no writes.

**PR title:** `feat(web): post and experience editors`

#### T45 · Site settings + profile admin

**Roadmap** p22 · **Spec** [§5.10](../../design/portfolio-design-system.md#s-5-10), §1.5 (`Profile`, `SiteSettings`) · **Depends** T33, T42 · **Size** L

**Goal.** Edit site settings, navigation, social links, contact topics and the profile from the admin. Page sections are now blocks, edited in the page builder (T45b).

**Scope.**
- `app/admin/(cms)/site/page.tsx` → `admin-site/views/AdminSiteIndex.tsx` with URL-synced tabs: Settings (form: SEO defaults, footer note, contact intro, reply time, contact email, availability, analytics, ambient effects, marquee), Navigation (table, inline-editable label, `href` picker from `routes.constant.ts` or URL, move up/down), Social links (with `showInHeader`, `showInCta`), Contact topics.
- `app/admin/(cms)/profile/page.tsx` → `AdminSiteProfile`: headline + accent (live `AccentHeadline` preview, validation per locale), hero kicker, subheadline, bio (`MarkdownField`, `compact` toolbar), career start date, languages, city, timezone, private phone. Avatar and resume pickers come in T51.

**Files.** `apps/web/app/admin/(cms)/{site,profile}/page.tsx`, `apps/web/src/modules/admin-site/{views/{AdminSiteIndex,AdminSiteProfile}.tsx,components/{SettingsForm,NavTable,SocialTable,TopicsTable,ProfileForm}/*,hooks/*,services/*}`.

**Design.** Spec §5.10 wireframe. Tokens: `text-ui`, admin control sizes.

**Acceptance.**
- [ ] Renaming a nav item in the admin changes the public header (dev: immediately; production: after T52 revalidation).
- [ ] An accent that is not in the headline shows the field error for that locale.
- [ ] Nav and social reorder use the transactional order endpoint.

**PR title:** `feat(web): site and profile admin`

#### T45a · Schema-driven props form (zod → TanStack Form)

**Roadmap** p22 · **Spec** §4.6 (TanStack Form + zod), D26 · **Depends** T41, T42 · **Size** M

**Goal.** One component that draws an editable form from a zod schema, so a new block type needs no hand-written admin form.

**Scope.**
- `admin-core/utils/schema-to-fields.util.ts`: `z.toJSONSchema(schema, { io: 'input' })` → a field tree (`path`, `kind`, `required`, `min`/`max`, `enum`, `default`, `widget`, `label`). It reads the `.meta()` keys from T10a and supports objects, strings, numbers and integers, booleans, enums, arrays of objects or scalars, optional and default values. A shape it does not know throws in development and in tests, so a new schema cannot silently lose a field.
- `admin-core/components/SchemaForm/SchemaForm.tsx`: `useForm({ defaultValues, validators: { onChange: schema } })` (TanStack Form takes zod 4 directly through Standard Schema), one `form.Field` per leaf, server `fieldErrors` mapped with T42's `map-field-errors.util.ts`, and `readOnly` disables every widget.
- Widgets in `SchemaForm/widgets/`, chosen by `widget`, otherwise by type:
  - `text`, `textarea`, `number`, `switch`, `select` (enums);
  - `localized-text` and `localized-textarea`: EN and VI inputs side by side, like every admin editor, with a dot when VI is empty;
  - `markdown`: `MarkdownField` with the `compact` toolbar (T42);
  - `icon` (`IconPicker`, T41), `hue` (`HuePicker`), `route` (from `routes.constant.ts`);
  - `project`, `projects` (searchable multi-combobox that keeps the order, for `manual` lists), `stats`, `tag`.
  - Arrays get add, remove, and move up/down buttons.
- Labels and help text come from `en.json` `admin.blocks.*` through the `label` key. A unit test walks `BLOCK_REGISTRY` and fails on a missing key.
- Autosave: `SchemaForm` exposes `onValuesChange` for `use-autosave` (T42), so the builder saves a block 1.5s after typing stops.
- Tests: every type in `BLOCK_REGISTRY` renders a form with no unknown field; an invalid value shows the zod message; server `fieldErrors` land under the right input; `readOnly` renders no enabled input.

**Out of scope.** The page builder screen (T45b). Drag and drop in arrays (`SortableList`, T45b).

**Files.** `apps/web/src/modules/admin-core/{utils/schema-to-fields.util.ts,utils/schema-to-fields.util.test.ts,components/SchemaForm/{SchemaForm.tsx,SchemaForm.test.tsx,widgets/*}}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{switch,select,command,popover}.tsx`.

**Design.** Figma `18:2` properties pane (field look, 32px controls). Tokens: `text-ui`, `text-ui-meta`, `--input`, `--ring`, `--destructive`.

**Acceptance.**
- [ ] The browser and the API validate with the same zod schema: shared fixtures that the form accepts are accepted by T32a, and the ones it rejects get the same field errors from the API (roadmap p22).
- [ ] Every type in `BLOCK_REGISTRY` renders its form with all fields and labels (test).
- [ ] A server error on `props.primaryCta.label.en` shows under the English label input.
- [ ] With `readOnly`, no input is enabled.

**PR title:** `feat(web): schema-driven props form`

#### T45b · Page builder: blocks, drag and drop, layouts

**Roadmap** p22 · **Spec** §4.3, §4.6 (optimistic reorder), §5.10, D26 · **Depends** T33, T45a · **Size** L

**Goal.** In `/admin/pages`, an `admin` arranges each public page: drags blocks into order, adds, duplicates, hides and deletes them, picks a layout preset, and edits props in the generated form. A `user` sees the same screen read-only.

**Scope.**
- Dependencies (`packages/ui`): `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`, all MIT and free. Use the stable line (`core` 6.x, `sortable` 10.x), not the pre-1.0 `@dnd-kit/react`. `check:deps` (T42) also fails if any `@dnd-kit/*` package is not MIT.
- `packages/ui` `SortableList` (`'use client'`):
  - a vertical list on `DndContext` + `SortableContext`, with `PointerSensor` (a small activation distance, so clicks still work) and `KeyboardSensor` with `sortableKeyboardCoordinates`;
  - a drag-handle button with an accessible name, `restrictToVerticalAxis`, and a `DragOverlay`;
  - screen-reader `announcements` and `screenReaderInstructions` passed in as labels, and `onReorder(ids)`;
  - `disabled` items (the H1 block) cannot move, and nothing can be dropped above them.
  - Stories include the keyboard instructions.
- Routes `app/admin/(cms)/pages/page.tsx` → `admin-pages/views/AdminPagesIndex.tsx` (the five pages, block count, updated time) and `app/admin/(cms)/pages/[key]/page.tsx` → `AdminPagesEditor.tsx`. A "Pages" item joins the sidebar's Site group.
- `AdminPagesEditor` on `EditorShell` (T42), with the block list in the main column and the inspector in the properties pane:
  - `BlockList` (`SortableList`). Each `BlockRow` shows the drag handle, type icon and label, `key`, a layout badge, a visible `switch` (optimistic), and a row menu: Move up, Move down, Duplicate, and Delete with `alert-dialog`. Move up/down is the alternative to dragging for keyboard and single-pointer users (WCAG 2.5.7). An invalid or unknown block shows as an `alert` row with its issues and only Delete.
  - Reorder calls `PATCH /admin/pages/:key/blocks/order` with an optimistic update and rollback (T39 `optimistic.util.ts`). A failed reorder restores the list and shows a toast.
  - `AddBlockDialog`: a `command` list of the types allowed on this page, each with an icon and a one-line description. Types already at their `maxPerPage` are disabled, with the reason. The new block goes after the selected one.
  - `BlockInspector` tabs:
    - Props: `SchemaForm` for the type, autosaved per block with its `updatedAt`, plus `SaveStatus` and T42's Conflict actions on 409;
    - Layout: `LayoutPresetPicker`, a `toggle-group` of the type's presets with small column thumbnails, and the responsive rule underneath in `text-ui-meta`;
    - Appearance: `surface` plain or band, with the note that touching bands merge;
    - Anchor: the `key`, with its public URL `/#key`.
  - `PageSettingsSheet`: SEO title and description per locale.
  - Header: a "Draft" status and an "Open page" link (dev shows edits at once, D23). Publish, history and live preview come in T52a.
- `admin-pages/constants/block-editor-meta.constant.ts`: `type` → `{ icon, labelKey, descriptionKey }`, `satisfies Record<BlockType, …>` (rule 8).
- `services/admin-pages.service.ts`.
- `hooks/use-admin-page.hook.ts`: `useSuspenseQuery(qk.admin.pages.detail(key))`.
- `hooks/use-block-mutations.hook.ts`: add, update, duplicate, delete, reorder and toggle, each patching or invalidating the page query.
- Read-only (D7): no drag handles, no add, no write items in the row menu, and the inspector is `readOnly`. "Open page" still works.
- The spec §5.10 Sections tab lives here now; T45 no longer has one.

**Out of scope.** Publish, versions, live preview (T52a). Free-form grid placement and side-by-side blocks (Q13).

**Files.** `packages/ui/package.json`, `packages/ui/src/components/SortableList/{SortableList.tsx,SortableList.stories.tsx,SortableList.test.tsx}`, `apps/web/app/admin/(cms)/pages/{page.tsx,[key]/page.tsx}`, `apps/web/src/modules/admin-pages/{views/{AdminPagesIndex,AdminPagesEditor}.tsx,components/{BlockList,BlockRow,AddBlockDialog,BlockInspector,LayoutPresetPicker,PageSettingsSheet}/*,constants/block-editor-meta.constant.ts,hooks/{use-admin-page.hook.ts,use-block-mutations.hook.ts},services/admin-pages.service.ts}`, `apps/web/src/modules/admin-core/components/AdminSidebar/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `packages/ui/src/components/ui/{alert-dialog,toggle-group,sheet,tabs}.tsx` ([web STRUCTURE: modules](../../../apps/web/STRUCTURE.md#modules)).

**Design.** There is no Figma frame for this screen. Build it from the editor shell (`18:2`: the block list where the editor body is, the inspector in the properties pane) and the table rows of `15:2`, and attach screenshots to the PR for Parker's review. Tokens: `--card`, `--border`, `--sidebar-accent` (selected block), `--muted` (drag overlay), `--shadow-2`, `--destructive-subtle` and `--destructive` (invalid row), `--ring`, `text-ui`, `text-ui-meta`, admin control heights.

**Acceptance.**
- [ ] Dragging the `work` block above `featured`, with the mouse and with the keyboard (Space, arrows, Space), saves the new order in one transaction; the H1 block cannot be moved or dropped above (roadmap p22 "block editor list").
- [ ] A forced 500 on reorder restores the previous order (optimistic rollback test).
- [ ] Adding a `case-grid`, switching it to `TWO` and saving its props shows it on the public home in dev (D23), with two columns from 768px.
- [ ] A type at its limit is disabled in the add dialog, and the API refuses it anyway (T32a).
- [ ] Every action has a non-drag path (row menu), and a screen reader hears the pick-up, move and drop announcements.
- [ ] Signed in as `user`, the builder is read-only and sends no writes.
- [ ] `pnpm check:deps` passes with the dnd-kit packages.

**PR title:** `feat(web): page builder`

