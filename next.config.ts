import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Dùng ảnh từ web khác (không nằm trong public/photos) thì thêm tên miền vào đây, ví dụ:
    // remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
};

export default nextConfig;
