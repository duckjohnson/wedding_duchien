# Cập nhật dự án nha_gai đồng bộ với nha_trai

## Mục tiêu
Đồng bộ toàn bộ tính năng, kiến trúc và giao diện mới từ dự án `nha_trai/thiep-cuoi-nextjs` sang dự án hiện tại (`nha_gai/thiep-cuoi-nextjs`), đồng thời giữ lại dữ liệu và nội dung đặc thù của nhà gái. 

## Chi tiết thay đổi (Architecture & Data Flow)
Dự án nha_trai đã có thêm các thành phần:
- Trang quản trị (Admin dashboard) tại `app/admin`.
- Sổ lời chúc (WishesBook, FloatingWishes).
- Logic giới hạn request (Ratelimit) và database repositories (`rsvp-repo.ts`, `wishes-repo.ts`).

Để đưa các tính năng này sang nha_gai, chúng ta sử dụng phương pháp **Đồng bộ toàn diện có chọn lọc**.

## Phạm vi đồng bộ (Files to overwrite/copy)
Toàn bộ các file từ `nha_trai` sẽ được copy sang `nha_gai` để đảm bảo code chạy ổn định và đồng nhất, bao gồm:
- Toàn bộ thư mục `app/`, `components/`, `lib/`, `api/`, `data/`, `docs/`.
- File cấu hình `config/wishes-ui.ts`.
- Cấu hình môi trường và package: `.env.example`, `.env.local`, `package.json`, `package-lock.json`, `.gitignore`, `README.md`.

## Phạm vi bảo vệ (Files to preserve)
Để không làm mất dữ liệu của nha_gai, các thư mục và file sau được bảo vệ:
- **`public/`**: Thư mục chứa hình ảnh cô dâu, QR code, v.v. được giữ nguyên tuyệt đối.
- **`config/wedding.ts`**: Thông tin cá nhân của nhà gái (Tên, tên bố mẹ, thời gian, địa điểm, STK). File này sẽ được merge cẩn thận bằng tay thay vì copy đè. 
- **`.git/`**: Giữ nguyên.

## Quy trình triển khai
1. Copy các file config ở root (`package.json`, `.env.local`...).
2. Copy các thư mục logic (`app`, `components`, `lib`, `data`, `docs`).
3. Copy `config/wishes-ui.ts`.
4. So sánh `config/wedding.ts` giữa hai bên và đưa các trường dữ liệu config hệ thống mới vào `wedding.ts` của nhà gái.
5. Cài đặt các thư viện mới (nếu có) thông qua `npm install`.
6. Chạy và kiểm tra dự án.
