/**
 * Tạo URL ảnh OG cá nhân hóa qua Cloudinary Transformation.
 * Không cần server render, Zalo/Facebook/Telegram nhận trực tiếp JPEG từ Cloudinary CDN.
 *
 * Cloudinary encoding rules cho l_text:
 *   - Khoảng trắng → %20 (KHÔNG dùng +)
 *   - Dấu phẩy     → %252C (double-encode)
 *   - Dấu /        → %252F (double-encode)
 *   - Dấu :        → %253A (double-encode — chỉ bên trong l_text value)
 */

// Cloud name Cloudinary của bạn
const CLOUD_NAME = 'txyieslq';
// Public ID ảnh nền cưới trên Cloudinary (bỏ extension)
const BG_PUBLIC_ID = 'ZHUN4223';

/**
 * Encode text để nhúng an toàn vào l_text Cloudinary.
 * Bước 1: encodeURIComponent (encode lần 1)
 * Bước 2: encode thêm các ký tự đặc biệt của Cloudinary (double-encode)
 */
function encodeCloudinaryText(text: string): string {
  // Cắt tối đa 40 ký tự để URL không quá dài
  const truncated = text.slice(0, 40);
  // Encode lần 1
  let encoded = encodeURIComponent(truncated);
  // Double-encode các ký tự đặc biệt của Cloudinary
  encoded = encoded
    .replace(/%2C/gi, '%252C') // dấu phẩy
    .replace(/%2F/gi, '%252F') // dấu /
    .replace(/%3A/gi, '%253A') // dấu :
    .replace(/\+/g, '%20');    // dấu + → %20 (Cloudinary không nhận +)
  return encoded;
}

/**
 * Xây dựng URL ảnh OG Cloudinary với text overlay tên khách.
 * @param guestName - Tên khách mời (có thể trống)
 * @returns URL ảnh JPEG 1200×630, sẵn sàng đặt vào og:image
 */
export function buildOgImageUrl(guestName?: string | null): string {
  const name = guestName?.trim() ?? '';

  // Đường dẫn xử lý ảnh trên Cloudinary
  const transformations: string[] = [
    // 1. Crop ảnh nền thành 1200×630
    'c_fill,g_faces,w_1200,h_630',
    // 2. Lớp phủ tối màu đỏ đô để chữ nổi lên
    'e_colorize:60,co_rgb:3c080c',
    // 3. Dòng chữ "Trân trọng kính mời đến dự lễ cưới Vũ Hiền & Hữu Đức"
    [
      `l_text:Roboto_32_italic:Tr%C3%A2n%20tr%E1%BB%8Dng%20k%C3%ADnh%20m%E1%BB%9Di%20%C4%91%E1%BA%BFn%20d%E1%BB%B1%20l%E1%BB%85%20c%C6%B0%E1%BB%9Bi%20Linh%20Anh%20%26%20Th%C3%A1i%20H%C3%B9ng`,
      'co_rgb:F5E6D3',
      name ? 'g_south,y_70' : 'g_south,y_120',
    ].join(','),
    // 4. Tên khách mời (chỉ thêm nếu có tên)
    ...(name
      ? [
          [
            `l_text:Roboto_64_bold:${encodeCloudinaryText(name)}`,
            'co_rgb:ffffff',
            'g_south,y_150',
          ].join(','),
        ]
      : []),
    // 5. Xuất JPEG chất lượng tốt
    'f_jpg,q_auto:good',
  ];

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations.join('/')}/${BG_PUBLIC_ID}`;
}
