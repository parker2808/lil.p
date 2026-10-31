<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T23 · Pipeline markdown + Prose + CodeBlock + công cụ hỗ trợ đọc); links re-pointed. Index: ../../PLAN.vi.md -->

#### T23 · Pipeline markdown + Prose + CodeBlock + công cụ hỗ trợ đọc

**Roadmap** p14 · **Spec** §3.2 (long-form, code), §4.1 (`Prose`, `CodeBlock`), §4.2 (`SectionNav`), §4.7 (`ContentProgress`, `RequirementColumns`), §5.4, §5.5, D3 · **Phụ thuộc** T11, T12 · **Cỡ** L

**Mục tiêu.** Một cách an toàn duy nhất để biến markdown đã lưu thành trang dễ đọc và accessible, cùng các công cụ hỗ trợ đọc dùng cho case study và post.

**Phạm vi.**
- Module `content` (chỉ chạy trên server): `services/markdown.service.ts` chạy `remark-parse` → `remark-gfm` → `remark-rehype` (không raw HTML) → `rehype-slug` → `rehype-sanitize` (schema dựng từ allowlist dùng chung bên dưới) → Shiki (một theme CSS-variables qua `createCssVariablesTheme`: màu token là `var(--shiki-token-*)`, nên light và dark đều lấy từ palette; comment ≥ 4.5:1; chỉ load `MARKDOWN_CODE_LANGUAGES`, ngôn ngữ khác render như text thường) → `hast-util-to-jsx-runtime`, map các element sang component của `packages/ui`. Alert kiểu GitHub (`> [!NOTE]`, `> [!WARNING]`) thành `Callout`. Không dùng `dangerouslySetInnerHTML`.
- Allowlist Markdown dùng chung (D25), danh sách duy nhất mà cả renderer này lẫn editor của admin (T42) tuân theo: `packages/contracts/src/constants/markdown.constant.ts` (`MARKDOWN_HEADING_LEVELS = [2, 3]`; `MARKDOWN_CALLOUT_KINDS = ['NOTE', 'WARNING']`; `MARKDOWN_CODE_LANGUAGES` = ts, tsx, js, jsx, json, bash, css, html, sql, prisma, yaml, md, diff, vue; `MARKDOWN_LINK_PROTOCOLS = ['http', 'https', 'mailto']` cộng với link tương đối `/…` và `#…`; image chỉ từ `/api/public/media/`) và `packages/contracts/src/common/markdown-url.util.ts` (`isAllowedMarkdownUrl`, `isAllowedImageSrc`). Các cấu trúc được phép: paragraph, H2/H3, bold, italic, strikethrough, inline code, link, bullet list và ordered list, blockquote, callout, fenced code có ngôn ngữ, horizontal rule, image có alt text, table GFM, hard break. Mọi thứ khác (raw HTML, H1, footnote, task list, embed) bị bỏ hoặc render như text thường. H1 trong Markdown đã lưu được render thành H2.
- Fixture trong `packages/contracts/src/fixtures/`: `markdown-kitchen-sink.fixture.ts` (mỗi cấu trúc được phép xuất hiện một lần) và `markdown-unsafe.fixture.ts` (`<script>`, `<iframe>`, một attribute `onerror`, một link `javascript:`, một image bên ngoài, một H1). T42 dùng lại cả hai.
- `packages/ui/src/styles/code-syntax.css` (được `globals.css` import): các biến `--shiki-foreground`, `--shiki-background` và `--shiki-token-*`, chỉ là alias của token palette (map mặc định: keyword → `--primary`, string → `--hue-jade`, constant → `--hue-amber`, function → `--hue-violet`, comment và punctuation → `--muted-foreground`, background → `--muted`; chỉnh trong phạm vi palette nếu check contrast fail). Highlighter của editor admin đọc cùng các biến này (T42).
- Util của `content`: `toc.util.ts` (h2/h3 → item TOC), `split-sections.util.ts` (tách một field markdown tại các heading `###`; dùng cho requirement column và decision card), `constants/shiki-theme.constant.ts`.
- `content/components/Markdown/Markdown.tsx` (server component).
- `packages/ui`: `Prose` (`prose` / `compact`; mọi rule long-form trong §3.2: 66ch, spacing, bullet `▹` thụt treo, link gạch chân, table scroll được trong một vùng focus được), `CodeBlock` (thanh filename, badge ngôn ngữ, nút copy có `aria-live`, scroll ngang focus được, toggle wrap), `Callout` (ô icon), `SectionNav` (sticky từ `lg+`, scroll-spy với `aria-current`, `<details>` trên mobile), `ContentProgress` (thanh `--primary` 2px, ẩn khi reduced motion), `RequirementColumns` (hai card, bullet `▹`), `DecisionCard` (title + prose compact), `TakeawaysCard` (`--primary-subtle`, bullet `▹`).
- Test: mọi cấu trúc của fixture kitchen-sink đều được render; không thứ gì từ fixture unsafe được render (`<script>`, HTML inline, link `javascript:`, image bên ngoài); heading có id; trích xuất TOC; util tách section.

**File.** `apps/web/src/modules/content/services/markdown.service.ts`, `apps/web/src/modules/content/utils/{toc.util.ts,split-sections.util.ts}` (+ test), `apps/web/src/modules/content/constants/shiki-theme.constant.ts`, `packages/contracts/src/constants/markdown.constant.ts`, `packages/contracts/src/common/markdown-url.util.ts` (+ test), `packages/contracts/src/fixtures/{markdown-kitchen-sink,markdown-unsafe}.fixture.ts`, `packages/ui/src/styles/{globals.css,code-syntax.css}`, `apps/web/src/modules/content/components/Markdown/Markdown.tsx`, `packages/ui/src/components/{Prose,CodeBlock,Callout,SectionNav,ContentProgress,RequirementColumns,DecisionCard,TakeawaysCard}/*`.

**Thiết kế.** Figma `10:2` (post), `4:2`/`5:2` (case study). Mockup `post.html`, `case-study.html`. Token: `text-prose`, `text-heading`, `text-subheading`, `text-meta`, `--measure`, `--muted`, `--subtle-foreground`, `--primary`, `--primary-subtle`, `--radius-lg`, `--font-mono`.

**Tiêu chí nghiệm thu.**
- [ ] Một mẫu markdown có `<script>`, attribute `onerror` và link `javascript:` không render ra cái nào trong số đó (test).
- [ ] Prose rộng ≤ 66ch ở 18px / 1.75; heading có anchor link.
- [ ] Code block scroll được bằng bàn phím, copy thông báo "Copied", và cả hai theme đạt contrast.
- [ ] TOC highlight section hiện tại khi scroll; trên mobile nó là một `<details>`.

**Tiêu đề PR:** `feat(web): markdown pipeline and prose`

#### T24 · Hoàn thiện Home v2

**Roadmap** p14 · **Spec** [§5.1](../../design/portfolio-design-system.vi.md#s-5-1), §5.0 (row home), §4.4, §4.5, §7.2 (`01`, `02`, `05`, `09`) · **Phụ thuộc** T14, T19, T20, T21, T22 · **Cỡ** L

**Mục tiêu.** Toàn bộ trang home dựng từ các block của home (D26), theo thứ tự, trạng thái hiển thị và layout của chúng, khớp với các frame home.

**Phạm vi.**
- Service (server, có tag): `projects/services/{projects,domains}.service.ts`, `about/services/skills.service.ts`, `home/services/process-steps.service.ts`, `notes/services/posts.service.ts`.
- Block type (quy tắc 8: definition + renderer + các entry trong registry):
  - `stat-band`: `StatBand`, ẩn nếu ít hơn 2 stat.
  - `tech-marquee`: `TechMarquee`, ẩn nếu rỗng, tĩnh nếu ít hơn 6 skill hoặc `marqueeEnabled` là false.
  - `featured-case`: `CaseCard` featured, ẩn nếu không có.
  - `domain-grid`: các `DomainCard`; card có 0 project bị ẩn.
  - `case-grid`: các `CaseCard` theo `source`. `manual` giữ thứ tự của `projectIds` và bỏ qua id bị thiếu hoặc chưa publish.
  - `process`: `FeatureCard` 2×2 từ principles + `ProcessFlow`, ẩn nếu ít hơn 3 bước.
  - `skill-groups`: `SkillGroup`.
  - `post-list`: các `PostCard`, với `limit` và một `tag` optional.
  - Hero có thêm `MigrationDiagram` trong aside khi `layout` là `SPLIT_7_5` và `showDiagram` bật.
- Các band của §5.1 đến từ giá trị `surface` đã seed: stats + marquee (một band dùng chung), domains, process. `SectionHeader` có eyebrow và ô icon ở mọi block có `heading`. `Reveal` khi scroll.
- Mỗi block nằm trong `SectionBoundary` với skeleton đúng hình block (Figma `21:2`) và lỗi inline có Retry; một block optional bị rỗng thì biến mất cùng anchor của nó.

**File.** `apps/web/src/modules/blocks/components/{StatBandBlock,TechMarqueeBlock,FeaturedCaseBlock,DomainGridBlock,CaseGridBlock,ProcessBlock,SkillGroupsBlock,PostListBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `apps/web/src/modules/blocks/components/HeroBlock/HeroBlock.tsx`, `packages/contracts/src/blocks/definitions/{stat-band,tech-marquee,featured-case,domain-grid,case-grid,process,skill-groups,post-list}.block.ts`, `packages/contracts/src/blocks/{block-registry.constant.ts,definitions/hero.block.ts}`, `apps/web/src/modules/home/services/process-steps.service.ts`, `apps/web/src/modules/projects/services/{projects,domains}.service.ts`, `apps/web/src/modules/about/services/skills.service.ts`, `apps/web/src/modules/notes/services/posts.service.ts`, `apps/web/i18n/locales/{en,vi}.json`.

**Thiết kế.** Figma `2:2`/`3:2` (1440 light/dark), `8:2` (390), `21:2` (loading). Mockup `home.html` (+ `?dark=1`, 390px), `home-skeleton.html`. Token: mọi token v2 (`--band`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), `text-display`, `text-title`, `text-heading`.

**Tiêu chí nghiệm thu.**
- [ ] Mọi text trên trang đều truy ra được một field API; `pnpm check:content` pass (roadmap p14).
- [ ] Thứ tự block theo `PageBlock.sortOrder`; ẩn block `marquee` trong Adminer thì nó biến mất (check v2 Day 7 trong spec §6).
- [ ] Đổi `layout` của block `work` sang `TWO` trong Adminer thì có 2 cột từ 768px; ở 390px mọi block là một cột.
- [ ] Ép endpoint của một block bị lỗi thì block đó hiện alert inline trong khi phần còn lại vẫn render.
- [ ] Lượt test chỉ dùng bàn phím: thứ tự Tab, focus nhìn thấy được, card mở bằng Enter (roadmap p14).
- [ ] Không có scroll ngang ở 390px; CLS 0 từ count-up và reveal.
- [ ] Screenshot ở 1440 light/dark và 390 được so với frame Figma; trạng thái loading so với `21:2`.

**Tiêu đề PR:** `feat(web): home v2 sections`

#### T25 · Trang About + Timeline

**Roadmap** p14 · **Spec** [§5.2](../../design/portfolio-design-system.vi.md#s-5-2), §4.2 (`Timeline`), §5.0 (row About) · **Phụ thuộc** T23, T24 · **Cỡ** L

**Mục tiêu.** Trang About dựng từ các block của about (D26): intro, dải stats, timeline experience, principles, skills, education và card CV, cộng một block `prose` tự do dùng được cho mọi page.

**Phạm vi.**
- Route `app/[locale]/(site)/about/page.tsx` → `about/views/AboutIndex.tsx`, view này render `BlocksPage` cho `about`.
- Service: `about/services/{experience,education,principles}.service.ts` (+ skills service đã có).
- Block type (quy tắc 8):
  - `about-intro` (H1): card avatar có city và pill availability; avatar hiện chữ cái đầu tên cho tới khi có media; bio qua `Markdown`.
  - `timeline`: `Timeline`.
  - `principle-list`, `education-list`.
  - `cv-download`: card download, ẩn khi `resumeEnId`/`resumeViId` còn trống; link hoạt động sau T51.
  - `prose`: một `body` Markdown tự do và một `aside` optional qua pipeline của T23, được phép trên mọi page; `SPLIT_8_4` đặt aside ở bên phải.
  - `stat-band` (`compact`) và `skill-groups` từ T24 được phép trên ABOUT.
- `Timeline` / `TimelineItem` trong `packages/ui`: thanh năm, row nhóm theo `company`, role, khoảng tháng bằng `<time datetime>`, label "now" cho `endDate` null (chrome), highlights trong một `accordion` (mở sẵn khi reduced motion), tech tag. `<ol>`.

**File.** `apps/web/app/[locale]/(site)/about/page.tsx`, `apps/web/src/modules/about/views/AboutIndex.tsx`, `apps/web/src/modules/blocks/components/{AboutIntroBlock,TimelineBlock,PrincipleListBlock,EducationListBlock,CvDownloadBlock,ProseBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/definitions/{about-intro,timeline,principle-list,education-list,cv-download,prose}.block.ts`, `packages/contracts/src/blocks/block-registry.constant.ts`, `apps/web/src/modules/about/services/{experience,education,principles}.service.ts`, `packages/ui/src/components/Timeline/*`, `packages/ui/src/components/ui/{accordion,avatar}.tsx`.

**Thiết kế.** Figma `7:2`. Mockup `about.html`. Token: `--band`, `--card`, `--border`, `--primary`, `text-title`, `text-subheading`, `text-prose`, `text-meta`.

**Tiêu chí nghiệm thu.**
- [ ] Công ty có hai role hiện thành một nhóm với hai item.
- [ ] Block optional bị ẩn hoặc rỗng thì biến mất cùng anchor; timeline rỗng hiện `empty`.
- [ ] Một block `prose` chứa fixture không an toàn của T23 không render item không an toàn nào.
- [ ] Trên `/vi`, các nhóm fallback mang `lang="en"` và badge "EN".
- [ ] Screenshot được so với `7:2`; có lượt test bàn phím.

**Tiêu đề PR:** `feat(web): about + timeline`

#### T26 · List project

**Roadmap** p14 · **Spec** [§5.3](../../design/portfolio-design-system.vi.md#s-5-3), §5.0 (row Projects list) · **Phụ thuộc** T14, T19, T20 · **Cỡ** M

**Mục tiêu.** List project có filter theo domain và tech lưu trong URL state, render trên server, khớp với frame Figma đã bind token hoàn toàn.

**Phạm vi.**
- Route `app/[locale]/(site)/projects/page.tsx` → `projects/views/ProjectsIndex.tsx`. URL param được parse bằng `projectListParamsSchema`.
- `ProjectsIndex` render `BlocksPage` cho `projects`, với `searchParams` trong `BlockContext`: `page-header` (T14), rồi block mới `projects-browser` (quy tắc 8; required, một cái mỗi page; props `showFeatured`, `pageSize`; layout `TWO` hoặc `THREE` cho grid), block này chứa list bên dưới.
- `DomainFilter` (pill có số đếm và chấm hue, là link thật `?domain=`; trên mobile scroll ngang với mép mờ dần), `TechFilter` (client island: combobox `popover` + `command` điều hướng tới `?skill=`), `CaseCard` featured dạng rộng, rồi tới grid 2 cột; `empty` có "Clear filters"; `pagination` khi số row nhiều hơn `pageSize`.

**File.** `apps/web/app/[locale]/(site)/projects/page.tsx`, `apps/web/src/modules/projects/views/ProjectsIndex.tsx`, `apps/web/src/modules/projects/components/{DomainFilter,TechFilter,ProjectsGrid}/*`, `apps/web/src/modules/blocks/components/ProjectsBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/projects-browser.block.ts,block-registry.constant.ts}`, `packages/ui/src/components/ui/{popover,pagination}.tsx`.

**Thiết kế.** Figma `13:2` (bind hoàn toàn: so sánh cả variable, không chỉ pixel). Mockup `projects.html`. Token: `--hue-*`, `--card`, `--border-strong`, `--shadow-2`, `text-title`, `text-body`, `text-meta`.

**Tiêu chí nghiệm thu.**
- [ ] `/en/projects?skill=nuxt` và `?domain=<slug>` filter trên server (spec §6 Day 12).
- [ ] Link filter domain hoạt động khi không có JavaScript.
- [ ] Screenshot được so với `13:2` ở light và dark, tại 1440 và 390.

**Tiêu đề PR:** `feat(web): projects list`

#### T27 · Case study của project

**Roadmap** p14 · **Spec** [§5.4](../../design/portfolio-design-system.vi.md#s-5-4), §5.0 (row Case study) · **Phụ thuộc** T23, T26 · **Cỡ** L

**Mục tiêu.** Trang case study theo thứ tự §5.4, generate tĩnh cho từng slug đã publish.

**Phạm vi.**
- Route `app/[locale]/(site)/projects/[slug]/page.tsx` → `projects/views/ProjectsDetail.tsx`; `generateStaticParams` từ các slug đã publish; `notFound()` khi gặp 404.
- Thứ tự: link quay lại → pill (domain, NDA, `VersionTag`) → H1 + tagline → grid meta với label eyebrow (client, role, team, period, stack) → cover 21:9 (placeholder cho tới T51) → `KeyFacts` → metric outcome dạng card `DiffStat` → các section có eyebrow: SUMMARY (problem), LIMITS (constraints), SCOPE (`RequirementColumns` từ `### Functional` / `### Non-functional`), HOW (approach), TRADE-OFFS (decisions tách tại `###` thành các `DecisionCard`), RESULT (outcome), RETRO (lessons) → `FactChips` → "More in <domain>" (2 `CaseCard`) → prev/next theo `sortOrder`.
- `SectionNav` sticky có chip stack và link live site (ẩn khi confidential); `ContentProgress`. Grid mờ chỉ ở vùng header.
- Label eyebrow là chuỗi chrome trong `i18n/locales`.

**File.** `apps/web/app/[locale]/(site)/projects/[slug]/page.tsx`, `apps/web/src/modules/projects/views/ProjectsDetail.tsx`, `apps/web/src/modules/projects/components/{CaseStudyHeader,CaseStudyMeta,CaseStudySections,OutcomeStats,RelatedProjects,PrevNext}/*`, `apps/web/src/modules/projects/services/projects.service.ts`, `packages/ui/src/components/ui/{breadcrumb,collapsible}.tsx`.

**Thiết kế.** Figma `4:2`/`5:2`. Mockup `case-study.html` (+ `?dark=1`). Token: `--grid-line`, `--hue-*`, `--primary-subtle`, `text-title`, `text-prose`, `text-eyebrow`, `--radius-xl`.

**Tiêu chí nghiệm thu.**
- [ ] Slug chưa publish hoặc không tồn tại trả về trang 404.
- [ ] Project confidential hiện NDA pill và không có link live/repo hay image.
- [ ] TOC và progress bar hoạt động; TOC trên mobile là một collapsible nằm dưới header.
- [ ] Screenshot được so với cả hai frame case study; có lượt test bàn phím.

**Tiêu đề PR:** `feat(web): project case study`

#### T28 · List note + post

**Roadmap** p14 · **Spec** [§5.5](../../design/portfolio-design-system.vi.md#s-5-5), §4.6 (island search notes) · **Phụ thuộc** T19, T20, T23 · **Cỡ** L

**Mục tiêu.** List note (trang đầu render trên server + search ở client) và trang post.

**Phạm vi.**
- Route `app/[locale]/(site)/notes/page.tsx` → `notes/views/NotesIndex.tsx`; `notes/[slug]/page.tsx` → `notes/views/NotesDetail.tsx` (`generateStaticParams`, `notFound()`).
- List: `NotesIndex` render `BlocksPage` cho `notes`: `page-header`, rồi block mới `notes-browser` (quy tắc 8; required; props `showFeatured`, `pageSize`) chứa `NotesSearch` (client: `role="search"`, debounce 200ms, đồng bộ URL `?q=&tag=`, số kết quả trong một live region, gợi ý `⌘K`), pill tag có số đếm từ `GET /public/tags`, các nhóm theo năm gồm các row `PostCard`, post featured dạng card rộng, `pagination`.
  - `notes/hooks/use-notes-search.hook.ts`: `useQuery(qk.public.posts(params))`, `placeholderData: keepPreviousData`, `initialData` = trang đầu từ server khi `q` rỗng, abort qua `signal`. `notes/services/posts-client.service.ts` dùng `apiClient`.
- Post: eyebrow `NOTE · #tag`, date · minutes bằng mono, tag, H1, body `Markdown`, `TakeawaysCard` (nếu có `takeaways`), `PostCard` prev/next, `SectionNav`, `ContentProgress`.
- `CommandPalette` public có thêm search post (cùng hook).

**File.** `apps/web/app/[locale]/(site)/notes/page.tsx`, `apps/web/app/[locale]/(site)/notes/[slug]/page.tsx`, `apps/web/src/modules/notes/views/{NotesIndex,NotesDetail}.tsx`, `apps/web/src/modules/notes/components/{NotesSearch,TagFilter,PostList,PostHeader,PostPrevNext}/*`, `apps/web/src/modules/blocks/components/NotesBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/notes-browser.block.ts,block-registry.constant.ts}`, `apps/web/src/modules/notes/hooks/use-notes-search.hook.ts`, `apps/web/src/modules/notes/services/{posts.service.ts,posts-client.service.ts}`, `apps/web/src/modules/core/components/CommandPalette/*`, `packages/ui/src/components/ui/input-group.tsx`.

**Thiết kế.** Figma `9:2` (list), `10:2` (post). Mockup `notes.html`, `post.html`. Token: `text-prose`, `text-subheading`, `text-meta`, `--primary-subtle`, `--measure`.

**Tiêu chí nghiệm thu.**
- [ ] Gõ vào ô search thì URL và kết quả cập nhật mà không reload toàn trang; request cũ bị abort (thấy trạng thái cancelled trong DevTools, spec §6 Day 9).
- [ ] "No results for …" hiện kèm action Clear; khi tắt JS, trang đầu render trên server vẫn hoạt động.
- [ ] URL của post draft trả 404.
- [ ] Screenshot được so với `9:2` và `10:2`; prose giữ 18px / 1.75 / 66ch.

**Tiêu đề PR:** `feat(web): public pages from api`

