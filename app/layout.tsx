import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { wedding } from '@/config/wedding';
import { fontSans, fontScript, fontSerif, fontAllison } from './fonts';
import './globals.css';

const title = `Thiệp cưới ${wedding.bride.name} & ${wedding.groom.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title,
  description: wedding.meta.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5E0F15',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Màu ghi đè từ config/wedding.ts > theme
  const themeVars = Object.fromEntries(
    Object.entries(wedding.theme).filter(([, v]) => v).map(([k, v]) => [`--${k}`, v]),
  ) as CSSProperties;

  return (
    <html lang="vi" className={`${fontScript.variable} ${fontSerif.variable} ${fontSans.variable} ${fontAllison.variable}`} style={themeVars}>
      <head>
        {/* Chỉ tải đúng một ký tự 囍 (vài KB) thay vì cả bộ font chữ Hán */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&text=%E5%9B%8D&display=swap" />
      </head>
      <body className={wedding.cover.enabled ? 'is-locked' : undefined}>{children}</body>
    </html>
  );
}
