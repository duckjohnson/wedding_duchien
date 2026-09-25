import type { CSSProperties, ReactNode } from 'react';

/** Độ trễ cho hiệu ứng [data-reveal], tính bằng giây */
export const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

/** Các hình SVG dùng lại nhiều lần: hoa sen, góc khung */
export function SvgSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="lotus" viewBox="0 0 60 30">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M30 3c-5 6-6 14 0 23 6-9 5-17 0-23Z" />
          <path d="M30 26c-7-1-14-6-17-15 7 1 13 6 17 15Z" />
          <path d="M30 26c7-1 14-6 17-15-7 1-13 6-17 15Z" />
          <path d="M22 27h16" />
        </g>
      </symbol>
      <symbol id="corner" viewBox="0 0 40 40">
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <path d="M2 38V14C2 7.4 7.4 2 14 2h24" />
          <path d="M8 38V17c0-5 4-9 9-9h21" />
          <path d="M14 14c6 0 9 4 7.5 8-1 2.5-4.5 2-4.5-.5 0-2 2.4-2.2 3-1" />
        </g>
      </symbol>
    </svg>
  );
}

export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span />
      <svg>
        <use href="#lotus" />
      </svg>
      <span />
    </div>
  );
}

export function SectionHead({ id, title, sub }: { id: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="sec-head">
      <h2 className="sec-title" id={id} data-reveal="up">
        {title}
      </h2>
      {sub ? (
        <p className="sec-sub" data-reveal="up">
          {sub}
        </p>
      ) : null}
      <Divider />
    </header>
  );
}

export function Corners() {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <svg key={c} className={`corner ${c}`} aria-hidden="true">
          <use href="#corner" />
        </svg>
      ))}
    </>
  );
}
