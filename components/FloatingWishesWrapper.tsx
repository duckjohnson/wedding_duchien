'use client';

import useSWR from 'swr';
import { FloatingWishes } from './FloatingWishes';
import type { WishItem } from '@/lib/wishes-repo';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function FloatingWishesWrapper() {
  const { data } = useSWR<{ items: WishItem[]; total: number }>('/api/wishes?limit=100', fetcher, {
    revalidateOnFocus: false,
  });

  const wishes = data?.items || [];

  return <FloatingWishes wishes={wishes} />;
}
