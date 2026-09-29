# Thiệp cưới online – Next.js

Next.js 16 (App Router) · React 19 · TypeScript. Toàn bộ giao diện, hiệu ứng và chức năng thiệp cưới cao cấp.

## Chạy thử

Cần Node.js 20.9 trở lên.

```bash
npm install
npm run dev        # mở http://localhost:3000
```

Mở `http://localhost:3000/?khach=Anh%20Nam` để thấy tên khách trên phong bì và trong lời mời.

## Sửa nội dung

Chỉ cần sửa **`config/wedding.ts`**: tên, bố mẹ, ngày giờ, địa điểm, lời mời, ảnh, số tài khoản, nhạc, màu.

- **Ảnh:** bỏ vào `public/photos/`, rồi ghi `"/photos/ten-file.jpg"`. Next.js tự nén và cắt cỡ ảnh cho từng màn hình. Ô nào để trống sẽ hiện ảnh placeholder.
- **Ảnh từ web khác:** thêm tên miền vào `images.remotePatterns` trong `next.config.ts`.
- **Nhạc:** bỏ file mp3 vào `public/music/`, ghi `src: "/music/ten-bai.mp3"`. Để trống thì trang dùng hộp nhạc tự tổng hợp. Nhạc chỉ phát sau khi khách chạm vào phong bì.
- **Âm lịch:** tự tính từ ngày dương. Muốn ghi tay thì điền `lunar` cho từng sự kiện.
- **Mã QR mừng cưới:** điền `bankCode` + `accountNo` thì mã VietQR tự tạo dạng popup modal tiện lợi.
- **Màu:** ghi đè trong `theme`, ví dụ `{ son: '#1F3A5F', kim: '#B89B5E' }`.
- **Ảnh xem trước khi gửi link Zalo/Facebook:** đặt `meta.ogImage` (ảnh 1200×630) và biến `NEXT_PUBLIC_SITE_URL`.

---

## Lưu trữ Sổ Lưu Bút Bền Vững (Upstash Redis)

Sổ lưu bút được kết nối với cơ sở dữ liệu Upstash Redis (thông qua Vercel Marketplace hoặc tạo trực tiếp tại upstash.com):

### Hướng dẫn tích hợp trên Vercel:
1. Vào Dashboard dự án trên [Vercel](https://vercel.com) → chọn tab **Storage**.
2. Chọn **Create Database** → Chọn **Upstash Redis** (gói Free 10,000 commands/ngày).
3. Đặt tên cơ sở dữ liệu và chọn khu vực (khuyến nghị Singapore `ap-southeast-1` để có độ trễ thấp nhất về Việt Nam).
4. Sau khi kết nối, Vercel sẽ tự động cung cấp 2 biến môi trường:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Thêm biến mật khẩu quản trị vào **Project Settings → Environment Variables**:
   - `ADMIN_PASSWORD=mat_khau_cua_ban`
6. Redeploy lại dự án để biến môi trường có hiệu lực.

*(Lưu ý: Nếu chưa cấu hình biến môi trường Upstash Redis khi chạy localhost, hệ thống sẽ tự động dùng bộ nhớ in-memory fallback mà không gây crash).*

---

## Trang Quản Trị Sổ Lưu Bút (`/admin/wishes`)

- Truy cập đường dẫn: `https://ten-mien-cua-ban.com/admin/wishes`
- Nhập mật khẩu đã đặt trong biến môi trường `ADMIN_PASSWORD` (mặc định nếu chưa đặt: `linhanhthaihung2026`).
- Chức năng:
  - Xem tất cả lời chúc (kể cả lời chúc đã bị ẩn).
  - Nút **Ẩn / Hiện lời chúc** ngay lập tức.
  - Nút **Xóa vĩnh viễn** lời chúc không mong muốn.
  - Nút **Xuất CSV (Excel)**: Tải toàn bộ danh sách lời chúc UTF-8 tiếng Việt chuẩn về máy.

---

## Nhận phản hồi "Xác nhận tham dự" (RSVP)

Form gửi tới `/api/rsvp` (file `app/api/rsvp/route.ts`). Khi khách gửi RSVP có để lại lời chúc, hệ thống sẽ tự động đồng bộ sang Sổ lưu bút.

Để lưu phản hồi tham dự vào Google Sheet:

1. Tạo Google Sheet → **Tiện ích mở rộng → Apps Script**, dán đoạn mã:

   ```js
   function doPost(e) {
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = ss.getSheetByName('RSVP') || ss.insertSheet('RSVP');
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(['Thời gian', 'Tên', 'Điện thoại', 'Tham dự', 'Số người', 'Khách của', 'Lời chúc', 'Tên trên link']);
     }
     const d = JSON.parse(e.postData.contents);
     sheet.appendRow([d.submittedAt, d.name, d.phone, d.attend, d.guests, d.side, d.message, d.linkGuest]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
   }
   ```

2. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**, chọn "Ai có quyền truy cập: Bất kỳ ai", rồi sao chép URL.
3. Đặt URL đó vào biến môi trường `RSVP_WEBHOOK_URL` (file `.env.local` hoặc Vercel Environment Variables).

---

## Cấu trúc thư mục

```
config/wedding.ts        Nội dung thiệp (thông tin cô dâu chú rể, địa điểm...)
app/layout.tsx           Font, metadata, màu chủ đạo
app/page.tsx             Ghép các section theo thứ tự
app/globals.css          Toàn bộ CSS hệ thống & thiết kế chống tràn
app/admin/wishes/        Trang quản trị duyệt và xuất file CSV lời chúc
app/api/wishes/          API lấy danh sách, kiểm tra rate limit, validate & lưu lời chúc
app/api/rsvp/            API nhận xác nhận tham dự và đồng bộ lời chúc
components/
  WishesBook.tsx         Sổ lưu bút responsive, skeleton loading, optimistic updates
  Rsvp.tsx               Form xác nhận tham dự
  Gift.tsx               Hộp mừng cưới 3D và popup modal quét mã QR
  Cover.tsx              Phong bì mở thiệp
  Sections.tsx           Hero, lời mời, cô dâu chú rể, sự kiện, lịch, bản đồ, cảm ơn
  Countdown.tsx          Đếm ngược
  Gallery.tsx            Album + lightbox
  Effects.tsx            Nút nhạc, cánh hoa rơi
  Ornaments.tsx          Hoa văn SVG, tiêu đề section
lib/
  wishes-repo.ts         Tầng truy cập dữ liệu (Upstash Redis / in-memory fallback)
  ratelimit.ts           Giới hạn tần suất gửi bằng @upstash/ratelimit
  admin-auth.ts          Xác thực phiên quản trị viên an toàn
  view.ts                Tính toán dữ liệu hiển thị
  lunar.ts               Đổi dương lịch → âm lịch Việt Nam
  music.ts               Phát nhạc
```
