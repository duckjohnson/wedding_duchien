import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes, Allison } from 'next/font/google';

// next/font tự tải font về khi build và phục vụ từ chính website (không gọi Google lúc khách xem)
export const fontScript = Great_Vibes({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--ff-script',
  display: 'swap',
});

export const fontSerif = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  style: ['normal', 'italic'],
  variable: '--ff-serif',
  display: 'swap',
});

export const fontSans = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin', 'vietnamese'],
  variable: '--ff-sans',
  display: 'swap',
});

export const fontAllison = Allison({
  weight: '400',
  subsets: ['latin'],
  variable: '--ff-allison',
  display: 'swap',
});
