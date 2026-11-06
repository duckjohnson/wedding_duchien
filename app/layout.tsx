import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { wedding } from '@/config/wedding';
import { fontSans, fontScript, fontSerif, fontAllison } from './fonts';
import './globals.css';

// Chuỗi fallback: NEXT_PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL → VERCEL_URL → localhost
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Nhà trai: "Hữu Đức & Vũ Hiền" – Nhà gái: "Vũ Hiền & Hữu Đức"
const [first, second] =
  wedding.side === 'bride'
    ? [wedding.bride.name, wedding.groom.name]
    : [wedding.groom.name, wedding.bride.name];

const title = `Thiệp cưới ${first} & ${second}`;
const ogImage = '/photos/og.jpg'; // FIX CỨNG: cắt từ a3.jpeg, 1200×630

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description: wedding.meta.description,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: title,
    title,
    description: wedding.meta.description,
    images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: wedding.meta.description,
    images: ogImage ? [ogImage] : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5E0F15',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Màu ghi đè từ config > theme
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
