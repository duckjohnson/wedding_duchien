import { NextResponse } from 'next/server';

/**
 * /api/og (và /api/og?guest=...) – giữ lại để các link cũ không bị 404.
 * Luôn chuyển hướng tới ảnh xem trước mới, KHÔNG còn dùng Cloudinary.
 */
export function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/photos/og.jpg?v=5', req.url), 302);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
