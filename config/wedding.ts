/* =========================================================
   NỘI DUNG THIỆP – CHỈ CẦN SỬA FILE NÀY
   - Ảnh: bỏ file vào public/photos rồi ghi "/photos/ten-file.jpg".
     Ô nào để "" thì trang hiện ảnh placeholder.
   - Ảnh từ web khác: thêm tên miền vào images.remotePatterns trong next.config.ts.
   ========================================================= */

export type Person = {
  name: string;       // tên hiển thị lớn
  fullName: string;   // tên đầy đủ trong phần lời mời
  role: string;       // Trưởng nam, Thứ nữ...
  bio?: string;
  photo?: string;
};

export type Family = { father: string; mother: string; address?: string };

export type WeddingEvent = {
  title: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM, giờ Việt Nam
  place: string;
  hall?: string;
  address?: string;
  mapUrl?: string;    // link Google Maps riêng (để trống = tự tạo từ địa chỉ)
  lunar?: string;     // ghi tay âm lịch (để trống = tự tính)
  main?: boolean;     // sự kiện dùng cho đếm ngược, lịch và bản đồ
};

export type GiftAccount = {
  owner: string;
  bank: string;
  bankCode: string;   // mã ngân hàng cho VietQR: VCB, TCB, MB, ACB...
  accountNo: string;
  accountName?: string;
  qrImage?: string;   // ảnh QR riêng (ưu tiên hơn VietQR tự tạo)
};

export type Wish = { name: string; message: string };

export type WeddingConfig = {
  groom: Person;
  bride: Person;
  families: { groom: Family; bride: Family };
  events: WeddingEvent[];
  map: { query: string; embedUrl?: string };
  defaultGuest: string;
  invitation: string;
  thanks: string;
  photos: { hero?: string; thanks?: string; gallery: string[] };
  cover: { enabled: boolean };
  rsvp: { enabled: boolean; deadline?: string };
  gift: { enabled: boolean; autoVietQR: boolean; accounts: GiftAccount[] };
  music: { enabled: boolean; src?: string; volume?: number };
  wishes: Wish[];
  meta: { description: string; ogImage?: string };
  theme: Partial<Record<'son' | 'son-dark' | 'son-light' | 'kim' | 'kim-light' | 'giay' | 'giay-2' | 'muc' | 'muc-nhat' | 'vien' | 'petal', string>>;
};

export const wedding: WeddingConfig = {
  groom: {
    name: 'Thái Hùng',
    fullName: 'Thái Hùng',
    role: 'Trưởng nam',
    bio: '',
    photo: 'https://res.cloudinary.com/txyieslq/image/upload/f_auto,q_auto/ZHUN3877_1',
  },
  bride: {
    name: 'Linh Anh',
    fullName: 'Linh Anh',
    role: 'Thứ nữ',
    bio: '',
    photo: 'https://res.cloudinary.com/txyieslq/image/upload/f_auto,q_auto/ZHUN4379',
  },
  families: {
    groom: { father: 'Ông Phạm Minh Khoa', mother: 'Bà Nguyễn Thị Ân', address: 'Thôn Nham Lang, xã Tiên La, tỉnh Hưng Yên' },
    bride: { father: 'Ông Hoàng Sỹ Khoa', mother: 'Bà Nguyễn Thị Quế', address: 'Số 64 Tân Kim, phường Lê Thanh Nghị, thành phố Hải Phòng' },
  },

  events: [
    {
      title: 'Tư gia nhà gái',
      date: '2026-10-18',
      time: '10:00',
      main: true,
      place: 'Tư gia nhà gái',
      address: 'Số 64 Tân Kim, phường Lê Thanh Nghị, thành phố Hải Phòng',
    },
    {
      title: 'Lễ thành hôn',
      date: '2026-10-18',
      time: '11:30',
      place: 'Tư gia nhà trai',
      address: 'Thôn Nham Lang, xã Tiên La, tỉnh Hưng Yên',
    },
  ],
  map: {
    query: 'Số 64 Tân Kim, Lê Thanh Nghị, Hải Phòng',
    embedUrl: '', // hoặc dán src của iframe "Nhúng bản đồ" từ Google Maps
  },

  defaultGuest: 'Quý khách', // khi link không có ?khach=Tên
  invitation:
    'đến dự bữa tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi.',
  thanks:
    'Cảm ơn bạn đã dành thời gian đọc thiệp và chung vui cùng chúng mình. Hẹn gặp bạn trong ngày vui!',

  photos: {
    hero: 'https://res.cloudinary.com/txyieslq/image/upload/f_auto,q_auto/ZHUN4223',
    thanks: 'https://res.cloudinary.com/txyieslq/image/upload/v1790347916/ZHUN3301_1.jpg',
    gallery: [
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346962/ZHUN3523.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346972/ZHUN3632.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346978/ZHUN3690.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346990/ZHUN3739.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/c_fill,g_face,ar_4:3/v1790346993/ZHUN4242.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346996/ZHUN3846.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790346998/ZHUN4246.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790347000/ZHUN4251.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790347007/ZHUN4427.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790347010/ZHUN4461.jpg',
      'https://res.cloudinary.com/txyieslq/image/upload/v1790347015/ZHUN4484.jpg',
    ],
  },

  cover: { enabled: true },

  // Phản hồi được gửi tới /api/rsvp; muốn lưu vào Google Sheet thì đặt RSVP_WEBHOOK_URL (xem README)
  rsvp: { enabled: true, deadline: '10.10.2026' },

  gift: {
    enabled: true,
    autoVietQR: true, // tự tạo mã QR từ bankCode + accountNo (cần số tài khoản thật)
    accounts: [
      { owner: 'Mừng cưới chú rể', bank: 'Vietcombank', bankCode: 'VCB', accountNo: '', accountName: 'THAI HUNG' },
      { owner: 'Mừng cưới cô dâu', bank: 'Techcombank', bankCode: 'TCB', accountNo: '', accountName: 'LINH ANH' },
    ],
  },

  // Nhạc: bỏ file vào public/music rồi ghi "/music/ten-bai.mp3". Để trống = hộp nhạc tự tổng hợp.
  music: { enabled: true, src: '/music/beautiful-in-white.mp3', volume: 0.6 },

  wishes: [
    { name: 'Thu Hà', message: 'Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!' },
    { name: 'Anh Quân', message: 'Mừng cho hai đứa. Hẹn gặp ở tiệc!' },
  ],

  meta: {
    description: 'Trân trọng kính mời bạn đến dự lễ thành hôn của chúng mình.',
    ogImage: '', // ví dụ "/photos/og.jpg" (1200×630) – ảnh hiện khi gửi link qua Zalo, Facebook
  },

  // Ghi đè màu, ví dụ: { son: '#1F3A5F', kim: '#B89B5E' }
  theme: {},
};
