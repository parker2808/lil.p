# Hệ thống thiết kế portfolio và UI spec (Parker)

Chỉ design và planning. Doc này là nguồn cho tab LAB của plan 30 ngày (`plans/study-plan-30d-redesign.md`): lab trở thành một project xuyên suốt, portfolio full-stack của Parker.

- Stack: Next.js App Router + TypeScript (`apps/web`) với **shadcn/ui** (Radix + Tailwind v4) và **TanStack** Query, Table, Form và Virtual; NestJS (`apps/api`); MySQL 8 trong Docker Compose; **Prisma** là ORM duy nhất; server-side session cho auth; shared zod schema, type và query key trong `packages/contracts`; component trong `packages/ui`.
- Nguyên tắc: typography first (3.2); không hard-code content, mọi thứ hiện trên UI đều đến từ API/CMS (1.5, 4.5); quyết định backend được giải thích cho backend beginner và build từ dưới lên (1.6, 6).
- Bản sửa v2: sau khi review mockup v1 ("quá trần"), lớp visual được làm dày hơn, lấy [longpham.tech](https://www.longpham.tech/) làm reference: phân tích ở 2.1–2.2, token mới ở 3.1–3.1b, motion ở 3.4, component ở 4.7, wireframe ở 5.1–5.6, phần thêm cho admin ở 5.11, rebuild brief ở 7.
- Source: CV của Parker (đã cũ, ghi "4+ years"; hiện anh có ~5 năm với Vue/Nuxt/TypeScript).
- Privacy: thông tin liên hệ là `<email>` / `<phone>` ở mọi nơi, kể cả seed và fixture. Bản thân file CV không được commit.
- **§ refs:** Heading là `<h2 id="s-N">N. Title</h2>` (chapter) và `<h3 id="s-N-M">N.M Title</h3>` (section; cho phép hậu tố chữ, ví dụ `3.1b`). `§1.5` map tới heading có text bắt đầu bằng `1.5 `, và tới HTML id tường minh `s-1-5` (`s-` + chữ/số, `.` → `-`). Ưu tiên `#s-1-5` hơn GitHub auto-slug, vì auto-slug bỏ dấu chấm (`15-content-model-dbcms`).

---


> **Agents:** this is the short index. Read only the piece you need.

Full content is split, verbatim, into `docs/design/archive/design-system-vi/`. Search it with `rg` and open only the piece you need.

- [1. Phân tích CV](archive/design-system-vi/01-1-phan-tich-cv.md)
- [2. Hướng design](archive/design-system-vi/02-2-huong-design.md)
- [3. Design tokens](archive/design-system-vi/03-3-design-tokens.md)
- [4. Components và layout](archive/design-system-vi/04-4-components-va-layout.md)
- [5. UI spec từng page](archive/design-system-vi/05-5-ui-spec-tung-page.md)
- [5. UI spec từng page / 5.4 Project case study `/[locale]/projects/[slug]` (v2)](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md)
- [6. Map ngày Lab (high level)](archive/design-system-vi/07-6-map-ngay-lab-high-level.md)
- [7. Brief để rebuild mockup (v2)](archive/design-system-vi/08-7-brief-de-rebuild-mockup-v2.md)

<details><summary>Old section links</summary>

<a id="s-3"></a>[s-3](archive/design-system-vi/03-3-design-tokens.md#s-3) ·
<a id="s-6"></a>[s-6](archive/design-system-vi/07-6-map-ngay-lab-high-level.md#s-6) ·
<a id="s-1-5"></a>[s-1-5](archive/design-system-vi/01-1-phan-tich-cv.md#s-1-5) ·
<a id="s-1-6"></a>[s-1-6](archive/design-system-vi/01-1-phan-tich-cv.md#s-1-6) ·
<a id="s-3-2"></a>[s-3-2](archive/design-system-vi/03-3-design-tokens.md#s-3-2) ·
<a id="s-3-6"></a>[s-3-6](archive/design-system-vi/03-3-design-tokens.md#s-3-6) ·
<a id="s-3-7"></a>[s-3-7](archive/design-system-vi/03-3-design-tokens.md#s-3-7) ·
<a id="s-4-0"></a>[s-4-0](archive/design-system-vi/04-4-components-va-layout.md#s-4-0) ·
<a id="s-4-1"></a>[s-4-1](archive/design-system-vi/04-4-components-va-layout.md#s-4-1) ·
<a id="s-4-2"></a>[s-4-2](archive/design-system-vi/04-4-components-va-layout.md#s-4-2) ·
<a id="s-4-3"></a>[s-4-3](archive/design-system-vi/04-4-components-va-layout.md#s-4-3) ·
<a id="s-4-5"></a>[s-4-5](archive/design-system-vi/04-4-components-va-layout.md#s-4-5) ·
<a id="s-4-6"></a>[s-4-6](archive/design-system-vi/04-4-components-va-layout.md#s-4-6) ·
<a id="s-4-7"></a>[s-4-7](archive/design-system-vi/04-4-components-va-layout.md#s-4-7) ·
<a id="s-5-1"></a>[s-5-1](archive/design-system-vi/05-5-ui-spec-tung-page.md#s-5-1) ·
<a id="s-5-2"></a>[s-5-2](archive/design-system-vi/05-5-ui-spec-tung-page.md#s-5-2) ·
<a id="s-5-3"></a>[s-5-3](archive/design-system-vi/05-5-ui-spec-tung-page.md#s-5-3) ·
<a id="s-5-4"></a>[s-5-4](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-4) ·
<a id="s-5-5"></a>[s-5-5](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-5) ·
<a id="s-5-6"></a>[s-5-6](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-6) ·
<a id="s-5-7"></a>[s-5-7](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-7) ·
<a id="s-5-8"></a>[s-5-8](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-8) ·
<a id="s-5-9"></a>[s-5-9](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-9) ·
<a id="s-5-10"></a>[s-5-10](archive/design-system-vi/06-5-ui-spec-tung-page-5-4-project-case-study-locale-.md#s-5-10) ·

</details>
