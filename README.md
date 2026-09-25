# Thiệp cưới online – Next.js

Next.js 16 (App Router) · React 19 · TypeScript. Toàn bộ giao diện, hiệu ứng và chức năng giữ nguyên như bản HTML một file.

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
- **Mã QR mừng cưới:** điền `bankCode` + `accountNo` thì mã VietQR tự tạo. Muốn dùng ảnh QR riêng thì điền `qrImage`.
- **Màu:** ghi đè trong `theme`, ví dụ `{ son: '#1F3A5F', kim: '#B89B5E' }`.
- **Ảnh xem trước khi gửi link Zalo/Facebook:** đặt `meta.ogImage` (ảnh 1200×630) và biến `NEXT_PUBLIC_SITE_URL`.

## Nhận phản hồi "Xác nhận tham dự"

Form gửi tới `/api/rsvp` (file `app/api/rsvp/route.ts`). Chưa cấu hình gì thì phản hồi chỉ được ghi vào log của server.

Để lưu vào Google Sheet:

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
3. Đặt URL đó vào biến môi trường `RSVP_WEBHOOK_URL` (file `.env.local` khi chạy máy, hoặc trong phần Environment Variables của Vercel).

Webhook URL nằm ở server nên khách xem thiệp không nhìn thấy được.

## Đưa lên mạng

Cách nhanh nhất là Vercel: đẩy code lên GitHub → vào vercel.com → **Add New Project** → chọn repo → khai báo `NEXT_PUBLIC_SITE_URL` và `RSVP_WEBHOOK_URL` → Deploy.

Trang đọc `?khach=` ở server, nên cần môi trường chạy được Node.js (Vercel, Netlify, VPS…), không dùng được hosting tĩnh thuần.

## Cấu trúc

```
config/wedding.ts        Nội dung thiệp (chỗ duy nhất cần sửa)
app/layout.tsx           Font, metadata, màu ghi đè
app/page.tsx             Ghép các section theo thứ tự
app/globals.css          Toàn bộ CSS (token màu ở đầu file)
app/fonts.ts             Great Vibes, Cormorant Garamond, Be Vietnam Pro qua next/font
app/api/rsvp/route.ts    Nhận phản hồi, chuyển tiếp tới webhook
components/
  InviteProvider.tsx     Trạng thái mở thiệp, nhạc, hiệu ứng cuộn, parallax
  Cover.tsx              Phong bì mở thiệp
  Sections.tsx           Hero, lời mời, cô dâu chú rể, sự kiện, lịch, bản đồ, cảm ơn
  Countdown.tsx          Đếm ngược
  Gallery.tsx            Album + lightbox
  Rsvp.tsx               Form xác nhận + sổ lưu bút
  Gift.tsx               Hộp mừng cưới
  Effects.tsx            Nút nhạc, cánh hoa rơi
  Ornaments.tsx          Hoa văn SVG, tiêu đề section
lib/
  view.ts                Tính sẵn ngày, âm lịch, lịch tháng, ảnh placeholder
  lunar.ts               Đổi dương lịch → âm lịch Việt Nam
  music.ts               Phát file mp3 hoặc hộp nhạc Web Audio
```

## Ghi chú

- Các section tĩnh render ở server; chỉ phong bì, nhạc, đếm ngược, album, form và hộp mừng cưới chạy JavaScript ở trình duyệt.
- Lời chúc mới chỉ hiện trên máy người vừa gửi. Muốn mọi khách đều thấy, cần đọc lời chúc từ Google Sheet (hoặc một database) khi render trang.
- Người xem bật "giảm chuyển động" trong hệ điều hành sẽ không thấy cánh hoa rơi, parallax hay hiệu ứng trượt; phong bì mở ngay.
