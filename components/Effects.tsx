'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion, useInvite } from './InviteProvider';

export function MusicButton() {
  const { opened, musicEnabled, playing, toggleMusic } = useInvite();
  if (!musicEnabled) return null;
  return (
    <button
      className={['music', opened && 'is-visible', playing && 'is-playing'].filter(Boolean).join(' ')}
      type="button"
      aria-pressed={playing}
      aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      onClick={toggleMusic}
    >
      <svg className="ico-on" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.5" cy="16" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="ico-off" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.5" cy="16" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}

type Petal = { id: number; style: CSSProperties };

export function Petals() {
  const { opened } = useInvite();
  const [petals, setPetals] = useState<Petal[]>([]);
  const [on, setOn] = useState(false);

  // Tạo ngẫu nhiên ở client để không lệch với HTML từ server
  useEffect(() => {
    if (!opened || prefersReducedMotion()) return;
    const n = window.innerWidth < 600 ? 12 : 18;
    setPetals(
      Array.from({ length: n }, (_, id) => ({
        id,
        style: {
          '--x': `${(Math.random() * 100).toFixed(1)}vw`,
          '--s': `${(8 + Math.random() * 9).toFixed(1)}px`,
          '--dur': `${(11 + Math.random() * 9).toFixed(1)}s`,
          '--delay': `${(-Math.random() * 20).toFixed(1)}s`,
          '--sw': `${(2.8 + Math.random() * 2.4).toFixed(1)}s`,
          '--o': (0.35 + Math.random() * 0.4).toFixed(2),
          '--c': Math.random() < 0.78 ? 'var(--petal)' : 'var(--kim)',
        } as CSSProperties,
      })),
    );
    const raf = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(raf);
  }, [opened]);

  return (
    <div className={on ? 'petals is-on' : 'petals'} aria-hidden="true">
      {petals.map((p) => (
        <span key={p.id} className="petal" style={p.style}>
          <i />
        </span>
      ))}
    </div>
  );
}
