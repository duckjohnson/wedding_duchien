# Kế Hoạch Chuyển Đổi Thiệp Cưới Sang Nhà Trai

> **Dành cho Agent:** SỬ DỤNG SUB-SKILL BẮT BUỘC: `superpowers:subagent-driven-development` hoặc `superpowers:executing-plans` để thực thi kế hoạch này theo từng task. Các bước dùng cú pháp checkbox (`- [ ]`) để theo dõi.

**Mục tiêu:** Chuyển đổi toàn diện giao diện, thứ tự đại diện gia đình, nghi lễ và thông tin sự kiện/địa điểm từ thiệp Nhà Gái (Lễ Vu Quy) sang thiệp Nhà Trai (Lễ Thành Hôn / Tân Hôn).

**Kiến trúc:** Cấu trúc dự án tách biệt giữa tầng dữ liệu cấu hình (`config/wedding.ts`) và tầng biểu diễn UI (`components/Sections.tsx`, `components/Cover.tsx`, `app/layout.tsx`). Việc chuyển đổi bao gồm chuẩn hóa thứ tự phong tục truyền thống trong UI và cập nhật thông tin sự kiện nhà trai trong config.

**Công nghệ:** Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS.

---

## 1. Các Quy Chuẩn Phong Tục Cần Chuyển Đổi

1. **Nghi lễ chính:** Đổi từ "Lễ Vu Quy" (nhà gái tiễn con gái về nhà chồng) thành "Lễ Thành Hôn" hoặc "Lễ Tân Hôn" (nhà trai đón dâu và mở tiệc đãi khách).
2. **Thứ tự Tên Cô Dâu & Chú Rể:**
   - Nhà gái: Cô dâu đứng trước (`Vũ Hiền & Hữu Đức`).
   - Nhà trai: Chú rể đứng trước (`Hữu Đức & Vũ Hiền`) trên bì thư, Hero banner, tiêu đề cặp đôi, lời cảm ơn và metadata SEO.
3. **Thứ tự Đại diện Gia Đình (Họ Hàng):**
   - Nhà gái: Nhà gái đặt bên trái (vị trí ưu tiên đầu tiên), Nhà trai bên phải.
   - Nhà trai: Nhà trai đặt bên trái (vị trí ưu tiên đầu tiên), Nhà gái bên phải.
4. **Địa điểm & Sự kiện:**
   - Chuyển địa chỉ tổ chức từ Tư gia nhà gái (Hải Phòng) sang Tư gia nhà trai (Thôn Nham Lang, xã Tiên La, Hưng Yên) hoặc hội trường/nhà hàng nhà trai tổ chức tiệc.
   - Bản đồ Google Maps cập nhật theo tọa độ nhà trai.
5. **Hòm mừng cưới (Gift):** Ưu tiên hiển thị thông tin tài khoản của chú rể / đại diện nhà trai.

---

## 2. Chi Tiết Các Nhiệm Vụ (Tasks)

### Task 1: Chuẩn hóa thứ tự hiển thị Nhà Trai trong UI Components
**Files:**
- Modify: `components/Cover.tsx:38-50`
- Modify: `components/Sections.tsx:21-25` (Hero)
- Modify: `components/Sections.tsx:52-68` (Letter)
- Modify: `components/Sections.tsx:79-85` (Couple)
- Modify: `components/Sections.tsx:190-193` (Thanks)
- Modify: `app/layout.tsx:7`

- [ ] **Bước 1.1:** Cập nhật `Cover.tsx` để tên Chú rể đứng trước Cô dâu trên phong bì và thiệp bìa.
- [ ] **Bước 1.2:** Cập nhật `Sections.tsx` > `Hero` để tên Chú rể đứng trước Cô dâu.
- [ ] **Bước 1.3:** Cập nhật `Sections.tsx` > `Letter`:
  - Hoán đổi vị trí hiển thị: `Nhà trai` đặt trước (cột trái), `Nhà gái` đặt sau (cột phải).
  - Khối xưng tên con: Đưa thông tin Chú rể lên trước, Cô dâu phía sau.
- [ ] **Bước 1.4:** Cập nhật `Sections.tsx` > `Couple`:
  - Đổi tiêu đề mục thành "Chú rể & Cô dâu".
  - Đưa chân dung và giới thiệu Chú rể lên vị trí đầu tiên.
- [ ] **Bước 1.5:** Cập nhật `Sections.tsx` > `Thanks`: Ký tên Chú rể trước, Cô dâu sau.
- [ ] **Bước 1.6:** Cập nhật `app/layout.tsx`: Đổi title metadata thành `Thiệp cưới Thái Hùng & Linh Anh`.
- [ ] **Bước 1.7:** Kiểm tra TypeScript bằng lệnh `npm run typecheck`.

---

### Task 2: Cập nhật dữ liệu sự kiện và địa điểm Nhà Trai trong `config/wedding.ts`
**Files:**
- Modify: `config/wedding.ts:80-100`

- [ ] **Bước 2.1:** Cập nhật danh sách `events`:
  - Đổi sự kiện chính từ `Lễ vu quy` thành `Lễ thành hôn` (hoặc `Tiệc mừng cưới` / `Lễ đón dâu`).
  - Cập nhật địa điểm `place` và `address` sang địa chỉ của nhà trai: Thôn Nham Lang, xã Tiên La, tỉnh Hưng Yên (hoặc địa điểm cụ thể gia đình lựa chọn).
  - Cập nhật thời gian tổ chức tiệc nhà trai.
- [ ] **Bước 2.2:** Cập nhật `map.query` và `map.embedUrl` sang địa chỉ nhà trai.
- [ ] **Bước 2.3:** Bổ sung vai vế (`role`) cho chú rể (ví dụ: `Trưởng nam`) và cô dâu (ví dụ: `Út nữ` / `Thứ nữ`) nếu gia đình có yêu cầu thể hiện trên thiệp.
- [ ] **Bước 2.4:** Kiểm tra TypeScript bằng lệnh `npm run typecheck`.

---

### Task 3: Tinh chỉnh mục Xác nhận tham dự (RSVP)
**Files:**
- Modify: `components/Rsvp.tsx:145-156`

- [ ] **Bước 3.1:** Kiểm tra select box `Bạn là khách của`: Đặt mặc định ưu tiên `Nhà trai` hoặc sắp xếp lại thứ tự lựa chọn.
- [ ] **Bước 3.2:** Tinh chỉnh nhãn "Lời chúc gửi chú rể cô dâu" cho đồng bộ phong cách nhà trai.
- [ ] **Bước 3.3:** Kiểm tra TypeScript bằng `npm run typecheck`.

---

### Task 4: Khởi động server và kiểm tra giao diện (Frontend Verification)
- [ ] **Bước 4.1:** Khởi động server Next.js dev qua `npm run dev`.
- [ ] **Bước 4.2:** Kiểm tra HTTP Status `200 OK` qua `curl` và kiểm tra trực quan giao diện:
  - Bì thư (Cover): Chú rể & Cô dâu.
  - Khối Lời mời: Nhà trai bên trái, Chú rể đứng trước.
  - Khối Cặp đôi: Chú rể đứng trước.
  - Khối Sự kiện & Bản đồ: Hiển thị đúng địa chỉ nhà trai tại Hưng Yên.
