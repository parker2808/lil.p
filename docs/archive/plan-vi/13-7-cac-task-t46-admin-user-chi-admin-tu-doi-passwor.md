<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T46 · Admin user (chỉ admin) + tự đổi password); links re-pointed. Index: ../../PLAN.vi.md -->

#### T46 · Admin user (chỉ admin) + tự đổi password

**Roadmap** p22 (hoàn thiện M4) · **Spec** §4.3 (Users; "chỉ owner" thành chỉ admin theo D7), §1.5 (`User`) · **Phụ thuộc** T37 · **Cỡ** M

**Mục tiêu.** Một `admin` thêm được tài khoản, đặt role cho nó (`admin` hoặc `user`), khóa tài khoản và sign out tài khoản đó khỏi mọi nơi. Mọi tài khoản đã login đều tự đổi được password của mình.

**Phạm vi.**
- API `modules/users/admin-users.controller.ts`, `@Roles('admin')` trên class (ghi tường minh, dù đây cũng là mặc định):
  - `GET /admin/users` (list theo page: name, email, role, `isActive`, `lastLoginAt`), `POST /admin/users` (email, name, role, password ban đầu ít nhất 12 ký tự), `PATCH /admin/users/:id` (name, role, `isActive`).
  - `POST /admin/users/:id/sign-out-everywhere` (tăng `tokenVersion`; 204) và `POST /admin/users/:id/password` (admin đặt password mới; cũng tăng `tokenVersion`).
  - Đổi `role` hoặc `isActive` cũng tăng `tokenVersion`, để role cũ không refresh được nữa.
  - Rào chắn: admin không tự hạ role hay tự khóa chính mình được, và admin active cuối cùng không bị hạ role hay bị khóa được (409 `LAST_ADMIN`, check trong cùng transaction với lệnh update).
- API `PATCH /auth/password` (`@Roles('admin', 'user')`, `changePasswordSchema`: `currentPassword`, `newPassword` ít nhất 12 ký tự): verify password hiện tại, lưu hash argon2id mới, tăng `tokenVersion`, rồi set cặp cookie mới cho browser này để nó vẫn còn login.
- Contracts `users/`: admin user DTO (không bao giờ có `passwordHash` hay `tokenVersion`), `createUserSchema`, `updateUserSchema`, `setPasswordSchema`; `auth/auth.schema.ts` thêm `changePasswordSchema`.
- Web `admin-users`: `AdminUsersIndex` (`DataTable`: name, email, pill role, switch active, lần login cuối; menu của row có "Sign out everywhere" và "Set password" sau một `alert-dialog`) và `UserForm` trong một `sheet`. Route `app/admin/(cms)/users/page.tsx`; item sidebar được bọc trong `RoleGate allow={['admin']}`.
- Web `admin-auth/components/ChangePasswordDialog`, mở từ user menu trên topbar, cho cả hai role.

**File.** `apps/api/src/modules/users/{admin-users.controller.ts,users.service.ts,users.service.spec.ts,dto/*}`, `apps/api/src/modules/auth/{auth.controller.ts,auth.service.ts}`, `packages/contracts/src/users/*`, `packages/contracts/src/auth/auth.schema.ts`, `apps/api/test/users.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/admin/(cms)/users/page.tsx`, `apps/web/src/modules/admin-users/{views/AdminUsersIndex.tsx,components/{UsersTable,UserForm}/*,hooks/use-admin-users.hook.ts,services/admin-users.service.ts}`, `apps/web/src/modules/admin-auth/components/ChangePasswordDialog/*`, `apps/web/src/modules/admin-core/components/{AdminSidebar,Topbar}/*`.

**Thiết kế.** Pattern table admin (`15:2`).

**Các bước backend, giải thích.**
1. **Role trên class.** `@Roles('admin')` đặt trên class controller bảo vệ mọi route trong đó; `RolesGuard` từ T36 làm việc check. Ghi ra dù chỉ-admin đã là mặc định, để người đọc sau biết module này nhạy cảm.
2. **Hash khi create.** Password ban đầu đi qua cùng bước hash argon2id như login (T35); API không bao giờ trả nó về hay log nó.
3. **Sign out everywhere, không cần session.** Không có row session nào để xóa (D24). Tăng `tokenVersion` khiến mọi refresh token ký với số cũ fail ở lần refresh kế tiếp, nên user đó bị đẩy ra trong vòng một vòng đời access token (15 phút). Cần nhanh hơn? Giảm `JWT_ACCESS_TTL_SECONDS`.
4. **Rào chắn trong transaction.** "Đây có phải admin active cuối cùng không?" và lệnh update chạy trong cùng một `prisma.$transaction`, nên hai admin hạ role nhau cùng một lúc cũng không làm site mất hết admin.
5. **Tự đổi password.** Hỏi password hiện tại trước nghĩa là ai đó ngồi vào laptop đang mở cũng không khóa bạn ra ngoài được. Tăng `tokenVersion` sign out các thiết bị khác; cấp lại cookie giữ cho thiết bị này vẫn login.

**Tiêu chí nghiệm thu.**
- [ ] `user` gọi bất kỳ route `/admin/users` nào thì nhận 403, và không thấy item Users.
- [ ] Sau "Sign out everywhere", lần `POST /auth/refresh` tiếp theo của user đó trả 401 (e2e).
- [ ] Tự hạ role hay tự khóa mình, hoặc hạ role/khóa admin active cuối cùng, trả 409.
- [ ] Sau khi tự đổi password, password cũ login fail, refresh ở browser khác trả 401, và browser hiện tại vẫn còn login.
- [ ] Không response nào của users API chứa `passwordHash`, `tokenVersion` hay token.

**Tiêu đề PR:** `feat: users admin`

