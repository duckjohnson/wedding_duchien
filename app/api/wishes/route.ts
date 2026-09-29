import { NextResponse } from 'next/server';
import { z } from 'zod';
import { wishesRepo, type WishSide } from '@/lib/wishes-repo';
import { checkRateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

// Regex phát hiện URL hoặc tên miền thông dụng
const URL_REGEX = /(https?:\/\/|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|vn|net|org|edu|gov|io|top|xyz|me|info|biz|co|app)\b)/i;

// Chuẩn hoá khoảng trắng và xuống dòng (giữ tối đa 2 dòng trống liên tiếp)
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\n]+/g, ' ') // gộp khoảng trắng liên tiếp trên cùng một dòng
    .replace(/\n{3,}/g, '\n\n') // tối đa 2 dòng trống liên tiếp
    .trim();
}

// Chuẩn hoá bên gia đình
function parseSide(raw: unknown): WishSide {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();
  if (s === 'groom' || s.includes('trai')) return 'groom';
  if (s === 'bride' || s.includes('gái') || s.includes('gai')) return 'bride';
  if (s === 'both' || s.includes('chung') || s.includes('cả hai')) return 'both';
  return null;
}

const wishSchema = z.object({
  name: z
    .string({ error: 'Vui lòng nhập tên của bạn.' })
    .trim()
    .min(2, 'Tên cần có ít nhất 2 ký tự.')
    .max(40, 'Tên không quá 40 ký tự.'),
  message: z
    .string({ error: 'Vui lòng nhập lời chúc.' })
    .trim()
    .min(5, 'Lời chúc cần có ít nhất 5 ký tự.')
    .max(300, 'Lời chúc không quá 300 ký tự.'),
  side: z.unknown().optional(),
  website: z.string().optional(), // Honeypot
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limitParam = Number(searchParams.get('limit'));
  const limit = !Number.isNaN(limitParam) && limitParam > 0 ? limitParam : 6;

  try {
    const result = await wishesRepo.list({
      cursor,
      limit,
      includeUnapproved: false,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[GET /api/wishes] Lỗi lấy danh sách:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách lời chúc.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không đúng định dạng JSON.' }, { status: 400 });
  }

  const parsed = wishSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message || 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }

  const { name, message: rawMessage, side: rawSide, website } = parsed.data;

  // 1. Honeypot check: bot điền trường ẩn này thì trả 200 nhưng không lưu
  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true, id: 'hp' });
  }

  // 2. Chặn URL / link trong nội dung lời chúc
  if (URL_REGEX.test(rawMessage) || URL_REGEX.test(name)) {
    return NextResponse.json(
      { error: 'Lời chúc không được chứa đường dẫn website hoặc liên kết quảng cáo.' },
      { status: 400 },
    );
  }

  // 3. Rate limiting theo IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

  const rateCheck = await checkRateLimit(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Bạn đã gửi lời chúc nhiều lần. Vui lòng thử lại sau ít phút.' },
      { status: 429 },
    );
  }

  // 4. Lưu lời chúc
  const message = cleanText(rawMessage);
  const side = parseSide(rawSide);

  try {
    const item = await wishesRepo.create({
      name,
      message,
      side,
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/wishes] Lỗi tạo lời chúc:', error);
    return NextResponse.json({ error: 'Không thể lưu lời chúc lúc này. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
