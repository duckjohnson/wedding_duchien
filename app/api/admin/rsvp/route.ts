import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/admin-auth';
import { rsvpRepo } from '@/lib/rsvp-repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị.' }, { status: 401 });
  }

  try {
    const result = await rsvpRepo.list({ limit: 1000 });
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[Admin GET rsvp] Lỗi:', err);
    return NextResponse.json({ error: 'Không thể tải danh sách phản hồi.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID cần xóa.' }, { status: 400 });
    }

    const ok = await rsvpRepo.remove(id);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('[Admin DELETE rsvp] Lỗi:', err);
    return NextResponse.json({ error: 'Lỗi khi xóa phản hồi.' }, { status: 500 });
  }
}
