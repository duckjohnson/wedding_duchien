import { Metadata } from 'next';
import ShareClient from './ShareClient';

export const metadata: Metadata = {
  title: 'Tạo link gửi khách',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SharePage() {
  return <ShareClient />;
}
