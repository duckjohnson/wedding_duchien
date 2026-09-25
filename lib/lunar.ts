/* Âm lịch Việt Nam – thuật toán của Hồ Ngọc Đức, múi giờ +7 */

export type LunarDate = { day: number; month: number; year: number; leap: boolean };

const PI = Math.PI;

function jdFromDate(d: number, m: number, y: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  let jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  if (jd < 2299161) jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
  return jd;
}

function newMoonDay(k: number, tz: number): number {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  const jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
    + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mp = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  const c = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
    - 0.4068 * Math.sin(Mp * dr) + 0.0161 * Math.sin(dr * 2 * Mp) - 0.0004 * Math.sin(dr * 3 * Mp)
    + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mp)) - 0.0074 * Math.sin(dr * (M - Mp))
    + 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mp))
    + 0.001 * Math.sin(dr * (2 * F - Mp)) + 0.0005 * Math.sin(dr * (2 * Mp + M));
  const dt = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Math.floor(jd + c - dt + 0.5 + tz / 24);
}

function sunLongitude(jdn: number, tz: number): number {
  const T = (jdn - 0.5 - tz / 24 - 2451545) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let L = (L0 + (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
    + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M)) * dr;
  L -= PI * 2 * Math.floor(L / (PI * 2));
  return Math.floor((L / PI) * 6);
}

function lunarMonth11(y: number, tz: number): number {
  const k = Math.floor((jdFromDate(31, 12, y) - 2415021) / 29.530588853);
  const nm = newMoonDay(k, tz);
  return sunLongitude(nm, tz) >= 9 ? newMoonDay(k - 1, tz) : nm;
}

function leapMonthOffset(a11: number, tz: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = sunLongitude(newMoonDay(k + i, tz), tz);
  do {
    last = arc;
    i++;
    arc = sunLongitude(newMoonDay(k + i, tz), tz);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(d: number, m: number, y: number, tz = 7): LunarDate {
  const dayNumber = jdFromDate(d, m, y);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1, tz);
  if (monthStart > dayNumber) monthStart = newMoonDay(k, tz);
  let a11 = lunarMonth11(y, tz);
  let b11 = a11;
  let year: number;
  if (a11 >= monthStart) {
    year = y;
    a11 = lunarMonth11(y - 1, tz);
  } else {
    year = y + 1;
    b11 = lunarMonth11(y + 1, tz);
  }
  const day = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false;
  let month = diff + 11;
  if (b11 - a11 > 365) {
    const lo = leapMonthOffset(a11, tz);
    if (diff >= lo) {
      month = diff + 10;
      if (diff === lo) leap = true;
    }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) year -= 1;
  return { day, month, year, leap };
}

const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

export const canChi = (lunarYear: number) => `${CAN[lunarYear % 10]} ${CHI[lunarYear % 12]}`;

/** "Tức ngày mùng 5 tháng Chạp năm Bính Ngọ" */
export function lunarText(y: number, m: number, d: number): string {
  const l = solarToLunar(d, m, y);
  const day = l.day <= 10 ? `mùng ${l.day}` : String(l.day);
  const month = l.month === 1 ? 'Giêng' : l.month === 12 ? 'Chạp' : String(l.month);
  return `Tức ngày ${day} tháng ${month}${l.leap ? ' nhuận' : ''} năm ${canChi(l.year)}`;
}
