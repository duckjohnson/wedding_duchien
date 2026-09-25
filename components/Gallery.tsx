'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { GalleryItem } from '@/lib/view';
import { prefersReducedMotion } from './InviteProvider';
import { delay, SectionHead } from './Ornaments';

const SIZES = { t: '(max-width: 480px) 50vw, 240px', n: '(max-width: 480px) 50vw, 240px', w: '(max-width: 480px) 100vw, 480px' };

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [swapKey, setSwapKey] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isOpen = index !== null;

  const open = (i: number) => {
    clearTimeout(hideTimer.current);
    lastFocus.current = document.activeElement as HTMLElement;
    setIndex(i);
    setSwapKey((k) => k + 1);
  };

  const close = useCallback(() => {
    setVisible(false);
    hideTimer.current = setTimeout(() => setIndex(null), prefersReducedMotion() ? 0 : 300);
    lastFocus.current?.focus();
  }, []);

  const nav = useCallback(
    (d: number) => {
      setIndex((i) => (i === null ? i : (i + d + items.length) % items.length));
      setSwapKey((k) => k + 1);
    },
    [items.length],
  );

  // Hiện dần + khóa cuộn khi mở
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') nav(-1);
    else if (e.key === 'ArrowRight') nav(1);
    else if (e.key === 'Tab' && dialog.current) {
      const buttons = Array.from(dialog.current.querySelectorAll('button'));
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault();
      buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
  };

  if (!items.length) return null;
  const current = index === null ? null : items[index];

  return (
    <section className="sec album" aria-labelledby="t-album">
      <SectionHead id="t-album" title="Album ảnh cưới" sub="Chạm vào ảnh để xem lớn" />
      <div className="gallery">
        {items.map((g, i) => (
          <button
            key={i}
            type="button"
            className={`g-item ${g.shape}`}
            aria-label={`Xem ${g.alt.toLowerCase()}`}
            data-reveal="zoom"
            style={delay((i % 4) * 0.08)}
            onClick={() => open(i)}
          >
            <Image src={g.src} alt="" fill sizes={SIZES[g.shape]} />
          </button>
        ))}
      </div>

      {current ? (
        <div
          ref={dialog}
          className={visible ? 'lightbox is-open' : 'lightbox'}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh cưới"
          onClick={(e) => e.target === e.currentTarget && close()}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <Image
            key={swapKey}
            className="lb-img swap"
            src={current.src}
            alt={current.alt}
            width={1600}
            height={1200}
            sizes="92vw"
            draggable={false}
          />
          <button ref={closeBtn} className="lb-btn lb-close" type="button" aria-label="Đóng" onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <button className="lb-btn lb-prev" type="button" aria-label="Ảnh trước" onClick={() => nav(-1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <button className="lb-btn lb-next" type="button" aria-label="Ảnh sau" onClick={() => nav(1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <p className="lb-count">{index! + 1} / {items.length}</p>
        </div>
      ) : null}
    </section>
  );
}
