import type { WeddingConfig, WeddingEvent } from '@/config/wedding';
import { lunarText } from './lunar';

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

type YMD = { y: number; m: number; d: number };

export const pad = (n: number) => String(n).padStart(2, '0');
const parseDate = (s: string): YMD => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
};
const weekdayOf = ({ y, m, d }: YMD) => WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
const lunarOf = (ev: WeddingEvent) => {
  const p = parseDate(ev.date);
  return ev.lunar || lunarText(p.y, p.m, p.d);
};
export const mapLink = (ev: Pick<WeddingEvent, 'mapUrl' | 'address' | 'place'>) =>
  ev.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address || ev.place)}`;

/* ---------- Ảnh placeholder (SVG tự tạo, không cần file) ---------- */
const TONES: [string, string][] = [['#EBD8CC', '#D4B4A3'], ['#EFE3D3', '#D6BE9F'], ['#E9D4D1', '#C9A6A2']];

export function placeholder(label: string, w: number, h: number, tone = 0): string {
  const [a, b] = TONES[tone % TONES.length];
  const fs = Math.round(Math.min(w, h) * 0.055);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='${w}' height='${h}' fill='url(#g)'/><rect x='${w * 0.05}' y='${h * 0.05}' width='${w * 0.9}' height='${h * 0.9}' fill='none' stroke='#fff' stroke-opacity='.6' stroke-width='2'/><g transform='translate(${w / 2} ${h / 2 - fs})' fill='none' stroke='#8C1C22' stroke-opacity='.4' stroke-width='3'><rect x='-40' y='-26' width='80' height='56' rx='8'/><circle r='15' cy='2'/><path d='M-16 -26l7 -10h18l7 10'/></g><text x='50%' y='${h / 2 + fs * 2}' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='${fs}' fill='#5E0F15' fill-opacity='.55'>${label}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const photo = (src: string | undefined, label: string, w: number, h: number, tone: number) =>
  src || placeholder(label, w, h, tone);

/* ---------- Album: nhịp dọc / ngang lặp lại mỗi 8 ảnh ---------- */
export type GalleryShape = 't' | 'n' | 'w';
export type GalleryItem = { src: string; alt: string; shape: GalleryShape };
const SHAPES: GalleryShape[] = ['t', 'n', 'n', 'w', 'n', 't', 'n', 'w'];
const SIZE: Record<GalleryShape, [number, number]> = { t: [600, 900], n: [600, 450], w: [900, 600] };

/* ---------- Lịch tháng (tuần bắt đầu từ thứ hai) ---------- */
export type CalendarCell = { day: number | null; sunday: boolean; wedding: boolean };

function buildCalendar({ y, m, d }: YMD): CalendarCell[] {
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: CalendarCell[] = Array.from({ length: offset }, () => ({ day: null, sunday: false, wedding: false }));
  for (let i = 1; i <= days; i++) cells.push({ day: i, sunday: (offset + i) % 7 === 0, wedding: i === d });
  return cells;
}

export type EventView = WeddingEvent & { dateLong: string; lunarText: string; mapHref: string };
export type GiftView = WeddingConfig['gift']['accounts'][number] & { qrSrc: string; hasQr: boolean };

export function buildView(w: WeddingConfig) {
  const main = w.events.find((e) => e.main) ?? w.events[w.events.length - 1];
  const md = parseDate(main.date);

  const events: EventView[] = w.events.map((ev) => {
    const p = parseDate(ev.date);
    return {
      ...ev,
      dateLong: `${weekdayOf(p)}, ngày ${pad(p.d)} tháng ${pad(p.m)} năm ${p.y}`,
      lunarText: lunarOf(ev),
      mapHref: mapLink(ev),
    };
  });

  const gallery: GalleryItem[] = w.photos.gallery.map((src, i) => {
    const shape = SHAPES[i % SHAPES.length];
    const [pw, ph] = SIZE[shape];
    return { src: photo(src, `Ảnh cưới ${i + 1}`, pw, ph, i), alt: `Ảnh cưới ${i + 1}`, shape };
  });

  const gifts: GiftView[] = w.gift.accounts.map((acc) => {
    const no = acc.accountNo.replace(/\s/g, '');
    const auto = w.gift.autoVietQR && acc.bankCode && no
      ? `https://img.vietqr.io/image/${encodeURIComponent(acc.bankCode)}-${encodeURIComponent(no)}-compact.png?accountName=${encodeURIComponent(acc.accountName ?? '')}`
      : '';
    const real = acc.qrImage || auto;
    return { ...acc, qrSrc: real || placeholder('Thêm mã QR', 300, 300, 1), hasQr: Boolean(real) };
  });

  return {
    weekday: weekdayOf(md),
    day: pad(md.d),
    monthLabel: `Tháng ${md.m}`,
    monthTitle: `Tháng ${md.m} năm ${md.y}`,
    year: String(md.y),
    dateShort: `${pad(md.d)}.${pad(md.m)}.${md.y}`,
    mainLunar: lunarOf(main),
    mainPlace: [main.place, main.address].filter(Boolean).join(', '),
    targetISO: `${main.date}T${main.time || '00:00'}:00+07:00`,
    mapEmbed: w.map.embedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(w.map.query || main.address || main.place)}&z=16&hl=vi&output=embed`,
    mapHref: mapLink(main),
    events,
    calendar: buildCalendar(md),
    gallery,
    gifts,
    photos: {
      hero: photo(w.photos.hero, 'Ảnh bìa', 800, 1100, 0),
      groom: photo(w.groom.photo, 'Ảnh chú rể', 600, 860, 1),
      bride: photo(w.bride.photo, 'Ảnh cô dâu', 600, 860, 2),
      thanks: photo(w.photos.thanks, 'Ảnh lời cảm ơn', 900, 1100, 2),
    },
  };
}

export type View = ReturnType<typeof buildView>;
