'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, useInvite } from './InviteProvider';

// firstName đứng trước: nhà trai → tên chú rể, nhà gái → tên cô dâu
type Props = { firstName: string; secondName: string; dateShort: string; guest: string };

type Phase = 'idle' | 'open' | 'leaving' | 'gone';

export function Cover({ firstName, secondName, dateShort, guest }: Props) {
  const { playMusic, markOpened } = useInvite();
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (phase !== 'idle') return;
    playMusic(); // phát trong chính cú chạm của người xem
    setPhase('open');
    const wait = prefersReducedMotion() ? 0 : 1650;
    timers.current.push(
      setTimeout(() => {
        setPhase('leaving');
        markOpened();
      }, wait),
      setTimeout(() => setPhase('gone'), wait + (wait ? 950 : 20)),
    );
  };

  if (phase === 'gone') return null;

  const cls = ['cover', phase !== 'idle' && 'is-open', phase === 'leaving' && 'is-leaving'].filter(Boolean).join(' ');

  return (
    <div className={cls} id="cover">
      <div className="cover-inner">
        <p className="cover-kicker">Thiệp mời cưới</p>
        <p className="cover-names">
          {firstName.split('A').flatMap((part, i, arr) => i < arr.length - 1 ? [part, <span key={i} className="font-allison">A</span>] : [part])}
          <span className="amp">&amp;</span>
          {secondName.split('A').flatMap((part, i, arr) => i < arr.length - 1 ? [part, <span key={i} className="font-allison">A</span>] : [part])}
        </p>
        <button className="env" type="button" aria-label="Mở thiệp mời" onClick={open}>
          <span className="env-back" />
          <span className="env-card" aria-hidden="true">
            <span className="env-card-hy">囍</span>
            <span className="env-card-date">{dateShort}</span>
          </span>
          <span className="env-front">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 100 50 60 100 100" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <span className="env-flap">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0 50 100 100 0" fill="none" stroke="#C9A45C" strokeOpacity=".8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <span className="env-guest">
            <small>Kính gửi</small>
            <strong>{guest}</strong>
          </span>
          <span className="env-seal" aria-hidden="true">囍</span>
        </button>
        <p className="cover-hint" aria-hidden="true">Chạm vào phong bì để mở thiệp</p>
      </div>
    </div>
  );
}
