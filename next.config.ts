import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Một deployment, hai link: /nha-trai và /nha-gai (giữ nguyên ?khach=...)
  async rewrites() {
    return [
      { source: '/nha-trai', destination: '/?side=groom' },
      { source: '/nha-gai', destination: '/?side=bride' },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Dùng ảnh từ web khác (không nằm trong public/photos) thì thêm tên miền vào đây, ví dụ:
    // remotePatterns: [{ protocol: 'https', hostname: 'ten-mien.com' }],
  },
};

export default nextConfig;
