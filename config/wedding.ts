/* =========================================================
   BỘ CHỌN THIỆP NHÀ TRAI / NHÀ GÁI – thường không cần sửa file này
   Nội dung thiệp nằm ở:
     - config/wedding.groom.ts  (thiệp nhà trai: tên chú rể, bố mẹ nhà trai đứng trước)
     - config/wedding.bride.ts  (thiệp nhà gái: tên cô dâu, bố mẹ nhà gái đứng trước)

   Cách chọn thiệp:
     1) Mỗi lần build/deploy một thiệp: đặt biến môi trường
          NEXT_PUBLIC_WEDDING_SIDE=groom   (mặc định)  hoặc  bride
     2) Một link dùng chung cho cả hai nhà: thêm ?side=groom hoặc ?side=bride
        (hoặc đường dẫn /nha-trai, /nha-gai) – ghi đè giá trị mặc định ở trên.
   ========================================================= */

import { weddingGroom } from './wedding.groom';
import { weddingBride } from './wedding.bride';
import type { Side, WeddingConfig } from './wedding.types';

export type {
  Family,
  GiftAccount,
  Person,
  Side,
  WeddingConfig,
  WeddingEvent,
  Wish,
} from './wedding.types';

export const WEDDINGS: Record<Side, WeddingConfig> = {
  groom: weddingGroom,
  bride: weddingBride,
};

/** Side mặc định của bản build này (NEXT_PUBLIC_WEDDING_SIDE), mặc định là nhà trai */
export const DEFAULT_SIDE: Side = process.env.NEXT_PUBLIC_WEDDING_SIDE?.trim().toLowerCase() === 'bride' ? 'bride' : 'groom';

/** Chuẩn hoá giá trị người dùng nhập (groom/bride/trai/gai/nha-trai/nha-gai...); không hợp lệ → null */
export function normalizeSide(raw: unknown): Side | null {
  const s = String(Array.isArray(raw) ? raw[0] : raw ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'groom' || s === 'trai' || s === 'nhatrai' || s === 'nha-trai' || s === 'nhà trai') return 'groom';
  if (s === 'bride' || s === 'gai' || s === 'gái' || s === 'nhagai' || s === 'nha-gai' || s === 'nhà gái') return 'bride';
  return null;
}

export function getWedding(side: Side = DEFAULT_SIDE): WeddingConfig {
  return WEDDINGS[side];
}

/** Cấu hình mặc định (theo NEXT_PUBLIC_WEDDING_SIDE) – dùng ở layout, nơi không đọc được ?side= */
export const wedding: WeddingConfig = getWedding(DEFAULT_SIDE);
