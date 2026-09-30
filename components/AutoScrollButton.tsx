'use client';

import { useEffect, useState } from 'react';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useInvite } from './InviteProvider';

export function AutoScrollButton() {
  const { opened } = useInvite();
  const { enabled, toggleEnabled, status, progress, speedIndex, setSpeedIndex, speedsLength } = useAutoScroll();
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    if (opened && enabled && typeof window !== 'undefined') {
      const shown = localStorage.getItem('autoScrollTooltipShown');
      if (!shown) {
        setTooltip(true);
        localStorage.setItem('autoScrollTooltipShown', 'true');
        setTimeout(() => setTooltip(false), 4000);
      }
    }
  }, [opened, enabled]);

  if (!opened) return null;

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeedIndex((speedIndex + 1) % speedsLength);
  };

  const isEnded = status === 'ended';
  // Note: if user manually scrolls, status becomes paused temporarily. We still show it as "isPlaying" conceptually 
  // because it will resume, but if it's paused due to user interaction, maybe they want to see it paused.
  // Actually, if it's autoScrollEnabled = true, it means it's on.
  const isPlaying = enabled && !isEnded;

  return (
    <div className="autoscroll-wrapper">
      {tooltip && <div className="autoscroll-tooltip">Thiệp sẽ tự cuộn, chạm để dừng</div>}
      
      <button className="autoscroll-speed" onClick={cycleSpeed} aria-label="Đổi tốc độ cuộn">
        {speedIndex === 0 ? '0.5x' : speedIndex === 1 ? '1.0x' : '1.5x'}
      </button>

      <button
        className={`autoscroll-btn ${enabled ? 'is-active' : ''}`}
        onClick={toggleEnabled}
        aria-label="Tự động cuộn"
      >
        <svg className="autoscroll-ring" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="bg-ring" />
          <circle 
            cx="18" cy="18" r="16" fill="none" className="fg-ring" 
            strokeDasharray="100" 
            strokeDashoffset={100 - (progress * 100)} 
          />
        </svg>
        
        <span className="autoscroll-icon">
          {isEnded ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </span>
      </button>
    </div>
  );
}
