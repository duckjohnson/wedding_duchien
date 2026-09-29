'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper core styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { albumPhotos, getAlbumImageUrl, getFullImageUrl, type AlbumPhoto } from '@/data/album';
import type { GalleryItem } from '@/lib/view';
import { prefersReducedMotion } from './InviteProvider';
import { SectionHead } from './Ornaments';

const SHAPES = ['t', 'n', 'n', 'w', 'n', 't', 'n', 'w', 't', 't', 'w'] as const;
const SIZES = {
  t: '(max-width: 480px) 50vw, 240px',
  n: '(max-width: 480px) 50vw, 240px',
  w: '(max-width: 480px) 100vw, 480px',
};

type Props = {
  items?: GalleryItem[];
};

export function Gallery({ items: _items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const photos: AlbumPhoto[] = albumPhotos;
  const total = photos.length;

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  // Tạm dừng khi tab ẩn / Resume khi tab hiện
  useEffect(() => {
    const handleVisibility = () => {
      if (!swiperRef.current || reduced) return;
      if (document.hidden) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [reduced]);

  // Tạm dừng khi carousel ra khỏi viewport / Resume khi vào lại
  useEffect(() => {
    if (!containerRef.current || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!swiperRef.current || reduced) return;
        if (entry.isIntersecting) {
          swiperRef.current.autoplay.start();
        } else {
          swiperRef.current.autoplay.stop();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [reduced]);

  // Hẹn giờ chạy lại autoplay sau 3s kể từ khi người dùng thả tay
  const handleTouchEndOrInteraction = () => {
    if (!swiperRef.current || reduced) return;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      if (swiperRef.current && !reduced) {
        swiperRef.current.autoplay.start();
      }
    }, 3000);
  };

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navLightbox = useCallback(
    (dir: number) => {
      setLightboxIndex((prev) => (prev === null ? null : (prev + dir + total) % total));
    },
    [total],
  );

  // Khóa cuộn màn hình khi mở lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  // Phím tắt bàn phím
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (lightboxIndex !== null) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navLightbox(-1);
      else if (e.key === 'ArrowRight') navLightbox(1);
    }
  };

  // Vuốt chạm trong Lightbox
  const handleLbTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleLbTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(dx) > 50) {
      navLightbox(dx < 0 ? 1 : -1);
    }
  };

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section className="sec album" aria-labelledby="t-album" onKeyDown={handleKeyDown}>
      <SectionHead id="t-album" title="Album ảnh cưới" sub="Chạm vào ảnh để xem lớn" />

      {/* ===================== 1. 3D COVERFLOW CAROUSEL (SWIPER) ===================== */}
      <div className="album-swiper-wrapper" ref={containerRef}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          effect={reduced ? 'slide' : 'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true}
          speed={1100}
          slideToClickedSlide={true}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 120,
            modifier: 1,
            scale: 0.85,
            slideShadows: false,
          }}
          autoplay={
            reduced
              ? false
              : {
                  delay: 3600,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          pagination={{
            el: '.album-swiper-pagination',
            clickable: true,
          }}
          navigation={{
            prevEl: '.album-swiper-prev',
            nextEl: '.album-swiper-next',
          }}
          onTouchEnd={handleTouchEndOrInteraction}
          onSliderMove={() => {
            if (resumeTimer.current) clearTimeout(resumeTimer.current);
          }}
          className="album-swiper"
        >
          {photos.map((photo, i) => {
            const carouselUrl = getAlbumImageUrl(photo.publicId, {
              width: 900,
              aspectRatio: '3:4',
              crop: 'c_fill',
              gravity: 'g_faces',
            });

            return (
              <SwiperSlide
                key={photo.id}
                onClick={() => {
                  if (swiperRef.current) {
                    // Nếu là slide ở giữa (active): mở lightbox; nếu ở hai bên: swiper tự trượt về giữa
                    if (swiperRef.current.realIndex === i) {
                      openLightbox(i);
                    }
                  }
                }}
              >
                <Image
                  src={carouselUrl}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 68vw, (max-width: 1024px) 300px, 320px"
                  priority={i === 0}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Nút điều hướng desktop (ẩn trên mobile, desktop hiện mờ khi hover) */}
        <button
          type="button"
          className="album-swiper-nav-btn album-swiper-prev"
          aria-label="Xem ảnh trước"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="m12 4-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          className="album-swiper-nav-btn album-swiper-next"
          aria-label="Xem ảnh tiếp theo"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Dãy dots nhỏ tinh tế bên dưới */}
        <div className="album-swiper-pagination" />
      </div>

      {/* ===================== 2. LƯỚI ẢNH 3D TILT ===================== */}
      <h3 className="gallery-grid-title">Khoảnh khắc trọn vẹn</h3>

      <div className="gallery">
        {photos.map((photo, i) => {
          const gridUrl = getAlbumImageUrl(photo.publicId, {
            width: 800,
            crop: 'c_scale',
          });

          return (
            <div
              key={photo.id}
              className="g-item masonry-item"
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  position: 'relative',
                  background: 'none',
                  border: 0,
                  padding: 0,
                  cursor: 'zoom-in',
                  display: 'block',
                }}
                aria-label="Xem ảnh cưới phóng to"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={gridUrl}
                  alt=""
                  loading="lazy"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* ===================== 3. LIGHTBOX ANIMATION ===================== */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            ref={dialogRef}
            className="lightbox is-open"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh cưới lớn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.target === e.currentTarget && closeLightbox()}
            onTouchStart={handleLbTouchStart}
            onTouchEnd={handleLbTouchEnd}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                key={activePhoto.id}
                className="lb-img"
                src={getFullImageUrl(activePhoto.publicId)}
                alt=""
                width={1600}
                height={1200}
                sizes="94vw"
                draggable={false}
                priority
              />
            </motion.div>

            <button
              ref={closeBtnRef}
              className="lb-btn lb-close"
              type="button"
              aria-label="Đóng xem ảnh lớn"
              onClick={closeLightbox}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <button
              className="lb-btn lb-prev"
              type="button"
              aria-label="Ảnh trước"
              onClick={() => navLightbox(-1)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="m12 4-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <button
              className="lb-btn lb-next"
              type="button"
              aria-label="Ảnh sau"
              onClick={() => navLightbox(1)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <p className="lb-count">
              {lightboxIndex + 1} / {total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
