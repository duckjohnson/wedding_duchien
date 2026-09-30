'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { autoScrollConfig } from '@/config/autoScroll';
import { useInvite } from '@/components/InviteProvider';

export type ScrollStatus = 'idle' | 'scrolling' | 'paused' | 'ended';

export function useAutoScroll() {
  const { opened } = useInvite();
  const [status, setStatus] = useState<ScrollStatus>('idle');
  const [progress, setProgress] = useState(0);

  const [speedIndex, setSpeedIndexState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoScrollSpeed');
      if (saved) return parseInt(saved, 10);
    }
    return autoScrollConfig.defaultSpeedIndex;
  });

  const [enabled, setEnabledState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoScrollEnabled');
      if (saved !== null) return saved === 'true';
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const setSpeedIndex = useCallback((index: number) => {
    setSpeedIndexState(index);
    localStorage.setItem('autoScrollSpeed', index.toString());
  }, []);

  const setEnabled = useCallback((val: boolean) => {
    setEnabledState(val);
    localStorage.setItem('autoScrollEnabled', val.toString());
    if (val && status === 'ended') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStatus('idle');
    }
  }, [status]);

  const toggleEnabled = useCallback(() => {
    setEnabledState((prev) => {
      const newVal = !prev;
      localStorage.setItem('autoScrollEnabled', newVal.toString());
      if (newVal && status === 'ended') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStatus('idle');
      }
      return newVal;
    });
  }, [status]);

  const stateRef = useRef({
    lastInteractionTime: 0,
    isFocusingInput: false,
    hasOverlay: false,
    isVisible: true,
    lastFrameTime: 0,
    currentPauseEnd: 0,
    visitedSections: new Set<string>(),
    isProgrammaticScroll: false,
  });

  // Check overlay (modal/lightbox)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasOpenModal = document.body.classList.contains('is-hidden') || document.body.style.overflow === 'hidden' || !!document.querySelector('.is-open') || !!document.querySelector('[role="dialog"]');
      stateRef.current.hasOverlay = hasOpenModal;
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Visibility
  useEffect(() => {
    const onVisibility = () => {
      stateRef.current.isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // User interactions
  useEffect(() => {
    const onInteract = () => {
      stateRef.current.lastInteractionTime = performance.now();
    };
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        stateRef.current.isFocusingInput = true;
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        stateRef.current.isFocusingInput = false;
        stateRef.current.lastInteractionTime = performance.now();
      }
    };
    const onScroll = () => {
      if (!stateRef.current.isProgrammaticScroll) {
        onInteract();
      }
    };

    window.addEventListener('touchstart', onInteract, { passive: true });
    window.addEventListener('touchmove', onInteract, { passive: true });
    window.addEventListener('wheel', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    return () => {
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('touchmove', onInteract);
      window.removeEventListener('wheel', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Main loop
  useEffect(() => {
    if (!opened || !enabled) {
      if (status !== 'idle' && status !== 'ended') setStatus('paused');
      return;
    }

    let rafId: number;
    const startWaitTime = performance.now();

    const loop = (time: DOMHighResTimeStamp) => {
      const state = stateRef.current;
      
      // Calculate progress
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setProgress(scrollTop / scrollHeight);
      }

      if (scrollTop >= scrollHeight - 1) {
        setStatus('ended');
        return;
      }

      const delta = time - (state.lastFrameTime || time);
      state.lastFrameTime = time;

      // Logic pause
      const timeSinceOpen = time - startWaitTime;
      if (timeSinceOpen < autoScrollConfig.startDelay) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      const timeSinceInteract = time - state.lastInteractionTime;
      const isUserPaused = state.isFocusingInput || state.hasOverlay || !state.isVisible || timeSinceInteract < autoScrollConfig.resumeDelay;
      
      if (isUserPaused) {
        setStatus('paused');
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (time < state.currentPauseEnd) {
        setStatus('paused');
        rafId = requestAnimationFrame(loop);
        return;
      }

      // Check section pauses
      for (const p of autoScrollConfig.pausePoints) {
        const el = document.querySelector(p.selector) as HTMLElement;
        if (el && !state.visitedSections.has(p.selector)) {
          const rect = el.getBoundingClientRect();
          // If the top of the section reaches the top 10% of viewport, or if it's already in view and we just arrived
          if (rect.top <= window.innerHeight * 0.1 && rect.top >= -100) {
            state.visitedSections.add(p.selector);
            state.currentPauseEnd = time + p.duration;
            setStatus('paused');
            rafId = requestAnimationFrame(loop);
            return;
          }
        }
      }

      // Scroll
      setStatus('scrolling');
      const speed = autoScrollConfig.speeds[speedIndex];
      // delta ~ 16.6ms for 60Hz. So (delta / 16.6) * speed gives speed per frame normalized.
      const pixelsToScroll = speed * (delta / 16.666);
      
      if (pixelsToScroll > 0 && pixelsToScroll < 50) { // Safety bound
        state.isProgrammaticScroll = true;
        window.scrollBy({ top: pixelsToScroll, behavior: 'auto' });
        // Reset flag immediately after scroll
        setTimeout(() => {
          state.isProgrammaticScroll = false;
        }, 0);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [opened, enabled, speedIndex]);

  // CSS override for smooth scroll conflict
  useEffect(() => {
    if (status === 'scrolling') {
      document.documentElement.classList.add('is-auto-scrolling');
    } else {
      document.documentElement.classList.remove('is-auto-scrolling');
    }
  }, [status]);

  return {
    enabled,
    toggleEnabled,
    status,
    progress,
    speedIndex,
    setSpeedIndex,
    speedsLength: autoScrollConfig.speeds.length,
  };
}
