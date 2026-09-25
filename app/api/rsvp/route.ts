import { NextResponse } from 'next/server';

const ATTEND = ['Có', 'Không', 'Chưa chắc'] as const;
const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/**
 * Nhận phản hồi từ form "Xác nhận tham dự".
 * - Có biến môi trường RSVP_WEBHOOK_URL: chuyển tiếp dữ liệu tới đó (ví dụ Google Apps Script ghi vào Google Sheet).
 * - Không có: chỉ ghi ra log của server.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Dữ liệu gửi lên không đúng định dạng.' }, { status: 400 });
  }

  const entry = {
    submittedAt: new Date().toISOString(),
    name: clip(body.name, 80),
    phone: clip(body.phone, 20),
    attend: clip(body.attend, 12),
    guests: clip(body.guests, 4),
    side: clip(body.side, 20),
    message: clip(body.message, 500),
    linkGuest: clip(body.linkGuest, 60),
  };

  if (!entry.name) return NextResponse.json({ ok: false, error: 'Nhập tên của bạn để gửi xác nhận.' }, { status: 400 });
  if (!(ATTEND as readonly string[]).includes(entry.attend)) {
    return NextResponse.json({ ok: false, error: 'Chọn bạn có đến dự hay không.' }, { status: 400 });
  }

  const hook = process.env.RSVP_WEBHOOK_URL;
  if (!hook) {
    console.log('[RSVP]', JSON.stringify(entry));
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Webhook trả về ${res.status}`);
  } catch (err) {
    console.error('[RSVP] Không chuyển tiếp được:', err);
    return NextResponse.json({ ok: false, error: 'Chưa lưu được phản hồi. Bấm Gửi xác nhận lần nữa sau ít phút.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
