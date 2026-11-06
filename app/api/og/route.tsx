import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { wedding } from '@/config/wedding';
import { buildOgImageUrl } from '@/lib/og';

export const runtime = 'edge';

/**
 * /api/og?guest=TenKhach&v=2
 * Fallback server-render khi Cloudinary URL không dùng được.
 * Ưu tiên dùng buildOgImageUrl() (Cloudinary) → redirect nếu không cần render.
 * Tuyệt đối không trả 500 – lỗi bất kỳ → ảnh mặc định 200.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestParam =
      searchParams.get('guest') ??
      searchParams.get('khach') ??
      searchParams.get('name') ??
      searchParams.get('to');
    const name = guestParam?.trim().slice(0, 60) ?? '';

    // Redirect thẳng sang Cloudinary để Zalo/Messenger nhận JPEG nhanh nhất
    const cloudinaryUrl = buildOgImageUrl(name);
    return Response.redirect(cloudinaryUrl, 302);
  } catch (_e) {
    // Nếu lỗi bất kỳ → trả ảnh nền mặc định redirect
    const fallback = wedding.meta.ogImage;
    if (fallback) return Response.redirect(fallback, 302);

    // Cuối cùng → render ảnh trắng đơn giản 200
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3c080c',
            color: '#F5E6D3',
            fontSize: 60,
          }}
        >
          Vũ Hiền &amp; Hữu Đức
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      },
    );
  }
}
