import { NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/admin-auth';
import { wishesRepo } from '@/lib/wishes-repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị.' }, { status: 401 });
  }

  try {
    const result = await wishesRepo.list({
      limit: 100,
      includeUnapproved: true,
    });
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[Admin GET wishes] Lỗi:', err);
    return NextResponse.json({ error: 'Không thể tải danh sách.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, approved } = body;
    if (!id || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Tham số không hợp lệ.' }, { status: 400 });
    }

    const ok = await wishesRepo.hide(id, approved);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('[Admin PATCH wish] Lỗi:', err);
    return NextResponse.json({ error: 'Lỗi cập nhật trạng thái.' }, { status: 500 });
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

    const ok = await wishesRepo.remove(id);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('[Admin DELETE wish] Lỗi:', err);
    return NextResponse.json({ error: 'Lỗi khi xóa lời chúc.' }, { status: 500 });
  }
}
