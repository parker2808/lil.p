<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task); links re-pointed. Index: ../../PLAN.vi.md -->

## 7. Các task

Mỗi task dùng cùng một template: **Roadmap · Spec · Phụ thuộc · Cỡ**, rồi Mục tiêu, Phạm vi, Ngoài phạm vi, File, Thiết kế, Các bước backend, giải thích (chỉ với task backend), Tiêu chí nghiệm thu, Tiêu đề PR.

### M0 — Nền tảng

#### T01 · Scaffold monorepo, toolchain, CI tối thiểu

**Roadmap** p01 · **Spec** [§1.6](../../design/portfolio-design-system.vi.md#s-1-6), [§6](../../design/portfolio-design-system.vi.md#s-6) · **Phụ thuộc** không có · **Cỡ** S

**Mục tiêu.** Một pnpm workspace với layout cố định, config lint/format/TypeScript dùng chung, và một CI job mà mọi PR sau này đều phải pass.

**Phạm vi.**
- Root `package.json`: `"private": true`, `"packageManager": "pnpm@<pinned>"` (bật bằng `corepack enable`), `"engines": { "node": ">=22" }`, script `dev`, `lint`, `typecheck`, `test`, `build`, `format` chạy qua mọi workspace bằng `pnpm -r` (dùng `--if-present` để package rỗng vẫn pass).
- `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (`22`), `.editorconfig` (utf-8, lf, 2 space), `.gitignore` (`node_modules`, `.env`, `.next`, `dist`, `coverage`, `uploads`, `storybook-static`), `.npmrc` nếu cần.
- `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`), `eslint.config.mjs` (flat config, typescript-eslint, sort import), config Prettier.
- `README.md`: những thứ cần cài trước (Node 22, pnpm qua corepack, Docker Desktop, git) và các lệnh root từ [STRUCTURE.md](../../../STRUCTURE.md#root-commands).
- `.github/workflows/ci.yml`: checkout, `pnpm/action-setup`, `setup-node` 22 với pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (D16).

**Ngoài phạm vi.** Tạo các app hay package (T04, T05, T07, T09). Docker (T02).

**File.** Chỉ ở root: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `README.md`, `.github/workflows/ci.yml`. Giữ nguyên `STRUCTURE.md`, `apps/*/STRUCTURE.md` và `docs/` hiện có.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] `node -v` in ra 22.x; `pnpm -v` và `docker compose version` chạy được (roadmap p01).
- [ ] `pnpm install`, `pnpm lint`, `pnpm typecheck` exit 0 trên một bản clone mới.
- [ ] CI chạy trên PR và xanh.
- [ ] Commit message của squash-merge là `chore: init portfolio monorepo` (roadmap p01).

**Tiêu đề PR:** `chore: init portfolio monorepo`

#### T01a · Prettier, Husky, lint-staged, commitlint

**Roadmap** — (Parker, D27) · **Spec** — · **Phụ thuộc** T01 · **Cỡ** S

**Mục tiêu.** Một toolchain format và git hook ở root, phủ `apps/web`, `apps/api` và `packages/*` sau này mà không cần config theo từng app.

**Phạm vi.**
- Giữ `.prettierrc` và `eslint.config.mjs` ở root của T01. Thêm `prettier-plugin-tailwindcss` để sort class Tailwind khi T04 thêm chúng.
- `.prettierignore` cho lockfile, output build, uploads, Storybook static, file nội bộ của Husky, và snapshot thiết kế đã đóng băng.
- Script root `format` (`prettier --write .`) và `format:check` (`prettier --check .`) — một lệnh cho cả cây, không dùng `pnpm -r`.
- Husky v9 + script `prepare`. **pre-commit** → lint-staged (Prettier `--write` trên file staged `ts`/`tsx`/`js`/`json`/`md`/`css`/`yml`; ESLint `--fix` trên JS/TS). **commit-msg** → commitlint (conventional commit, cùng dạng với tiêu đề PR như `chore: …`). **pre-push** → `pnpm typecheck` (lưới an toàn tùy chọn).
- CI: thêm `pnpm format:check`.
- README + STRUCTURE.md: một mục ngắn cho người mới về các hook.

**Ngoài phạm vi.** Prettier/ESLint theo từng app. Docker (T02). Tạo app hay package (T04, T05, T07, T09).

**File.** Root: `package.json`, `pnpm-lock.yaml`, `.prettierrc`, `.prettierignore`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.github/workflows/ci.yml`, `README.md`, `STRUCTURE.md`, `docs/PLAN.md`, `docs/PLAN.vi.md`.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm format:check` exit 0.
- [ ] `pnpm lint` và `pnpm typecheck` vẫn exit 0.
- [ ] CI có `pnpm format:check` và xanh.
- [ ] Commit message không theo conventional bị hook commit-msg từ chối.
- [ ] Không có config Prettier/ESLint trong `apps/*` hay `packages/*`.

**Tiêu đề PR:** `chore: add prettier, husky and commitlint`

#### T02 · Docker Compose: MySQL 8.4 + Adminer

**Roadmap** p02 · **Spec** §1.6 · **Phụ thuộc** T01 · **Cỡ** S

**Mục tiêu.** Một MySQL local giữ được data qua các lần restart, cộng Adminer để nhìn vào bên trong, khởi động bằng một lệnh.

**Phạm vi.**
- `docker-compose.yml` gồm:
  - `db`: `mysql:8.4` (pin tag), `command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci`, env từ `.env`, `ports: ["127.0.0.1:3306:3306"]`, named volume `db-data:/var/lib/mysql`, `./infra/mysql/init:/docker-entrypoint-initdb.d:ro`, healthcheck `mysqladmin ping -h localhost`.
  - `adminer`: pin tag, `127.0.0.1:8080:8080`, `depends_on: db: condition: service_healthy`.
- `infra/mysql/init/01-dev-grants.sql`: cho app user quyền tạo và drop database, thứ mà shadow database của Prisma cần cho `migrate dev` (tránh lỗi P3014). Chỉ dùng cho dev.
- `.env.example` với các dòng `MYSQL_*` và `DATABASE_URL` từ §4 (password placeholder). `.env` vẫn bị git ignore.
- Root script `db:up`, `db:down`, `db:logs`. Section "Database" trong README.

**Ngoài phạm vi.** Test DB (T29), compose cho production (T58).

**File.** `docker-compose.yml`, `infra/mysql/init/01-dev-grants.sql`, `.env.example`, `package.json` (script), `README.md`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Image và container** (glossary §1.6). `mysql:8.4` là chương trình đã được đóng gói; `docker compose up` khởi động một bản đang chạy của nó. Pin tag để mọi người chạy cùng một version.
2. **Port mapping.** `127.0.0.1:3306:3306` nghĩa là "port 3306 trên laptop của mình, chỉ truy cập được từ chính laptop đó, đi tới port 3306 trong container". Bind vào `127.0.0.1` giữ DB không lộ ra mạng Wi-Fi của bạn.
3. **Volume.** `db-data` là một folder Docker giữ bên ngoài container. `docker compose down` xóa container nhưng không xóa volume, nên data vẫn còn. `docker compose down -v` xóa luôn volume (reset toàn bộ).
4. **Biến môi trường (environment variable).** Password nằm trong `.env`, không bao giờ vào git. `.env.example` cho biết có những key nào, với giá trị giả.
5. **Init script.** File trong `/docker-entrypoint-initdb.d` **chỉ chạy lần đầu tiên** volume được tạo. Nếu bạn đã có volume từ trước, hãy chạy lệnh grant trong `01-dev-grants.sql` bằng tay trong Adminer, hoặc reset bằng `down -v`.
6. **Healthcheck.** Compose ping MySQL cho tới khi nó trả lời, nên các service khác (hiện là Adminer, sau này là API ở T58) chỉ khởi động khi DB đã sẵn sàng.

**Tiêu chí nghiệm thu.**
- [ ] `docker compose up -d db` đạt `healthy` trong `docker compose ps` (roadmap p02).
- [ ] Tạo một table nháp trong Adminer, chạy `docker compose down` rồi `up`: table vẫn còn (roadmap p02). Drop nó sau đó.
- [ ] Adminer ở `http://localhost:8080` login được bằng user trong `.env`.
- [ ] `docker compose ps` cho thấy port được bind vào `127.0.0.1`.
- [ ] `SHOW VARIABLES LIKE 'character_set_server'` trả về `utf8mb4`.

**Tiêu đề PR:** `chore(infra): mysql via docker compose`

#### T03 · Ghi chú SQL viết tay (Parker)

**Roadmap** p03 · **Spec** §1.5, §1.6 · **Phụ thuộc** T02 · **Cỡ** S · **Người làm:** Parker (agent chỉ được soạn outline)

**Mục tiêu.** Học table, key và join bằng cách tự gõ SQL trước khi Prisma viết nó thay bạn.

**Phạm vi.**
- Mở MySQL shell: `docker compose exec db mysql -u app -p portfolio`.
- Tạo table nháp `profile` và `experience` (có foreign key `profile_id`), insert row, `SELECT … JOIN`, `UPDATE`, `DELETE`.
- Thử xóa một profile đang có experience: xem foreign key chặn lại (`RESTRICT`), rồi tạo lại với `ON DELETE CASCADE` và giải thích trong comment bạn sẽ chọn cách nào và vì sao.
- Drop các table nháp ở cuối để Prisma (T08) bắt đầu từ một database trống.

**File.** `docs/sql-notes.sql` (T34 cũng dùng file này cho ghi chú EXPLAIN).

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] Một query JOIN trả về các experience của một profile (roadmap p03).
- [ ] Hành vi của FK (bị chặn hay cascade) được giải thích trong `docs/sql-notes.sql` (roadmap p03).
- [ ] Database không còn table nháp nào.

**Tiêu đề PR:** `docs: sql fundamentals notes`

#### T04 · Design token + shadcn theme trong `packages/ui`

**Roadmap** p04 · **Spec** [§3](../../design/portfolio-design-system.vi.md#s-3), [§3.6](../../design/portfolio-design-system.vi.md#s-3-6), [§3.7](../../design/portfolio-design-system.vi.md#s-3-7), §4.0 · **Phụ thuộc** T01 · **Cỡ** M

**Mục tiêu.** Nguồn duy nhất cho mọi giá trị màu, font size, radius, shadow và motion, nối vào shadcn và Tailwind v4, kèm một test sẽ fail nếu token lệch khỏi design.

**Phạm vi.**
- Tạo `packages/ui` (`@portfolio/ui`): `package.json` có `exports` map (`./styles/globals.css`, `./components/*`, `./hooks/*`, `./utils/*`, `./lib/utils`), `tsconfig.json`, config Vitest.
- `src/styles/globals.css`: copy **nguyên văn** block §3.6 của spec (light `:root` + `.dark`) và mapping `@theme inline` của §3.7, gồm cả token v2 (`--band`, `--border-strong`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), 11 text size kèm line-height, radius, shadow, motion easing, thang z-index, `--container`, `--measure`, và các rule reduced-motion (§3.4). Thêm `@custom-variant dark (&:where(.dark, .dark *));`.
- `components.json` cho shadcn: style `new-york`, `rsc: true`, `tsx: true`, `baseColor: neutral`, `cssVariables: true`, css path `src/styles/globals.css`, alias `@portfolio/ui/components`, `@portfolio/ui/components/ui`, `@portfolio/ui/lib/utils`, `@portfolio/ui/hooks`.
- `src/lib/utils.ts`: `cn()` với `clsx` + `tailwind-merge`. Mở rộng group `font-size` của tailwind-merge với 11 size custom, nếu không `cn('text-title', 'text-primary')` sẽ bỏ mất một trong hai.
- `src/styles/globals.test.ts`: parse `:root` và `.dark` từ `globals.css` và so sánh mọi key trong `docs/design/colors.json` (58 token × 2 mode); assert 11 token text-size đều tồn tại.

**Ngoài phạm vi.** Font và web app (T05). Component (T12+). Storybook (T06).

**File.** `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/components.json`, `packages/ui/src/styles/globals.css`, `packages/ui/src/styles/globals.test.ts`, `packages/ui/src/lib/utils.ts`, `packages/ui/src/lib/utils.test.ts` ([STRUCTURE ở root: packages/ui](../../../STRUCTURE.md#package-layout-packagesui)).

**Thiết kế.** Figma page `0:1` (Cover & Foundations), variable Color Light/Dark, Spacing, Radius. Mockup `foundations.html`. Token: toàn bộ §3.6–3.7.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/ui test` pass; đổi bất kỳ mã hex nào trong `globals.css` sẽ làm nó fail.
- [ ] `cn('text-title', 'text-primary')` giữ cả hai class (unit test).
- [ ] Diff giữa `globals.css` và block trong spec chỉ khác nhau về format.

**Tiêu đề PR:** `feat(ui): design tokens and shadcn theme`

#### T05 · Next.js shell: font, theme toggle, type specimen

**Roadmap** p04 · **Spec** §3.1, §3.2, §3.4, §4.2 (`ThemeToggle`) · **Phụ thuộc** T04 · **Cỡ** M

**Mục tiêu.** Một app Next.js chạy được, load ba font, chuyển light/dark/system mà không bị nháy, và hiện một specimen page tạm thời để kiểm tra token và cách render tiếng Việt.

**Phạm vi.**
- Scaffold bằng `create-next-app` (TypeScript, App Router, ESLint, Tailwind v4, **không** `src/app`, import alias `@/*` → `src/*`) vào một folder tạm, rồi chuyển các file vào `apps/web`. Tool này từ chối folder không trống, và `apps/web/STRUCTURE.md` phải được giữ lại.
- `package.json` tên `@portfolio/web`; phụ thuộc `@portfolio/ui` (`workspace:*`); `next.config.ts` với `transpilePackages: ['@portfolio/ui', '@portfolio/contracts']`.
- `app/globals.css`: `@import "@portfolio/ui/styles/globals.css";` cộng `@source "../src";` và `@source "../../../packages/ui/src";` (Tailwind v4 không tự scan các workspace package).
- `apps/web/components.json` trỏ shadcn tới `packages/ui` (setup monorepo).
- Font trong `src/modules/core/utils/fonts.util.ts` qua `next/font/google`: Be Vietnam Pro 600/700, Inter (variable), JetBrains Mono 400/600; `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`; CSS variable `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` (file token map chúng sang `--font-heading`, `--font-sans`, `--font-mono`). Tắt ligature của font Mono.
- `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange`) và `ThemeToggle` (menu light / dark / system, `aria-pressed`). Thêm shadcn `dropdown-menu` (D21).
- `app/layout.tsx` + `app/page.tsx` tạm thời, render `CoreSpecimen`: 11 text size với QA string `Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`, swatch màu, một dải band, swatch hue, eyebrow. T11 sẽ xóa ba file này.
- Vitest + Testing Library trong `apps/web`; một test cho `ThemeToggle`.

**Ngoài phạm vi.** next-intl, data fetching, locale layout (T11). Component thật (T12+).

**File.** `apps/web/app/layout.tsx` (tạm thời), `apps/web/app/page.tsx` (tạm thời), `apps/web/app/globals.css`, `apps/web/next.config.ts`, `apps/web/components.json`, `apps/web/vitest.config.mts`, `apps/web/src/modules/core/utils/fonts.util.ts`, `apps/web/src/modules/core/components/Providers/ThemeProvider.tsx`, `apps/web/src/modules/core/components/ThemeToggle/ThemeToggle.tsx` (+ `.test.tsx`), `apps/web/src/modules/core/views/CoreSpecimen.tsx` (tạm thời), `packages/ui/src/components/ui/dropdown-menu.tsx` ([STRUCTURE của web](../../../apps/web/STRUCTURE.md)).

**Thiết kế.** Figma page `0:1`; text style `Public/*` và `Admin/*`. Mockup `foundations.html`. Token: `--font-*`, mọi text size, `--background`, `--foreground`, `--band`, `--hue-*`, `--primary`.

**Tiêu chí nghiệm thu.**
- [ ] Specimen ở `/` render ở light và dark, contrast AA đã được kiểm tra trong DevTools (roadmap p04).
- [ ] Font size khớp thang trong spec (`text-title`, `text-prose`, …) và dấu tiếng Việt trên QA string không bị cắt (roadmap p04).
- [ ] Reload ở dark mode không bị nháy sáng.
- [ ] Network panel cho thấy tối đa 5 file font.
- [ ] Khi bật `prefers-reduced-motion`, việc chuyển theme không có transition.

**Tiêu đề PR:** `feat(web): next shell, tokens, theme`

#### T06 · Storybook + story Foundations

**Roadmap** p04 (phần tiếp theo) · **Spec** §3, §3.2, §6 (Day 1–6) · **Phụ thuộc** T04 · **Cỡ** S

**Mục tiêu.** Một Storybook trong `packages/ui`, nơi mọi component được build và kiểm tra riêng lẻ, ở cả hai theme, có panel accessibility (D15).

**Phạm vi.**
- `@storybook/react-vite` trong `packages/ui`, `@storybook/addon-a11y`, `@storybook/addon-themes` (`withThemeByClassName`, light/dark).
- `.storybook/preview.tsx` import `globals.css` và một `fonts.css` chỉ dùng cho Storybook, load cùng ba font family từ các package `@fontsource` với subset `vietnamese` (next/font không chạy trong Storybook) và set các variable `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono`.
- Story Foundations: Colors (mọi token, cả hai mode, kèm contrast ratio của các cặp liệt kê ở §3.1), Typography (mỗi size trong 11 size đặt cạnh tên text style Figma của nó, ví dụ `Public/title · 48`, kèm QA string), Spacing & Radius & Shadows, Motion (easing, demo reduced-motion).
- Bước CI `pnpm --filter @portfolio/ui build-storybook`.
- Thêm `src/stories/foundations/` vào cây `packages/ui` trong `STRUCTURE.md` ở root (quy tắc 5).

**File.** `packages/ui/.storybook/main.ts`, `packages/ui/.storybook/preview.tsx`, `packages/ui/.storybook/fonts.css`, `packages/ui/src/stories/foundations/{Colors,Typography,Spacing,Motion}.stories.tsx`, `.github/workflows/ci.yml`, `STRUCTURE.md`.

**Thiết kế.** Figma page `0:1`; mockup `foundations.html`.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/ui storybook` khởi động được; mọi story Foundations render ở light và dark.
- [ ] Panel a11y cho thấy 0 violation trên các story Foundations.
- [ ] Storybook build được trong CI.

**Tiêu đề PR:** `chore(ui): storybook + foundations stories`

### M1 — API đầu tiên

#### T07 · NestJS app + health + config được validate

**Roadmap** p05 · **Spec** §1.6 · **Phụ thuộc** T01 · **Cỡ** M

**Mục tiêu.** Một NestJS app ở `:4000` với prefix `/api`, config fail ngay khi giá trị env sai, và `GET /api/health`.

**Phạm vi.**
- Scaffold bằng `nest new` (pnpm, strict) vào một folder tạm, rồi chuyển vào `apps/api` (giữ `apps/api/STRUCTURE.md`). Tên package `@portfolio/api`.
- `src/main.ts`: `setGlobalPrefix('api')`, `enableShutdownHooks()`, listen trên `API_PORT` / `API_HOST` (`127.0.0.1`, D9). **Không** `enableCors()` (D9).
- `src/config/`: `env.schema.ts` (zod: `NODE_ENV`, `API_PORT`, `API_HOST`, `WEB_ORIGIN`), `app-config.service.ts` (getter có type), `config.module.ts` (`@nestjs/config`, global, `validate: (raw) => envSchema.parse(raw)`, đọc `.env` ở root).
- `src/modules/health/`: `health.module.ts`, `health.controller.ts` (`GET /health` → `{ status: "ok" }`).
- Thay Jest bằng Vitest + `unplugin-swc` (decorator của Nest cần metadata do SWC tạo ra), test đầu tiên là `health.controller.spec.ts`.
- `apps/api/api.http` chứa request health. `pnpm dev` ở root giờ chạy song song web và api.

**Ngoài phạm vi.** Prisma (T08), error filter (T10).

**File.** `apps/api/package.json`, `apps/api/nest-cli.json`, `apps/api/tsconfig*.json`, `apps/api/vitest.config.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts,config.module.ts}`, `apps/api/src/modules/health/{health.module.ts,health.controller.ts,health.controller.spec.ts}`, `apps/api/api.http`, `.env.example` ([STRUCTURE của api](../../../apps/api/STRUCTURE.md)).

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Nest cho bạn những gì.** Một *module* gom một feature. Một *controller* map một URL tới một method. Một *service* chứa logic. Nest tự tạo các class này và truyền chúng cho nhau (*dependency injection*): bạn khai báo cần `AppConfigService` trong constructor và Nest sẽ đưa nó vào.
2. **Bootstrap (`main.ts`).** Tạo app từ `AppModule`, đặt `/api` trước mọi route, và bắt đầu listen. `127.0.0.1` nghĩa là chỉ máy của bạn gọi được nó, cho tới khi có guard (T36).
3. **Config.** Giá trị trong `.env` đều là string. Zod schema biến `API_PORT="4000"` thành số 4000 và dừng app ngay lúc khởi động nếu một giá trị bị thiếu hoặc sai, nên bạn không bao giờ phải debug một server mới được config một nửa.
4. **Health module.** `@Controller('health')` + `@Get()` = `GET /api/health`. Health check là thứ Docker và các uptime monitor sẽ gọi sau này (T58, T61).
5. **Thử nó.** `curl localhost:4000/api/health`, hoặc bấm "Send Request" trong `api.http`.
6. **Test nó.** File spec tạo controller và kiểm tra giá trị trả về. Vitest cần SWC vì Nest đọc type metadata của TypeScript lúc runtime.

**Tiêu chí nghiệm thu.**
- [ ] `curl localhost:4000/api/health` trả về `{"status":"ok"}` (roadmap p05).
- [ ] Set `API_PORT=abc` làm app dừng lúc khởi động với một lỗi zod dễ đọc.
- [ ] API không truy cập được qua IP LAN của máy.
- [ ] `pnpm --filter @portfolio/api test` xanh trong CI.

**Tiêu đề PR:** `feat(api): nest app + health`

#### T08 · Prisma: model layout site, migration đầu tiên, seed profile

**Roadmap** p06 · **Spec** [§1.5](../../design/portfolio-design-system.vi.md#s-1-5), §1.6 · **Phụ thuộc** T02, T07 (nên làm T03 trước) · **Cỡ** L

**Mục tiêu.** Năm table đầu tiên từ spec, được tạo bởi một migration bạn đọc được, được điền bởi một seed idempotent, và mọi service đều dùng được qua `PrismaService`.

**Phạm vi.**
- Cài Prisma (pin version). Nếu là Prisma 7+, thêm `prisma.config.ts` và MariaDB driver adapter (nó hỗ trợ MySQL) theo hướng dẫn của Prisma docs cho version đó.
- `prisma/schema.prisma` theo các quy ước ở §1.5 (`id` autoincrement, `createdAt`/`updatedAt`, cặp cột `En`/`Vi`, `sortOrder`/`isVisible`, `@@map` sang snake_case, `@db.Text` cho markdown):
  - `SiteSettings` (1 row): mọi field ở §1.5, gồm cả `ambientEffects`, `marqueeEnabled`; `ogImageId` tạm là `Int?` thường cho tới khi có media (T50 thêm relation).
  - `Profile` (1 row): mọi field ở §1.5, gồm cả `heroKicker{En,Vi}`, `headlineAccent{En,Vi}`, `phone` private; `avatarId`, `resumeEnId`, `resumeViId` tạm thời là `Int?` thường.
  - `NavItem`, `SocialLink` (có `showInHeader`, `showInCta`).
  - Cặp model của page (D26): `Page` (`key` là enum `PageKey` `@unique`; `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`) và `PageBlock` (`pageId` → `Page` với `onDelete: Cascade`, `type` `VarChar(48)`, `key` `VarChar(48)`, `schemaVersion Int @default(1)`, `props Json`, `layout` là enum `LayoutPreset`, `surface` là enum `BlockSurface` (`PLAIN` | `BAND`), `sortOrder`, `isVisible`; `@@unique([pageId, key])`, `@@index([pageId, sortOrder])`). `type` là string thường, không phải enum trong DB, nên một block type mới về sau không cần migration; T10a check nó với registry.
  - Enum `Availability`, `NavLocation`, `SocialKind`, `PageKey`, `LayoutPreset`, `BlockSurface`.
- Migration đầu tiên `pnpm prisma migrate dev --name init-site`.
- Seed (D13): `prisma/seed/seed.ts` đọc `SEED_PROFILE` (`demo` | `baseline`) và chạy `profiles/demo.seed.ts` hoặc `profiles/baseline.seed.ts`; row lấy từ `prisma/seed/data/site.data.ts`. Chỉ dùng giá trị placeholder: copy từ wireframe/mockup, `contactEmail: '<email>'`, `phone: '<phone>'`. Seed năm row `Page` và các block mặc định của chúng từ D18 (`prisma/seed/data/pages.data.ts`: `type`, `key`, `layout`, `surface`, `props` placeholder với text `{ en, vi }`). Upsert trên unique key để chạy hai lần cũng không thay đổi gì.
- `src/prisma/prisma.module.ts` (`@Global`) và `prisma.service.ts` (extends `PrismaClient`, connect khi module init).
- `GET /api/health` trả thêm `db: "ok"` sau khi chạy `SELECT 1`.
- Script `db:migrate`, `db:reset`, `db:seed`, `db:studio`.

**Ngoài phạm vi.** Các table content (T15+), public endpoint (T09).

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_init_site/`, `apps/api/prisma/seed/seed.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/prisma/seed/data/{site,pages}.data.ts`, `apps/api/prisma.config.ts` (Prisma 7+), `apps/api/src/prisma/{prisma.module.ts,prisma.service.ts}`, `apps/api/src/modules/health/health.controller.ts`.

**Thiết kế.** Các table "Site" và "About · Profile" ở spec §1.5; block mặc định của D18, D26.

**Các bước backend, giải thích.**
1. **ORM.** Prisma biến `schema.prisma` thành các table SQL và một client có type. Bạn viết `prisma.profile.findUnique({ where: { id: 1 } })` thay vì SQL, và TypeScript biết mọi cột.
2. **Quy ước schema.** Đọc table quy ước ở §1.5 trước. Hai cột cho mỗi text cần dịch (`headlineEn`, `headlineVi`) giúp mọi thứ nhìn thấy được trong Adminer; singleton là một table chỉ có một row, `id = 1`.
3. **Migration.** `migrate dev --name init-site` so sánh schema với DB và viết một file SQL trong `prisma/migrations/`. **Hãy mở ra và đọc nó**: bạn sẽ thấy `CREATE TABLE`, unique index trên `(page, key)`, và `utf8mb4`. File đó được commit và không bao giờ bị sửa (quy tắc 6). Nếu bạn gặp lỗi P3014, nghĩa là đang thiếu grant cho shadow database từ T02.
4. **Seed.** Một script điền dữ liệu vào DB trống. `upsert` (update-or-insert) giúp chạy lại nhiều lần vẫn an toàn. Có hai profile: `demo` cho dev và CI một site đầy đủ, `baseline` là dữ liệu ban đầu của production (D13).
5. **PrismaService.** Một connection dùng chung, được đăng ký làm global provider của Nest, nên service nào cũng có thể xin nó trong constructor thay vì tự mở connection riêng.
6. **Xem data.** `pnpm db:studio` mở Prisma Studio; dùng Adminer cũng được.
7. **Một cột JSON.** `PageBlock.props` là MySQL `JSON`: mỗi row có thể có shape riêng. Mở một row trong Adminer để xem. MySQL không check bên trong có gì; T10a thêm việc check đó trong code.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/api prisma migrate reset` tạo lại các table và seed chúng (roadmap p06).
- [ ] Prisma Studio hiện row trong SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock (roadmap p06, điều chỉnh theo D12).
- [ ] Chạy seed hai lần vẫn giữ nguyên số row.
- [ ] Mô tả PR tóm tắt SQL được generate.
- [ ] Dùng `rg` tìm pattern email/phone trong `apps/api/prisma` chỉ thấy `<email>` và `<phone>`.
- [ ] `GET /api/health` trả về `{"status":"ok","db":"ok"}`.

**Tiêu đề PR:** `feat(api): prisma schema + seed`

