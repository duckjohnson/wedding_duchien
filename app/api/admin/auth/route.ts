import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAdminSession, createAdminToken, COOKIE_NAME } from '@/lib/admin-auth';

export async function GET() {
  const isAuth = await checkAdminSession();
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD || 'Congnguyenhd97@';
  if (body.password !== expected) {
    return NextResponse.json({ error: 'Mật khẩu quản trị không chính xác.' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
