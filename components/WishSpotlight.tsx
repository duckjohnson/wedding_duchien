'use client';

import { useState, useEffect, useRef } from 'react';
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

function getPastelColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return WISHES_UI.PASTEL_PALETTE[Math.abs(hash) % WISHES_UI.PASTEL_PALETTE.length];
}

type Props = {
  wishes: WishItem[];
};

export function WishSpotlight({ wishes }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wishes.length === 0) return;

    let timer: NodeJS.Timeout;
    let observer: IntersectionObserver;

    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    const runTimer = () => {
      timer = setInterval(() => {
        if (!isPaused) {
          setDirection(1);
          setCurrentIndex((prev) => (prev + 1) % wishes.length);
        }
      }, WISHES_UI.SPOTLIGHT_INTERVAL_MS);
    };

    document.addEventListener('visibilitychange', handleVisibility);

    if (spotlightRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              setIsPaused(true);
            } else {
              setIsPaused(false);
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(spotlightRef.current);
    }

    runTimer();

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
    };
  }, [wishes.length, isPaused]);

  // Reset currentIndex if wishes array changes and it's out of bounds
  useEffect(() => {
    if (wishes.length > 0 && currentIndex >= wishes.length) {
      setCurrentIndex(0);
    }
  }, [wishes.length, currentIndex]);

  if (wishes.length === 0) {
    return (
      <div className="wishes-empty-state">
        <div className="wishes-empty-icon" aria-hidden="true">💌</div>
        <p className="wishes-empty-text">Hãy là người đầu tiên gửi lời chúc tới cô dâu & chú rể!</p>
      </div>
    );
  }

  const currentWish = wishes[currentIndex];
  const pastel = getPastelColor(currentWish.name);
  const initial = getInitialLetter(currentWish.name);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? wishes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % wishes.length);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div 
      className="wish-spotlight-container"
      ref={spotlightRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="wish-spotlight-card">
        <div className="wish-spotlight-quote-icon" aria-hidden="true">“</div>
        
        <div className="wish-spotlight-content-wrapper">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="wish-spotlight-inner"
            >
              <div 
                className="wish-spotlight-avatar"
                style={{
                  backgroundColor: pastel.bg,
                  color: pastel.text,
                  borderColor: pastel.border,
                }}
              >
                {initial}
              </div>
              <p className="wish-spotlight-message">{currentWish.message}</p>
              <p className="wish-spotlight-name">— {currentWish.name} —</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="wish-spotlight-progress-bg">
          <motion.div
            key={currentIndex}
            className="wish-spotlight-progress-bar"
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? '0%' : '100%' }}
            transition={{
              duration: isPaused ? 0 : WISHES_UI.SPOTLIGHT_INTERVAL_MS / 1000,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      <div className="wish-spotlight-controls">
        <button className="wish-spotlight-nav-btn" onClick={handlePrev} aria-label="Previous wish">
          ❮
        </button>
        <button className="wish-spotlight-nav-btn" onClick={handleNext} aria-label="Next wish">
          ❯
        </button>
      </div>
    </div>
  );
}
