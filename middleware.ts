import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SOCIAL_BOT_REGEX =
  /facebookexternalhit|Facebot|Zalo|ZaloBot|TelegramBot|WhatsApp|Twitterbot|LinkedInBot|Discordbot|Slackbot|Googlebot/i;

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';

  // Bỏ qua mọi giới hạn / xác thực đối với crawler của mạng xã hội và công cụ tìm kiếm
  if (SOCIAL_BOT_REGEX.test(userAgent)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Bỏ qua các đường dẫn tài nguyên tĩnh và api/og:
     * - _next/static, _next/image
     * - api/og
     * - favicon.ico, sitemap.xml, robots.txt
     * - photos, music, fonts
     * - đuôi file ảnh .svg, .png, .jpg, .jpeg, .gif, .webp, .ico
     */
    '/((?!_next/static|_next/image|api/og|favicon\\.ico|robots\\.txt|sitemap\\.xml|photos|music|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
