'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WishItem } from '@/lib/wishes-repo';
import { WISHES_UI } from '@/config/wishes-ui';

function getInitialLetter(name: string) {
  const clean = name.trim();
  if (!clean) return '♥';
  const parts = clean.split(/\s+/);
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase();
}

export function FloatingWishes({ wishes }: { wishes: WishItem[] }) {
  const [currentWish, setCurrentWish] = useState<WishItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('wedding:floating-wishes-dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    setCurrentWish(null);
    sessionStorage.setItem('wedding:floating-wishes-dismissed', 'true');
  };

  const pickRandomWish = useCallback(() => {
    if (wishes.length === 0 || isDismissed) return;

    // Condition 1: Don't show if Sổ lưu bút is in viewport
    const wishesBook = document.getElementById('so-luu-but');
    if (wishesBook) {
      const rect = wishesBook.getBoundingClientRect();
      const inViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      ) || (rect.top < window.innerHeight && rect.bottom > 0);
      
      if (inViewport) return;
    }

    // Condition 2: Don't show if input/textarea is focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
      return;
    }

    // Condition 3: Don't show if a lightbox/modal is open (usually body has overflow hidden or specific class)
    if (document.body.style.overflow === 'hidden' || document.querySelector('[role="dialog"]') || document.querySelector('.yarl__container')) {
      return;
    }

    // Pick a wish that hasn't been shown yet, or reset if all shown
    const unshownWishes = wishes.filter(w => !shownIds.has(w.id));
    let pool = unshownWishes;
    if (pool.length === 0) {
      pool = wishes;
      setShownIds(new Set());
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    
    setShownIds(prev => new Set(prev).add(selected.id));
    setCurrentWish(selected);

    // Hide it after FLOATING_DURATION_MS
    setTimeout(() => {
      setCurrentWish(null);
    }, WISHES_UI.FLOATING_DURATION_MS);

  }, [wishes, shownIds, isDismissed]);

  useEffect(() => {
    if (isDismissed || wishes.length === 0) return;

    const interval = setInterval(() => {
      if (!currentWish) {
        pickRandomWish();
      }
    }, WISHES_UI.FLOATING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pickRandomWish, currentWish, isDismissed, wishes.length]);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {currentWish && (
        <motion.div
          key={currentWish.id}
          className="floating-wish-bubble"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <button className="floating-wish-close" onClick={dismiss} aria-label="Close" type="button">
            &times;
          </button>
          <div className="floating-wish-content">
            <div className="floating-wish-avatar">
              {getInitialLetter(currentWish.name)}
            </div>
            <div className="floating-wish-text">
              <strong>{currentWish.name}</strong>
              <p>{currentWish.message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
