'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPlayer, type Player } from '@/lib/music';

type InviteState = {
  opened: boolean;
  markOpened: () => void;
  musicEnabled: boolean;
  playing: boolean;
  playMusic: () => void;
  toggleMusic: () => void;
};

const InviteContext = createContext<InviteState | null>(null);

export function useInvite() {
  const ctx = useContext(InviteContext);
  if (!ctx) throw new Error('useInvite phải nằm trong <InviteProvider>');
  return ctx;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  children: ReactNode;
  coverEnabled: boolean;
  music: { enabled: boolean; src?: string; volume?: number };
};

export function InviteProvider({ children, coverEnabled, music }: Props) {
  const [opened, setOpened] = useState(!coverEnabled);
  const [playing, setPlaying] = useState(false);
  const player = useRef<Player | null>(null);
  const userPaused = useRef(false);

  useEffect(() => {
    if (!music.enabled) return;
    player.current = createPlayer(music.src, music.volume);
    return () => player.current?.destroy();
  }, [music.enabled, music.src, music.volume]);

  // Phải gọi đồng bộ trong sự kiện chạm để trình duyệt cho phép phát
  const playMusic = useCallback(() => {
    if (!player.current) return;
    player.current.play().then(setPlaying);
  }, []);

  const pauseMusic = useCallback(() => {
    player.current?.pause();
    setPlaying(false);
  }, []);

  const toggleMusic = useCallback(() => {
    if (playing) {
      userPaused.current = true;
      pauseMusic();
    } else {
      userPaused.current = false;
      playMusic();
    }
  }, [playing, playMusic, pauseMusic]);

  const markOpened = useCallback(() => setOpened(true), []);

  // Khóa cuộn khi còn màn phong bì
  useEffect(() => {
    document.body.classList.toggle('is-locked', !opened);
  }, [opened]);

  // Không có phong bì: phát nhạc ở lần chạm đầu tiên
  useEffect(() => {
    if (coverEnabled || !music.enabled) return;
    const first = () => {
      if (!userPaused.current) playMusic();
    };
    window.addEventListener('pointerdown', first, { once: true });
    return () => window.removeEventListener('pointerdown', first);
  }, [coverEnabled, music.enabled, playMusic]);

  // Tạm dừng nhạc và cánh hoa khi chuyển tab
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      document.body.classList.toggle('is-hidden', document.hidden);
      if (document.hidden && playingRef.current) {
        resume = true;
        pauseMusic();
      } else if (!document.hidden && resume && !userPaused.current) {
        resume = false;
        playMusic();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pauseMusic, playMusic]);

  // Hiệu ứng khi cuộn: chỉ bắt đầu sau khi mở thiệp
  useEffect(() => {
    if (!opened) return;
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    items.forEach((n) => io.observe(n));
    if (coverEnabled) document.getElementById('heroTitle')?.focus({ preventScroll: true });
    return () => io.disconnect();
  }, [opened, coverEnabled]);

  // Parallax nhẹ cho ảnh hero và ảnh cảm ơn
  useEffect(() => {
    if (!opened || prefersReducedMotion()) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      for (const layer of layers) {
        const box = layer.parentElement;
        if (!box) continue;
        const r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const room = (layer.offsetHeight - box.offsetHeight) / 2;
        const speed = parseFloat(layer.dataset.parallax ?? '0.1');
        const y = Math.max(-room, Math.min(room, -(r.top + r.height / 2 - vh / 2) * speed));
        layer.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [opened]);

  const value = useMemo<InviteState>(
    () => ({ opened, markOpened, musicEnabled: music.enabled, playing, playMusic, toggleMusic }),
    [opened, markOpened, music.enabled, playing, playMusic, toggleMusic],
  );

  return <InviteContext.Provider value={value}>{children}</InviteContext.Provider>;
}
