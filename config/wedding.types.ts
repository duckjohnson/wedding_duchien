/* =========================================================
   KIỂU DỮ LIỆU CHUNG – thường không cần sửa file này
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
  /** 'groom' = thiệp nhà trai (tên trai đứng trước), 'bride' = thiệp nhà gái (tên gái đứng trước) */
  side: 'groom' | 'bride';
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
