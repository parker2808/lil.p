<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T42 · Editor shell + Tiptap MarkdownEditor + autosave); links re-pointed. Index: ../../PLAN.vi.md -->

#### T42 · Editor shell + Tiptap MarkdownEditor + autosave

**Roadmap** p22 · **Spec** [§5.9](../../design/portfolio-design-system.vi.md#s-5-9), §4.3 (`MarkdownEditor`, `SaveStatus`, `LocaleTabs`, `PropertyList`), §4.6 (Autosave), D25 · **Phụ thuộc** T39 · **Cỡ** L

**Mục tiêu.** Khung editor dùng chung cho mọi editor của entity: một rich-text editor Tiptap đọc và ghi Markdown, một toolbar dựng từ các phần của shadcn, một preview giống hệt renderer public, locale tab, pane properties, autosave có phát hiện conflict, dirty guard, và chế độ read-only cho `user`.

**Phạm vi.**
- **Dependency** (`packages/ui`, mọi `@tiptap/*` được pin cùng một version chính xác và nâng cấp cùng lúc, vì peer dependency của chúng đòi hỏi vậy): `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` (`Placeholder`, `CharacterCount`), `@tiptap/extension-code-block-lowlight` + `lowlight` + `highlight.js` (BSD-3-Clause, miễn phí), `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/suggestion` + `@floating-ui/dom`. Tất cả là MIT trừ highlight.js. Không có gì từ `@tiptap-pro/*` hay registry riêng của Tiptap (D25).
- **`scripts/check-deps.mjs`** + root script `check:deps`, chạy trong CI: fail nếu `pnpm-lock.yaml` chứa `@tiptap-pro/` hoặc `@tiptap-cloud/`, nếu có `.npmrc` nào trỏ tới `registry.tiptap.dev`, hoặc nếu một package `@tiptap/*` đã cài có `license` khác `MIT`.
- **`MarkdownEditor` trong `packages/ui`** (`'use client'`). Prop: `value` (Markdown), `onChange(markdown)`, `onBlur`, `editable`, `variant` (`full` | `compact`), `labels` (chuỗi chrome, vì `packages/ui` không có i18n), `renderPreview(markdown)` (slot do web điền), `onUploadImage?` (nối ở T51).
  - `useEditor({ extensions: createMarkdownExtensions(), content: value, contentType: 'markdown', editable, immediatelyRender: false })`. `immediatelyRender: false` là bắt buộc khi Next.js render trên server, nếu không hydration sẽ fail.
  - `extensions/create-markdown-extensions.ts` là schema của editor, và nó theo đúng allowlist của T23: `StarterKit.configure({ heading: { levels: MARKDOWN_HEADING_LEVELS }, underline: false, codeBlock: false, link: { openOnClick: false, autolink: true, isAllowedUri: isAllowedMarkdownUrl } })`, `Markdown`, `CodeBlockLowlight` (một instance `lowlight` chỉ đăng ký `MARKDOWN_CODE_LANGUAGES`), `Image` (`isAllowedImageSrc`, attribute `alt`), các extension Table, `Placeholder`, `CharacterCount`, cộng ba extension tự viết bên dưới. Không đăng ký gì nằm ngoài allowlist, nên HTML được paste vào sẽ bị schema của ProseMirror rút gọn về các node được phép, và HTML lạ trong Markdown vẫn chỉ là text thường.
  - `extensions/heading-clamp.extension.ts`: mở rộng `Heading` để H1 trong Markdown khi load trở thành H2, khớp với renderer public.
  - `extensions/callout.extension.ts`: một block node `callout` (`kind`: `NOTE` | `WARNING`) có `markdownTokenizer` cho `> [!NOTE]` / `> [!WARNING]` và `renderMarkdown` ghi lại đúng cú pháp đó; render qua `ReactNodeViewRenderer` với giao diện giống `Callout` public.
  - `extensions/slash-command.extension.ts`: `@tiptap/suggestion` trên `/`, liệt kê Heading 2, Heading 3, bullet list, ordered list, quote, Note, Warning, code block, image, table và divider; menu là `command` của shadcn trong một panel nổi.
  - Code block: một header `ReactNodeViewRenderer` có `select` ngôn ngữ (`MARKDOWN_CODE_LANGUAGES` + "Plain text") và cùng giao diện filename/ngôn ngữ như `CodeBlock` public. Màu highlight lấy từ `packages/ui/src/styles/editor.css`, file này map các class `.hljs-*` sang các biến `--shiki-token-*` của T23, nên lúc viết và lúc đọc dùng chung một palette. Chế độ Preview hiện đúng output Shiki.
  - Paste text thường trông như Markdown thì chèn vào dưới dạng Markdown (`insertContent(text, { contentType: 'markdown' })`), qua một `handlePaste` nhỏ trong `extensions/markdown-paste.extension.ts` nếu `@tiptap/markdown` không có sẵn option cho việc này.
  - Các chế độ trên `tabs` của shadcn: **Write** (editor), **Split** (editor và preview cạnh nhau trên `resizable`, từ `xl` trở lên), **Preview** (`renderPreview`, debounce 500ms), **Markdown** (`<pre>` chỉ đọc của `getMarkdown()`: chính xác thứ sẽ được lưu). Word count từ `CharacterCount` ở footer.
  - `editable: false`: toolbar, slash menu và xử lý paste/drop tắt, placeholder ẩn, `aria-readonly="true"`, link mở khi click. `useEffect` gọi `editor.setEditable(editable)` khi prop đổi.
  - Story: rỗng, fixture kitchen-sink, read-only, compact, dark.
- **Toolbar** (`MarkdownEditor/components/EditorToolbar`): `role="toolbar"` với roving focus bằng phím mũi tên, sticky ở đầu editor; mọi icon button có `tooltip` hiện shortcut trong `kbd`; các nhóm cách nhau bằng `separator` dọc. `variant="compact"` (highlights của experience, bio) chỉ hiện bold, italic, link và list; schema vẫn giữ nguyên, nên không mất nội dung nào đã lưu.

| Control | Phần của shadcn | Markdown nó ghi ra | Shortcut |
| --- | --- | --- | --- |
| Undo, redo | `button` (`ghost`, `sm`) | n/a | `Mod-Z`, `Shift-Mod-Z` |
| Loại block: Paragraph, Heading 2, Heading 3 | `dropdown-menu` | `## `, `### ` | `Mod-Alt-0/2/3` |
| Bold, italic, strikethrough, inline code | `toggle-group` (`multiple`, `aria-pressed`) | `**…**`, `*…*`, `~~…~~`, `` `…` `` | `Mod-B`, `Mod-I`, `Mod-Shift-S`, `Mod-E` |
| Link | `popover` + `input` + `button` (Apply, Remove); URL được check bằng `isAllowedMarkdownUrl` | `[text](url)` | `Mod-K` |
| Bullet list, ordered list, quote | `toggle` | `- `, `1. `, `> ` | `Mod-Shift-8/7/B` |
| Callout: Note, Warning | `dropdown-menu` | `> [!NOTE]`, `> [!WARNING]` | `/note`, `/warning` |
| Code block | `button`; `select` ngôn ngữ trong header của block | fenced block có ngôn ngữ | `Mod-Alt-C` |
| Image | `button` → `popover` (URL + alt bắt buộc) cho tới T51, sau đó là `dialog` media picker | `![alt](url)` | `/image` |
| Table | `dropdown-menu` (chèn 3×3, thêm/xóa row hoặc column, xóa table) | table GFM | `/table` |
| Chế độ | `tabs` (Write, Split, Preview, Markdown) | n/a | n/a |

- **Web `admin-core/components/MarkdownField`**: nối một field của TanStack Form với `MarkdownEditor`. Nó load editor bằng `next/dynamic` (`ssr: false`, có skeleton trong lúc load), nên Tiptap chỉ nằm trong chunk của admin. Nó truyền `labels` từ `admin.editor.*` trong `en.json`, `renderPreview` (gọi `content/actions/preview.action.ts`) và `editable={!readOnly}`.
- **Tích hợp autosave** (`hooks/use-autosave.hook.ts`):
  - Mỗi lần Tiptap `update`, `getMarkdown()` chạy với debounce 250ms rồi gọi `field.handleChange(markdown)`. Listener của form sau đó debounce 1.5s và gửi `PATCH` kèm `updatedAt`. Blur, chuyển locale tab và rời trang thì flush cả hai debounce ngay.
  - **Không save khi mở.** `@tiptap/markdown` có thể chuẩn hóa Markdown viết tay (ví dụ bullet `*` thành `-`). Ngay sau khi load, `MarkdownField` lưu `baseline = editor.getMarkdown()`, và field chỉ bị coi là dirty khi Markdown hiện tại khác baseline đó, chứ không so với chuỗi gốc trong DB.
  - **Thay đổi từ bên ngoài** ("Load latest" sau conflict 409, khôi phục bản copy offline, chuyển locale) gọi `editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })`, nhưng chỉ khi `value` khác Markdown được emit lần cuối, nên con trỏ không bao giờ nhảy khi đang gõ.
  - 409 → `SaveStatus` "Conflict" với "Load latest" / "Overwrite"; offline → chuỗi Markdown được giữ trong `localStorage` theo entity và locale. Không chỗ nào giữ JSON của editor.
- **Chế độ read-only** (D7): `readOnly` của `EditorShell` bằng true khi `useIsAdmin()` là false. Khi đó mọi `MarkdownField` nhận `editable: false`, các field khác bị disable, autosave và dirty guard tắt, slot publish bị ẩn, và header hiện badge "Read only". Mọi editor trong T43–T45 truyền prop này xuống.
- **`packages/ui`**: thêm `SaveStatus` (`Saving…`, `Saved 12s ago`, `Offline, changes kept locally`, `Conflict: newer version` với Load latest / Overwrite), `LocaleTabs` (EN/VI có chấm hoàn thiện), `PropertyList`.
- **`content`**: tách pipeline của T23 thành `markdown-to-hast` (server) và `hast-to-react.util.ts` (dùng chung); `content/actions/preview.action.ts` (Server Action trả HAST đã sanitize cho pane preview, dùng cùng sanitize schema và Shiki theme với các page public).
- **`admin-core`**: `EditorShell` (header có title, `SaveStatus`, slot publish; editor; pane properties 320px trên `lg`; cột live preview trên `2xl`; properties nằm trong `sheet`/`drawer` trên mobile), `hooks/use-dirty-guard.hook.ts`, `utils/map-field-errors.util.ts` (`ApiError.fieldErrors` → lỗi field của form).
- **Test**:
  - Round-trip của `MarkdownEditor` với fixture kitchen-sink của T23: load → `getMarkdown()` → load → `getMarkdown()` cho ra cùng một chuỗi, và mọi cấu trúc đều còn nguyên.
  - Fixture unsafe đi qua editor: output không có `<script>`, `<iframe>`, `onerror`, `javascript:` hay image bên ngoài, và không có H1.
  - Output đó của editor đi qua pipeline public thì render đủ mọi element của kitchen-sink.
  - Markdown của callout và ngôn ngữ của code block round-trip đúng.
  - Mở một document không làm nó bị dirty.
  - State machine của autosave, việc map field error, và chế độ read-only (không gửi `PATCH` nào, `editor.isEditable` là false).

**File.** `packages/ui/package.json`, `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,MarkdownEditor.stories.tsx,MarkdownEditor.test.tsx,components/{EditorToolbar,SlashMenu,LinkPopover,CodeBlockView,CalloutView}/*,extensions/{create-markdown-extensions.ts,heading-clamp.extension.ts,callout.extension.ts,slash-command.extension.ts,markdown-paste.extension.ts}}`, `packages/ui/src/styles/{globals.css,editor.css}`, `packages/ui/src/components/{SaveStatus,LocaleTabs,PropertyList}/*`, `packages/ui/src/components/ui/{tabs,resizable,drawer,toggle,toggle-group,tooltip,kbd,dropdown-menu,popover,command,select,separator}.tsx`, `apps/web/src/modules/content/{services/markdown.service.ts,utils/hast-to-react.util.ts,actions/preview.action.ts}`, `apps/web/src/modules/admin-core/{components/EditorShell/*,components/MarkdownField/*,hooks/use-autosave.hook.ts,hooks/use-dirty-guard.hook.ts,utils/map-field-errors.util.ts}`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `package.json`, `.github/workflows/ci.yml` ([root STRUCTURE: packages/ui](../../../STRUCTURE.md#package-layout-packagesui)).

**Thiết kế.** Figma `18:2`. Mockup `admin-editor.html` (toolbar `B I H1 H2 🔗 </> 🖼 callout [Split]`, slash menu). Các button "H1 H2" của mockup map sang Heading 2 và Heading 3, vì title của page là H1 duy nhất. Token:
- toolbar: nền `--card`, border dưới `--border`, control 28px (`sm`), `text-ui`, toggle đang bật `--accent` / `--accent-foreground`, focus `--ring`;
- menu và popover: `--popover`, `--shadow-2`, `--z-dropdown`, `--radius-md`;
- vùng viết: `Prose` (`text-prose`, `--measure`), để độ dài dòng khớp với page public; placeholder `--muted-foreground`; selection `--primary-subtle`;
- code block: `--muted`, `--font-mono`, `--shiki-token-*`; callout: `--info-subtle` (Note) và `--warning-subtle` (Warning);
- word count: `text-ui-meta`; trạng thái save: `--success`, `--warning`.

**Tiêu chí nghiệm thu.**
- [ ] Gõ `## `, `- ` hoặc một code fence thì thành block tương ứng, và tab Markdown hiện đúng Markdown đó; giá trị lưu trong DB là Markdown, không bao giờ là HTML hay JSON (D3).
- [ ] Fixture kitchen-sink round-trip không đổi, và fixture unsafe mất hết mọi thứ không được phép (test).
- [ ] Mở một item không bao giờ gây ra `PATCH`; autosave chạy 1.5s sau khi ngừng gõ và hiện `Saved …`; một lần save cũ hiện `Conflict` với cả hai action (có test).
- [ ] Rời trang khi còn thay đổi chưa save thì hỏi xác nhận.
- [ ] Login bằng `user`, editor mở ở chế độ chỉ đọc (`editable: false`, không có toolbar) và không gửi thao tác ghi nào.
- [ ] Output của preview dùng cùng pipeline đã sanitize và cùng Shiki theme với site public (fixture dùng chung).
- [ ] `pnpm check:deps` pass, và fail khi thêm một package `@tiptap-pro/` trên một branch thử.
- [ ] `next build` cho thấy First Load JS của các route public không tăng (Tiptap chỉ nằm trong chunk `/admin`).
- [ ] Kiểm tra toolbar bằng bàn phím: Tab tới toolbar đúng một lần, phím mũi tên di chuyển giữa các control, mọi control có accessible name và hiện shortcut.

**Tiêu đề PR:** `feat(web): editor shell + markdown editor`

#### T43 · Editor project

**Roadmap** p22 · **Spec** §5.9, §5.11 ("Card & facts"), §4.6 (field array của TanStack Form) · **Phụ thuộc** T42 · **Cỡ** L

**Mục tiêu.** Tạo và sửa project với mọi field của case study, metric, và một preview `CaseCard` live.

**Phạm vi.**
- Route `app/admin/(cms)/projects/new/page.tsx` và `projects/[id]/page.tsx` → `admin-projects/views/AdminProjectsEditor.tsx`.
- Tab: Content (title, tagline, sáu field markdown của case study cho mỗi locale, mỗi field là một `MarkdownField` (T42); chỉ mount editor của locale đang mở; Scope và Trade-offs hiện gợi ý "Use `###` headings to split into columns/cards", vì `split-sections.util.ts` của T23 tách theo H3), Card & facts (select domain, textarea key fact có bộ đếm 2–4 dòng, input fact chip tối đa 6, preview `CaseCard` live), Metrics (field array: label, before, after, value; reorder), SEO.
- Pane properties: status, slug, ngày tháng, featured, confidential, link tới experience, multi-combobox skill, version from/to, URL live/repo. Picker cover có ở T51; button publish ở T52.
- Autosave qua `use-autosave`; create xong thì redirect sang route edit.
- Read-only cho `user`: `AdminProjectsEditor` truyền `readOnly` cho `EditorShell`, mọi `MarkdownField` nhận `editable: false`, và field array của metric ẩn thêm, xóa và reorder.

**File.** `apps/web/app/admin/(cms)/projects/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-projects/{views/AdminProjectsEditor.tsx,components/{ProjectContentTab,ProjectCardFactsTab,ProjectMetricsTab,ProjectSeoTab,ProjectProperties}/*,hooks/use-admin-project.hook.ts}`, `packages/ui/src/components/ui/{calendar,popover,command}.tsx`.

**Thiết kế.** Figma `18:2` (đang mở tab Card & facts). Mockup `admin-editor.html`.

**Tiêu chí nghiệm thu.**
- [ ] Submit với title EN trống trả 400 và lỗi hiện trên input đó (roadmap p22).
- [ ] Chỉnh sửa hiện trên page public sau khi save (roadmap p22; sau T52 thì chỉ khi publish).
- [ ] Sửa trong hai tab thì tab thứ hai vào state Conflict.
- [ ] Login bằng `user`, cả sáu editor của case study đều chỉ đọc và page không gửi `PATCH` nào.
- [ ] Screenshot được so với `18:2`.

**Tiêu đề PR:** `feat(web): admin editors`

#### T44 · Editor post + experience

**Roadmap** p22 · **Spec** §5.9, §5.11 (takeaways) · **Phụ thuộc** T42 · **Cỡ** M

**Mục tiêu.** Editor cho post và experience trên shell dùng chung.

**Phạm vi.**
- Editor post (`AdminPostsEditor`): title, excerpt, body (`MarkdownField`, toolbar `full`) cho mỗi locale, textarea takeaways (≤ 5 dòng), multi-combobox tag có tạo mới, featured, field SEO; cảnh báo publish lint hiện inline, dùng `publishLint` từ contracts. Route `posts/new`, `posts/[id]`.
- Editor experience (`AdminAboutExperienceEditor`): company, URL, location, employment type, role, summary, highlights (`MarkdownField`, toolbar `compact`), ngày tháng chính xác tới tháng (`calendar`), skill. Route `experience/new`, `experience/[id]`.
- Cả hai editor truyền `readOnly` cho `EditorShell`, nên `user` nhận editor `editable: false`, input bị disable và không tạo được tag.

**File.** `apps/web/app/admin/(cms)/posts/{new,[id]}/page.tsx`, `apps/web/app/admin/(cms)/experience/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-posts/{views/AdminPostsEditor.tsx,components/*,hooks/use-admin-post.hook.ts}`, `apps/web/src/modules/admin-about/{views/AdminAboutExperienceEditor.tsx,components/ExperienceForm/*}`.

**Thiết kế.** Mockup `admin-editor.html` (cùng shell).

**Tiêu chí nghiệm thu.**
- [ ] Body có chứa `TODO` hiện cảnh báo publish lint trước khi save.
- [ ] Tạo tag từ combobox thì tag được thêm vào post.
- [ ] Login bằng `user`, cả hai editor đều chỉ đọc và không gửi thao tác ghi nào.

**Tiêu đề PR:** `feat(web): post and experience editors`

#### T45 · Admin cho site settings + profile

**Roadmap** p22 · **Spec** [§5.10](../../design/portfolio-design-system.vi.md#s-5-10), §1.5 (`Profile`, `SiteSettings`) · **Phụ thuộc** T33, T42 · **Cỡ** L

**Mục tiêu.** Sửa site settings, navigation, social link, contact topic và profile ngay từ admin. Section của page giờ là block, sửa trong page builder (T45b).

**Phạm vi.**
- `app/admin/(cms)/site/page.tsx` → `admin-site/views/AdminSiteIndex.tsx` với các tab đồng bộ theo URL: Settings (form: SEO mặc định, footer note, contact intro, thời gian reply, contact email, availability, analytics, ambient effect, marquee), Navigation (table, label sửa inline được, picker `href` từ `routes.constant.ts` hoặc URL, move up/down), Social links (có `showInHeader`, `showInCta`), Contact topics.
- `app/admin/(cms)/profile/page.tsx` → `AdminSiteProfile`: headline + accent (preview `AccentHeadline` live, validate theo từng locale), hero kicker, subheadline, bio (`MarkdownField`, toolbar `compact`), ngày bắt đầu sự nghiệp, ngôn ngữ, thành phố, timezone, phone private. Picker avatar và resume có ở T51.

**File.** `apps/web/app/admin/(cms)/{site,profile}/page.tsx`, `apps/web/src/modules/admin-site/{views/{AdminSiteIndex,AdminSiteProfile}.tsx,components/{SettingsForm,NavTable,SocialTable,TopicsTable,ProfileForm}/*,hooks/*,services/*}`.

**Thiết kế.** Wireframe spec §5.10. Token: `text-ui`, kích thước control admin.

**Tiêu chí nghiệm thu.**
- [ ] Đổi tên một nav item trong admin thì header public thay đổi (dev: ngay lập tức; production: sau revalidation của T52).
- [ ] Accent không nằm trong headline hiện field error cho đúng locale đó.
- [ ] Reorder nav và social dùng endpoint order có transaction.

**Tiêu đề PR:** `feat(web): site and profile admin`

#### T45a · Form props sinh từ schema (zod → TanStack Form)

**Roadmap** p22 · **Spec** §4.6 (TanStack Form + zod), D26 · **Phụ thuộc** T41, T42 · **Cỡ** M

**Mục tiêu.** Một component vẽ ra form sửa được từ một zod schema, để một block type mới không cần viết tay form admin nào.

**Phạm vi.**
- `admin-core/utils/schema-to-fields.util.ts`: `z.toJSONSchema(schema, { io: 'input' })` → một cây field (`path`, `kind`, `required`, `min`/`max`, `enum`, `default`, `widget`, `label`). Nó đọc các key `.meta()` từ T10a và hỗ trợ object, string, number và integer, boolean, enum, array gồm object hoặc giá trị đơn, giá trị optional và default. Một shape nó không biết sẽ throw khi development và trong test, để một schema mới không thể âm thầm làm mất một field.
- `admin-core/components/SchemaForm/SchemaForm.tsx`: `useForm({ defaultValues, validators: { onChange: schema } })` (TanStack Form nhận thẳng zod 4 qua Standard Schema), một `form.Field` cho mỗi lá, `fieldErrors` từ server được map bằng `map-field-errors.util.ts` của T42, và `readOnly` disable mọi widget.
- Widget trong `SchemaForm/widgets/`, chọn theo `widget`, nếu không có thì theo type:
  - `text`, `textarea`, `number`, `switch`, `select` (enum);
  - `localized-text` và `localized-textarea`: input EN và VI cạnh nhau, giống mọi editor trong admin, có một chấm khi VI trống;
  - `markdown`: `MarkdownField` với toolbar `compact` (T42);
  - `icon` (`IconPicker`, T41), `hue` (`HuePicker`), `route` (từ `routes.constant.ts`);
  - `project`, `projects` (multi-combobox có search, giữ nguyên thứ tự, cho list `manual`), `stats`, `tag`.
  - Array có các nút thêm, xóa, và move up/down.
- Label và help text lấy từ `admin.blocks.*` trong `en.json` qua key `label`. Một unit test đi qua `BLOCK_REGISTRY` và fail khi thiếu key.
- Autosave: `SchemaForm` expose `onValuesChange` cho `use-autosave` (T42), nên builder lưu một block 1.5s sau khi ngừng gõ.
- Test: mọi type trong `BLOCK_REGISTRY` render được form mà không có field lạ; một giá trị sai hiện message của zod; `fieldErrors` từ server nằm dưới đúng input; `readOnly` không render input nào còn enable.

**Ngoài phạm vi.** Màn hình page builder (T45b). Drag and drop trong array (`SortableList`, T45b).

**File.** `apps/web/src/modules/admin-core/{utils/schema-to-fields.util.ts,utils/schema-to-fields.util.test.ts,components/SchemaForm/{SchemaForm.tsx,SchemaForm.test.tsx,widgets/*}}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{switch,select,command,popover}.tsx`.

**Thiết kế.** Properties pane của Figma `18:2` (dáng field, control 32px). Token: `text-ui`, `text-ui-meta`, `--input`, `--ring`, `--destructive`.

**Tiêu chí nghiệm thu.**
- [ ] Browser và API validate bằng cùng một zod schema: các fixture dùng chung mà form chấp nhận thì T32a cũng chấp nhận, và những cái form từ chối thì API trả đúng các field error đó (roadmap p22).
- [ ] Mọi type trong `BLOCK_REGISTRY` render form với đủ field và label (test).
- [ ] Một lỗi server trên `props.primaryCta.label.en` hiện dưới input label tiếng Anh.
- [ ] Với `readOnly`, không input nào enable.

**Tiêu đề PR:** `feat(web): schema-driven props form`

#### T45b · Page builder: block, drag and drop, layout

**Roadmap** p22 · **Spec** §4.3, §4.6 (optimistic reorder), §5.10, D26 · **Phụ thuộc** T33, T45a · **Cỡ** L

**Mục tiêu.** Trong `/admin/pages`, một `admin` sắp xếp từng page public: kéo block vào đúng thứ tự, thêm, nhân bản, ẩn và xóa block, chọn layout preset, và sửa props trong form được generate. Một `user` thấy cùng màn hình đó ở chế độ read-only.

**Phạm vi.**
- Dependency (`packages/ui`): `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`, đều MIT và miễn phí. Dùng dòng stable (`core` 6.x, `sortable` 10.x), không dùng `@dnd-kit/react` còn dưới 1.0. `check:deps` (T42) cũng fail nếu có package `@dnd-kit/*` nào không phải MIT.
- `SortableList` trong `packages/ui` (`'use client'`):
  - một list dọc trên `DndContext` + `SortableContext`, với `PointerSensor` (khoảng cách kích hoạt nhỏ, để click vẫn hoạt động) và `KeyboardSensor` với `sortableKeyboardCoordinates`;
  - một button drag handle có accessible name, `restrictToVerticalAxis`, và một `DragOverlay`;
  - `announcements` và `screenReaderInstructions` cho screen reader được truyền vào dưới dạng label, và `onReorder(ids)`;
  - item `disabled` (block H1) không di chuyển được, và không gì thả được lên trên nó.
  - Story có hướng dẫn dùng bàn phím.
- Route `app/admin/(cms)/pages/page.tsx` → `admin-pages/views/AdminPagesIndex.tsx` (năm page, số block, thời gian update) và `app/admin/(cms)/pages/[key]/page.tsx` → `AdminPagesEditor.tsx`. Một item "Pages" được thêm vào nhóm Site của sidebar.
- `AdminPagesEditor` trên `EditorShell` (T42), với list block ở cột chính và inspector ở properties pane:
  - `BlockList` (`SortableList`). Mỗi `BlockRow` hiện drag handle, icon và label của type, `key`, một badge layout, một `switch` visible (optimistic), và một row menu: Move up, Move down, Duplicate, và Delete với `alert-dialog`. Move up/down là cách thay cho kéo thả dành cho người dùng bàn phím và một-con-trỏ (WCAG 2.5.7). Một block không hợp lệ hoặc không biết type hiện thành một row `alert` kèm issues của nó và chỉ có Delete.
  - Reorder gọi `PATCH /admin/pages/:key/blocks/order` với optimistic update và rollback (`optimistic.util.ts` của T39). Reorder fail thì list được khôi phục và hiện một toast.
  - `AddBlockDialog`: một list `command` gồm các type được phép trên page này, mỗi cái có icon và một dòng mô tả. Type đã chạm `maxPerPage` bị disable, kèm lý do. Block mới được đặt sau block đang chọn.
  - Các tab của `BlockInspector`:
    - Props: `SchemaForm` cho type, autosave theo từng block kèm `updatedAt` của nó, cộng `SaveStatus` và các action Conflict của T42 khi gặp 409;
    - Layout: `LayoutPresetPicker`, một `toggle-group` gồm các preset của type với thumbnail cột nhỏ, và luật responsive bên dưới bằng `text-ui-meta`;
    - Appearance: `surface` plain hoặc band, kèm ghi chú rằng các band chạm nhau sẽ gộp lại;
    - Anchor: `key`, kèm URL public `/#key` của nó.
  - `PageSettingsSheet`: SEO title và description theo từng locale.
  - Header: một status "Draft" và một link "Open page" (dev hiện thay đổi ngay, D23). Publish, history và live preview có ở T52a.
- `admin-pages/constants/block-editor-meta.constant.ts`: `type` → `{ icon, labelKey, descriptionKey }`, `satisfies Record<BlockType, …>` (quy tắc 8).
- `services/admin-pages.service.ts`.
- `hooks/use-admin-page.hook.ts`: `useSuspenseQuery(qk.admin.pages.detail(key))`.
- `hooks/use-block-mutations.hook.ts`: add, update, duplicate, delete, reorder và toggle, mỗi cái patch hoặc invalidate query của page.
- Read-only (D7): không drag handle, không add, không item ghi nào trong row menu, và inspector ở `readOnly`. "Open page" vẫn hoạt động.
- Tab Sections của spec §5.10 giờ nằm ở đây; T45 không còn tab đó.

**Ngoài phạm vi.** Publish, version, live preview (T52a). Đặt block tự do trên grid và block nằm cạnh nhau (Q13).

**File.** `packages/ui/package.json`, `packages/ui/src/components/SortableList/{SortableList.tsx,SortableList.stories.tsx,SortableList.test.tsx}`, `apps/web/app/admin/(cms)/pages/{page.tsx,[key]/page.tsx}`, `apps/web/src/modules/admin-pages/{views/{AdminPagesIndex,AdminPagesEditor}.tsx,components/{BlockList,BlockRow,AddBlockDialog,BlockInspector,LayoutPresetPicker,PageSettingsSheet}/*,constants/block-editor-meta.constant.ts,hooks/{use-admin-page.hook.ts,use-block-mutations.hook.ts},services/admin-pages.service.ts}`, `apps/web/src/modules/admin-core/components/AdminSidebar/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `packages/ui/src/components/ui/{alert-dialog,toggle-group,sheet,tabs}.tsx` ([STRUCTURE của web: module](../../../apps/web/STRUCTURE.md#modules)).

**Thiết kế.** Chưa có Figma frame cho màn hình này. Dựng nó từ editor shell (`18:2`: list block nằm ở chỗ body của editor, inspector ở properties pane) và các row table của `15:2`, rồi đính kèm screenshot vào PR để Parker review. Token: `--card`, `--border`, `--sidebar-accent` (block đang chọn), `--muted` (drag overlay), `--shadow-2`, `--destructive-subtle` và `--destructive` (row không hợp lệ), `--ring`, `text-ui`, `text-ui-meta`, chiều cao control của admin.

**Tiêu chí nghiệm thu.**
- [ ] Kéo block `work` lên trên `featured`, bằng chuột và bằng bàn phím (Space, phím mũi tên, Space), lưu thứ tự mới trong một transaction; block H1 không thể bị di chuyển hay bị thả lên trên (roadmap p22 "block editor list").
- [ ] Ép reorder trả 500 thì thứ tự cũ được khôi phục (test optimistic rollback).
- [ ] Thêm một `case-grid`, chuyển nó sang `TWO` và lưu props của nó thì nó hiện trên home public ở dev (D23), với hai cột từ 768px.
- [ ] Một type đã chạm giới hạn bị disable trong add dialog, và API vẫn từ chối nó (T32a).
- [ ] Mọi action đều có cách làm không cần kéo (row menu), và screen reader đọc được các thông báo nhấc lên, di chuyển và thả.
- [ ] Đăng nhập bằng `user` thì builder ở chế độ read-only và không gửi thao tác ghi nào.
- [ ] `pnpm check:deps` pass với các package dnd-kit.

**Tiêu đề PR:** `feat(web): page builder`

