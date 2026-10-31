<!-- Archived verbatim from docs/plans/ui-redesign.md (Tóm tắt (Tiếng Việt)); links re-pointed. Index: ../../plans/ui-redesign.md -->

## Tóm tắt (Tiếng Việt)

**Phạm vi.** Chỉ làm frontend: thiết kế lại giao diện trang public và admin CMS trên API và dữ liệu hiện có. Không đổi NestJS, Prisma, schema, API hay migration. Ý tưởng nào cần backend được gom vào mục [§11 Tương lai, ngoài phạm vi](13-11-future-out-of-scope-needs-backend.md#11-future-out-of-scope-needs-backend). Mọi nội dung đều lấy từ API/admin; nhãn giao diện đi qua next-intl (EN/VI). Giữ nguyên Tiptap. Chỉ dùng hạ tầng miễn phí (Vercel, Render free, TiDB, Cloudinary).

**Hướng thiết kế public, “Ink & Signal”.** Trang public là nơi nhà tuyển dụng xem, nên nó phải tự chứng minh tay nghề frontend senior. Phong cách mang tính biên tập: nền giấy ấm, mực đậm, một màu nhấn đỏ cam (“signal”), chữ IBM Plex Sans biến thiên (wght/wdth) cỡ rất lớn, và nhãn meta bằng Plex Mono. Chuyển động dày nhưng có kỷ luật:

- animation theo cuộn bằng CSS thuần (`animation-timeline`), count-up chỉ bằng CSS (`@property`)
- tiêu đề đổi độ đậm/độ rộng khi cuộn, thẻ dự án xếp chồng sticky, quy trình được ghim
- View Transitions giữa các trang (ảnh bìa bay sang trang chi tiết), đổi theme bằng hiệu ứng lan tròn
- shader WebGL2 ở hero (lazy, dừng khi khuất, có poster tĩnh), con trỏ theo chuột, nút “nam châm”, thẻ nghiêng nhẹ

Tất cả là tăng cường lũy tiến: tôn trọng `prefers-reduced-motion` và Save-Data, nội dung đầy đủ khi không có JS, và không được làm tụt Lighthouse so với hiện tại.

**Admin theo trang KB của interview-fe.**

- màu teal của KB, ánh xạ sang tên biến shadcn
- bố cục 3 cột `h-dvh`: trang không cuộn, mỗi cột tự cuộn
- top bar cố định, nhóm menu đánh số La Mã, mục đang chọn nền `accent-soft` + viền trái
- bảng lệnh kiểu DocSearch (⌘K, tìm không dấu), drawer cho mobile
- bảng chỉ cuộn ngang trong chính nó, và thành thẻ ở ≤ 639px

**Quyết định đã chốt.**

- IBM Plex Sans + IBM Plex Mono cho cả public và admin, có subset `vietnamese`. Dưới `:lang(vi)` tiêu đề nới line-height để dấu chồng (Ở, Ẫ, Ữ) không bị cắt.
- Bo góc: `--radius` = 10px là gốc, kèm một thang theo kích thước kiểu Apple (4 · 6 · 8 · **10** · 14 · 20 · 28 · full).
- Góc liền mạch dùng `corner-shape: squircle` khi trình duyệt hỗ trợ (thang nhân `--k: 1.5` để khớp thị giác). Trình duyệt chưa hỗ trợ dùng `border-radius` thường.
- Quy tắc đồng tâm: bán kính trong = bán kính ngoài − padding.

**Trạng thái tải (loading) ở mọi nơi.** Bản hiện tại gần như không có hiệu ứng tải: chưa có `loading.tsx`, skeleton chỉ là khối xám chung chung, không có thanh tiến trình khi chuyển trang. Kế hoạch bổ sung một hệ thống tải hoàn chỉnh cho cả public và admin (xem [§7.9](09-7-per-page-designs.md#79-loading-states-public--admin--loadinghtml-admin-loadinghtml), mockup `loading.html` và `admin-loading.html`):

- skeleton bám đúng bố cục từng trang/khối (cùng grid, tỉ lệ ảnh, chiều cao dòng `1lh`), nên khi dữ liệu về không bị nhảy layout (CLS ≤ 0.02)
- hiệu ứng shimmer chỉ dùng `transform`, tắt hẳn khi `prefers-reduced-motion`; skeleton chỉ hiện sau 100ms để phản hồi nhanh không bị nháy
- `loading.tsx` cho từng route và Suspense cho từng block/panel; TanStack Query: `isPending` → skeleton, `isFetching` → thanh mảnh giữ dữ liệu cũ (`keepPreviousData`), cập nhật lạc quan có hoàn tác
- nút/form đang gửi: giữ nguyên độ rộng, spinner, `aria-busy`, chặn gửi hai lần, thông báo qua live region
- thanh tiến trình chuyển trang 2px (dùng `useLinkStatus`, chỉ hiện nếu chờ quá 120ms)
- ảnh: giữ chỗ theo width/height, ảnh mờ LQIP lấy từ Cloudinary (`w_32,e_blur,q_1`, chỉ đổi URL ở frontend), rồi hiện dần ảnh thật
- màn mở đầu “ink curtain” cho lần vào đầu tiên của phiên: ≤ 700ms, không chặn thao tác, bỏ qua khi giảm chuyển động

**8 quy tắc bố cục của Parker** được áp dụng cho cả hai phía (xem [§3](05-3-parker-s-layout-rules-how-each-surface-complies.md#3-parkers-layout-rules--how-each-surface-complies)). Riêng trang public là trang cuộn tài liệu, nên quy tắc 1–2 chỉ áp dụng cho màn hình chia cột. Trình đọc bài Notes dùng 3 cột kiểu KB ở ≥ 1024px. Đây là câu hỏi mở cho Parker.

**Kế hoạch triển khai** gồm 17 PR nối tiếp (stacked), R1 → R16 cộng R4b, mỗi PR có tiêu chí nghiệm thu và test (Vitest, Storybook, Playwright + axe, Lighthouse). Từ R5 trở đi, mỗi PR trang đều có mục “Loading” riêng với skeleton của trang đó và test không nhảy layout:

| PR  | Nội dung                                                                                           |
| --- | -------------------------------------------------------------------------------------------------- |
| R1  | Token + font                                                                                       |
| R2  | Sửa lỗi dữ liệu hiển thị (block rỗng, TODO, tiêu đề lặp, Reveal ẩn nội dung)                       |
| R3  | Header/footer public                                                                               |
| R4  | Bộ component public                                                                                |
| R4b | Nền tảng trạng thái tải: Skeleton/shimmer, nút loading, FetchBar, ảnh LQIP, công cụ test CLS       |
| R5  | Các block trang chủ (+ skeleton trang chủ)                                                         |
| R6  | Shader hero                                                                                        |
| R7  | Lớp vi tương tác                                                                                   |
| R8  | Chuyển trang, thanh tiến trình route, màn mở đầu                                                   |
| R9  | Projects + case study (+ skeleton, giữ dữ liệu cũ khi lọc)                                         |
| R10 | About + contact (+ trạng thái gửi form)                                                            |
| R11 | Notes + trình đọc (+ skeleton 3 cột)                                                               |
| R12 | Admin shell (KB) (+ thanh tiến trình teal, skeleton trong bảng lệnh)                               |
| R13 | Bảng + dashboard admin (+ skeleton KPI/bảng, thanh refetch, cập nhật lạc quan)                     |
| R14 | Editor, page builder, media, inbox (+ skeleton editor, trạng thái lưu/xuất bản, tiến trình upload) |
| R15 | Kiểm thử hiệu năng/a11y và tài liệu (+ quét CLS/loading toàn site)                                 |
| R16 | Thư viện Figma (tuỳ chọn)                                                                          |

**Cách xem.** Mở `docs/design/redesign/index.html` trong trình duyệt (thêm `?dark=1` để xem giao diện tối; `home.html?intro=1` để xem màn mở đầu; `admin-loading.html?state=dashboard|table|editor|states` cho các trạng thái tải của admin). Ảnh chụp nằm trong `docs/design/redesign/screenshots/`, ảnh “trước” trong `screenshots/before/`.

---

