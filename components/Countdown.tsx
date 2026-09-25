'use client';

import { useEffect, useState } from 'react';
import { delay } from './Ornaments';

type Parts = { d: number; h: number; m: number; s: number } | 'done' | null;

const pad = (n: number) => String(n).padStart(2, '0');

function partsUntil(target: number): Parts {
  const diff = target - Date.now();
  if (diff <= 0) return 'done';
  const s = Math.floor(diff / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ target }: { target: string }) {
  // Server chưa biết giờ của người xem, nên chỉ tính sau khi trang chạy ở trình duyệt
  const [parts, setParts] = useState<Parts>(null);

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => {
      const p = partsUntil(t);
      setParts(p);
      return p !== 'done';
    };
    if (!tick()) return;
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (parts === 'done') {
    return <p className="cd-done">Ngày vui đã đến. Cảm ơn bạn đã chung vui cùng chúng mình!</p>;
  }

  const cells: [string, string][] = [
    [parts ? String(parts.d) : '–', 'Ngày'],
    [parts ? pad(parts.h) : '–', 'Giờ'],
    [parts ? pad(parts.m) : '–', 'Phút'],
    [parts ? pad(parts.s) : '–', 'Giây'],
  ];

  return (
    <div className="countdown" data-reveal="up" style={delay(0.15)}>
      {cells.map(([num, label]) => (
        <div key={label} className="cd-cell">
          <span className="cd-num">{num}</span>
          <span className="cd-lbl">{label}</span>
        </div>
      ))}
    </div>
  );
}
