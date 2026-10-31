# Deploy (Vercel + Render + TiDB + Cloudinary)

Hosting **miễn phí** lâu dài (PLAN D28). Site public và admin chạy trên
Vercel. API Nest chạy trên Render (free web service). MySQL nằm trên
**TiDB Cloud Serverless**. Ảnh nằm trên Cloudinary (T50). MySQL Docker
local không đổi.

Không commit secret. Tạo JWT bằng `openssl rand -base64 48`
([runbooks/secrets.md](./runbooks/secrets.md)).

## 1. TiDB Cloud Serverless

1. Tạo cluster Serverless miễn phí (tương thích MySQL).
2. Tạo database (ví dụ `portfolio`).
3. Copy connection string. Thêm `?sslaccept=strict&ssl=true` nếu chưa có.
   TiDB bắt buộc TLS; adapter MariaDB của Prisma 7 đọc các flag này từ
   `DATABASE_URL`.
4. Các file migrate dùng `utf8mb4_unicode_ci`, `JSON`, foreign key và
   index — không có `FULLTEXT`, generated column, hay `CHECK`. Tương
   thích TiDB.

Entrypoint của API giữ nguyên `DATABASE_URL` nếu đã được set (giữ query
SSL). `compose.prod.yml` local vẫn tự ghép URL từ `MYSQL_*` khi
`DATABASE_URL` trống.

## 2. Cloudinary

1. Tạo tài khoản Cloudinary miễn phí.
2. Copy **Cloud name**, **API Key**, **API Secret**.
3. API không ghi file lên disk (T50). Để trống các key này chỉ khi chạy
   local/CI (storage trong bộ nhớ).

## 3. Render (API)

`render.yaml` ở root là Blueprint: một web service Docker free, health
check `GET /api/health`, `prisma migrate deploy` trong entrypoint, rồi
`node dist/main.js`. Process listen `0.0.0.0:$PORT`.

1. Render Dashboard → **New → Blueprint**, chọn repo này.
2. Điền các env `sync: false` (không commit):

   | Key                                             | Ghi chú                                                                    |
   | ----------------------------------------------- | -------------------------------------------------------------------------- |
   | `DATABASE_URL`                                  | URL TiDB + `sslaccept=strict&ssl=true`                                     |
   | `WEB_ORIGIN`                                    | Origin Vercel, ví dụ `https://your-app.vercel.app`                         |
   | `WEB_INTERNAL_URL`                              | Cùng origin Vercel (API POST revalidate)                                   |
   | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`      | Hai giá trị `openssl rand -base64 48` khác nhau                            |
   | `REVALIDATE_SECRET`                             | Trùng với Vercel                                                           |
   | `ANALYTICS_SALT_SECRET`                         | Tùy chọn                                                                   |
   | `CLOUDINARY_*`                                  | Từ bước 2                                                                  |
   | `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` | Chỉ để seed lần đầu; trong git vẫn là `<email>`                            |
   | `COOKIE_DOMAIN`                                 | Để trống trừ khi share parent domain                                       |
   | `CORS_ORIGINS`                                  | Origin thêm (phẩy). `WEB_ORIGIN` luôn được phép khi `CROSS_SITE_COOKIES=1` |

3. Blueprint đã set `CROSS_SITE_COOKIES=1`. Cookie là `SameSite=None; Secure`.
4. Sau khi health xanh, seed **một lần** trong Render shell (không seed
   mỗi lần boot — seed owner xóa hàng content):

   ```bash
   node dist/seed.js
   ```

   Nếu `prisma migrate deploy` chết giữa chừng (P3009 / P3018), đánh
   rollback migration đó trước deploy tiếp. Cwd image là `/app`. Docker
   Command:

   ```bash
   prisma migrate resolve --rolled-back 20261027150000_portfolio_content
   ```

   Rồi trả Docker Command về `node dist/main.js` và deploy lại.

5. Kiểm tra `https://<render-host>/api/health` trả
   `{ "status": "ok", "db": "ok" }`.

Free web service ngủ sau ~15 phút. Next gửi `GET /api/health` nhẹ khi
mỗi trang load (`ApiWarmup`) để giảm cold start.

## 4. Vercel (web)

1. **Add New Project** từ repo GitHub. Framework: Next.js. Root: root
   monorepo. File `vercel.json` ở root ghim function về `sin1` (Singapore,
   gần Render và TiDB); nếu đổi Root Directory thì chuyển file theo.
2. Build:
   `pnpm --filter @portfolio/contracts build && pnpm --filter @portfolio/web build`
3. Install: `pnpm install --frozen-lockfile`.
4. Env:

   | Key                    | Ghi chú                                                                                                                                                                                                                  |
   | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | `API_URL`              | Origin Render (fetch server + rewrite)                                                                                                                                                                                   |
   | `NEXT_PUBLIC_API_URL`  | **Để trống** khi web và API khác domain. Browser phải gọi same-origin `/api/*` để Next rewrite sang Render và cookie nằm trên host Vercel. Set thành origin Render sẽ gắn cookie lên domain API và làm hỏng admin login. |
   | `NEXT_PUBLIC_SITE_URL` | Origin Vercel                                                                                                                                                                                                            |
   | `REVALIDATE_SECRET`    | Trùng Render                                                                                                                                                                                                             |

5. Deploy. Mở `https://<vercel>/en` và `/admin/login`.
6. Domain riêng: thêm trên Vercel, rồi cập nhật `WEB_ORIGIN`,
   `NEXT_PUBLIC_SITE_URL`, `WEB_INTERNAL_URL` cả hai phía.

## 5. Sau khi lên production

- [runbooks/content-entry.md](./runbooks/content-entry.md) — Parker nhập
  nội dung thật, rồi `pnpm check:placeholders` với `DATABASE_URL`
  production.
- [launch-checklist.md](./launch-checklist.md)
- Đổi mật khẩu admin và cặp JWT. Không dùng secret local-dev.
