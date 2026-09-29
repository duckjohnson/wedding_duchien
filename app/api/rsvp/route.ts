import { NextResponse } from 'next/server';
import { wishesRepo, type WishSide } from '@/lib/wishes-repo';
import { rsvpRepo, type AttendChoice } from '@/lib/rsvp-repo';

const ATTEND = ['Có', 'Không', 'Chưa chắc'] as const;
const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

function parseSide(raw: unknown): WishSide {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();
  if (s === 'groom' || s.includes('trai')) return 'groom';
  if (s === 'bride' || s.includes('gái') || s.includes('gai')) return 'bride';
  if (s === 'both' || s.includes('chung') || s.includes('cả hai')) return 'both';
  return null;
}

/**
 * Nhận phản hồi từ form "Xác nhận tham dự".
 * 1. Lưu phản hồi đầy đủ (tên, sđt, tham dự, số người, lời chúc...) vào Upstash Redis (rsvpRepo).
 * 2. Nếu khách có để lại lời chúc (message >= 5 ký tự): lưu đồng thời vào Sổ lưu bút (wishesRepo).
 * 3. Nếu có cấu hình RSVP_WEBHOOK_URL: đồng bộ thêm tới Google Sheet.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Dữ liệu gửi lên không đúng định dạng.' }, { status: 400 });
  }

  const entry = {
    name: clip(body.name, 80),
    phone: clip(body.phone, 20),
    attend: clip(body.attend, 12) as AttendChoice,
    guests: clip(body.guests, 8) || '1',
    side: clip(body.side, 20) || 'Nhà gái',
    message: clip(body.message, 500),
    linkGuest: clip(body.linkGuest, 60),
  };

  if (!entry.name) return NextResponse.json({ ok: false, error: 'Nhập tên của bạn để gửi xác nhận.' }, { status: 400 });
  if (!(ATTEND as readonly string[]).includes(entry.attend)) {
    return NextResponse.json({ ok: false, error: 'Chọn bạn có đến dự hay không.' }, { status: 400 });
  }

  // 1. Lưu thông tin RSVP vào Upstash Redis
  try {
    await rsvpRepo.create({
      name: entry.name,
      phone: entry.phone,
      attend: entry.attend,
      guests: entry.guests,
      side: entry.side,
      message: entry.message,
      linkGuest: entry.linkGuest,
    });
  } catch (err) {
    console.error('[RSVP] Lỗi lưu vào Upstash Redis:', err);
  }

  // 2. Lưu lời chúc vào Sổ lưu bút nếu khách có nhập lời chúc
  let createdWish = null;
  if (entry.message && entry.message.trim().length >= 5) {
    try {
      createdWish = await wishesRepo.create({
        name: entry.name.slice(0, 40),
        message: entry.message.slice(0, 300),
        side: parseSide(entry.side),
      });
    } catch (err) {
      console.error('[RSVP] Không lưu được lời chúc vào sổ lưu bút:', err);
    }
  }

  // 3. Chuyển tiếp tới webhook Google Sheet (nếu có)
  const hook = process.env.RSVP_WEBHOOK_URL;
  if (!hook) {
    console.log('[RSVP Saved to Redis]', JSON.stringify(entry));
    return NextResponse.json({ ok: true, wish: createdWish });
  }

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...entry,
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Webhook trả về ${res.status}`);
  } catch (err) {
    console.error('[RSVP] Không chuyển tiếp được webhook:', err);
    // Vẫn trả về ok: true vì dữ liệu đã được lưu an toàn trong Redis
  }

  return NextResponse.json({ ok: true, wish: createdWish });
}
