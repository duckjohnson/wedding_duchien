'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import type { WeddingConfig } from '@/config/wedding';
import type { View } from '@/lib/view';
import { Countdown } from './Countdown';
import { prefersReducedMotion } from './InviteProvider';
import { Corners, delay, Divider, SectionHead } from './Ornaments';

type P = { w: WeddingConfig; v: View };

/* ===================== 1. ẢNH CÔ DÂU CHÚ RỂ (HERO) ===================== */
export function Hero({ w, v }: P) {
  const heroRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax 2-3 lớp chiều sâu
  const yPhoto = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const yFrame = useTransform(scrollYProgress, [0, 1], ['0px', '26px']);
  const yText = useTransform(scrollYProgress, [0, 1], ['0px', '46px']);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <p className="hero-kicker" data-reveal="up">Lễ thành hôn</p>

      {/* Lớp 2: Khung viền ảnh + 3D Tilt theo chuột trên desktop và gyroscope trên mobile */}
      <motion.div
        style={{ y: reduced ? 0 : yFrame }}
        data-reveal="arch"
        className="hero-tilt-wrap"
      >
        <Tilt
          tiltMaxAngleX={7}
          tiltMaxAngleY={7}
          perspective={1000}
          scale={1.02}
          gyroscope={true}
          glareEnable={!reduced}
          glareMaxOpacity={0.16}
          glareColor="#ffffff"
          glarePosition="all"
          glareBorderRadius="999px 999px 22px 22px"
          transitionSpeed={1200}
          tiltEnable={!reduced}
        >
          <div className="hero-frame" style={{ margin: 0, width: '100%' }}>
            <div className="hero-photo">
              {/* Lớp 1: Ảnh nền dịch chậm */}
              <motion.div
                className="parallax-layer"
                style={{ y: reduced ? 0 : yPhoto }}
              >
                <Image
                  src={v.photos.hero}
                  alt="Ảnh cưới của chú rể và cô dâu"
                  fill
                  priority
                  className="img-cover"
                  sizes="(max-width: 480px) 90vw, 330px"
                />
              </motion.div>
            </div>
          </div>
        </Tilt>
      </motion.div>

      {/* Lớp 3: Tên cô dâu chú rể và thông tin dịch chuyển nhanh hơn */}
      <motion.div style={{ y: reduced ? 0 : yText }}>
        <h1 className="hero-names" id="heroTitle" tabIndex={-1}>
          <span className="hn" data-reveal="up" style={delay(0.6)}>{w.bride.name}</span>
          <span className="hn-amp" data-reveal="zoom" style={delay(0.8)}>&amp;</span>
          <span className="hn" data-reveal="up" style={delay(0.95)}>{w.groom.name}</span>
        </h1>
        <div className="datelock" data-reveal="up" style={delay(1.15)}>
          <span className="dl-side">{v.weekday}</span>
          <span className="dl-day">{v.day}</span>
          <span className="dl-side">{v.monthLabel}<br />{v.year}</span>
        </div>
        <p className="hero-lunar" data-reveal="up" style={delay(1.3)}>{v.mainLunar}</p>
      </motion.div>

      <a className="scroll-cue" href="#loimoi" aria-label="Xem lời mời">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m4 7 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </a>
    </section>
  );
}

/* ===================== 2. LỜI MỜI ===================== */
export function Letter({ w, guest }: { w: WeddingConfig; guest: string }) {
  const fam = (label: string, f: WeddingConfig['families']['groom'], dir: 'left' | 'right', d: number) => (
    <div className="family" data-reveal={dir} style={delay(d)}>
      <h3 className="family-label">{label}</h3>
      <p>{f.father}</p>
      <p>{f.mother}</p>
      {f.address ? <p className="family-addr">{f.address}</p> : null}
    </div>
  );
  return (
    <section className="sec letter" id="loimoi" aria-labelledby="t-letter">
      <h2 className="sr-only" id="t-letter">Thư mời</h2>
      <div className="families">
        {fam('Nhà gái', w.families.bride, 'left', 0)}
        {fam('Nhà trai', w.families.groom, 'right', 0.1)}
      </div>
      <div className="hy" data-reveal="zoom" aria-hidden="true">囍</div>
      <p className="announce" data-reveal="up">Trân trọng báo tin lễ thành hôn của con chúng tôi</p>
      <div className="pair">
        <div data-reveal="up">
          {w.bride.role ? <span className="pair-role">{w.bride.role}</span> : null}
          <span className="pair-name">{w.bride.fullName}</span>
        </div>
        <span className="pair-amp" data-reveal="zoom" aria-hidden="true">&amp;</span>
        <div data-reveal="up" style={delay(0.1)}>
          {w.groom.role ? <span className="pair-role">{w.groom.role}</span> : null}
          <span className="pair-name">{w.groom.fullName}</span>
        </div>
      </div>
      <Divider />
      <p className="invite-lead" data-reveal="up">Trân trọng kính mời</p>
      <p className="guest-name" data-reveal="up">{guest}</p>
      <p className="invite-text" data-reveal="up">{w.invitation}</p>
    </section>
  );
}

/* ===================== 3. CHÚ RỂ & CÔ DÂU (3D FLIP CARD) ===================== */
export function Couple({ w, v }: P) {
  const [flippedRole, setFlippedRole] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const people = [
    {
      p: w.bride,
      role: 'Cô dâu',
      src: v.photos.bride,
      alt: 'Chân dung cô dâu',
      cls: 'portrait',
      rotateInitial: -40,
      xInitial: -50,
      delay: 0,
      defaultBio: 'Cô gái dịu dàng, nụ cười rạng rỡ và tràn đầy yêu thương.',
    },
    {
      p: w.groom,
      role: 'Chú rể',
      src: v.photos.groom,
      alt: 'Chân dung chú rể',
      cls: 'portrait portrait--low',
      rotateInitial: 40,
      xInitial: 50,
      delay: 0.16,
      defaultBio: 'Chàng trai điềm tĩnh, ấm áp và luôn chu đáo.',
    },
  ];

  const handleToggleFlip = (role: string) => {
    setFlippedRole((prev) => (prev === role ? null : role));
  };

  return (
    <section className="sec couple" aria-labelledby="t-couple">
      <SectionHead id="t-couple" title="Chú rể & Cô dâu" />
      <div className="couple-grid">
        {people.map(({ p, role, src, alt, cls, rotateInitial, xInitial, delay: d, defaultBio }) => {
          const isFlipped = flippedRole === role;
          return (
            <motion.figure
              key={role}
              className={cls}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: xInitial, rotateY: rotateInitial }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: d }}
            >
              <div
                className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => handleToggleFlip(role)}
                role="button"
                tabIndex={0}
                aria-label={`Thẻ 3D ${role} ${p.name}, chạm hoặc di chuột để lật`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleFlip(role);
                  }
                }}
              >
                <div className="flip-card-inner">
                  {/* Mặt trước: Ảnh vòm */}
                  <div className="flip-card-front">
                    <div className="portrait-arch">
                      <div>
                        <Image src={src} alt={alt} fill sizes="(max-width: 480px) 45vw, 220px" />
                      </div>
                    </div>
                  </div>

                  {/* Mặt sau: Tên + Dòng giới thiệu ngắn */}
                  <div className="flip-card-back" aria-hidden={!isFlipped}>
                    <div className="flip-card-back-content">
                      <span className="flip-card-hy">囍</span>
                      <span className="flip-card-role">{role}</span>
                      <h3 className="flip-card-name">{p.name}</h3>
                      <p className="flip-card-bio">{p.bio || defaultBio}</p>
                      <span className="flip-card-tip">Chạm để lật ảnh</span>
                    </div>
                  </div>
                </div>
              </div>

              <figcaption>
                <span className="portrait-role">{role}</span>
                <span className="portrait-name">{p.name}</span>
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
    </section>
  );
}

/* ===================== 4. THỜI GIAN & ĐỊA ĐIỂM ===================== */
export function Events({ v }: { v: View }) {
  return (
    <section className="sec events" id="sukien" aria-labelledby="t-events">
      <SectionHead id="t-events" title="Sự kiện cưới" sub="Thời gian và địa điểm" />
      <div className="event-list">
        {v.events.map((ev, i) => (
          <article key={`${ev.title}-${i}`} className="event" data-reveal="up" style={delay(i * 0.12)}>
            <Corners />
            <h3 className="event-title">{ev.title}</h3>
            <p className="event-time">{ev.time}</p>
            <p className="event-date">{ev.dateLong}</p>
            <p className="event-lunar">({ev.lunarText})</p>
            <div className="event-rule" />
            <p className="event-place">{ev.place}</p>
            {ev.hall ? <p className="event-hall">{ev.hall}</p> : null}
            {ev.address ? <p className="event-addr">{ev.address}</p> : null}
            <a className="btn" href={ev.mapHref} target="_blank" rel="noopener noreferrer">Chỉ đường</a>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ===================== 5. LỊCH & ĐẾM NGƯỢC ===================== */
const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function CalendarSection({ v }: { v: View }) {
  return (
    <section className="sec calendar" aria-labelledby="t-cal">
      <SectionHead id="t-cal" title="Lịch ngày cưới" />
      <div className="cal" data-reveal="zoom">
        <p className="cal-head" id="calHead">{v.monthTitle}</p>
        <div className="cal-grid" aria-labelledby="calHead">
          {DOW.map((d) => <span key={d} className="cal-dow">{d}</span>)}
          {v.calendar.map((c, i) => (
            <span
              key={i}
              className={['cal-day', c.sunday && 'sun', c.wedding && 'is-wedding'].filter(Boolean).join(' ')}
              aria-label={c.wedding ? `Ngày cưới ${c.day}` : undefined}
            >
              {c.day ? <span>{c.day}</span> : null}
            </span>
          ))}
        </div>
      </div>
      <Countdown target={v.targetISO} />
    </section>
  );
}

/* ===================== 6. BẢN ĐỒ ===================== */
export function MapSection({ v }: { v: View }) {
  return (
    <section className="sec mapsec" aria-labelledby="t-map">
      <SectionHead id="t-map" title="Bản đồ đường đi" sub={v.mainPlace} />
      <div className="map" data-reveal="up">
        <iframe src={v.mapEmbed} title="Bản đồ địa điểm tiệc cưới" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <div className="map-actions" data-reveal="up">
        <a className="btn" href={v.mapHref} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 18s6-5.2 6-10A6 6 0 0 0 4 8c0 4.8 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="10" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          Mở Google Maps
        </a>
      </div>
    </section>
  );
}

/* ===================== 7. LỜI CẢM ƠN (PARALLAX + ZOOM) ===================== */
export function Thanks({ w, v }: P) {
  const thanksRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const { scrollYProgress } = useScroll({
    target: thanksRef,
    offset: ['start end', 'end start'],
  });

  // Parallax dọc + Zoom nhẹ (scale 1.05 -> 1) khi cuộn vào view
  const yThanks = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const scaleThanks = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);

  return (
    <>
      <section className="thanks" aria-labelledby="t-thanks" ref={thanksRef}>
        <div className="thanks-photo">
          <motion.div
            style={{
              position: 'absolute',
              inset: '-10% 0',
              y: reduced ? 0 : yThanks,
              scale: reduced ? 1 : scaleThanks,
              willChange: 'transform',
            }}
          >
            <Image
              src={v.photos.thanks}
              alt="Chú rể và cô dâu"
              fill
              className="img-cover"
              sizes="(max-width: 480px) 100vw, 480px"
            />
          </motion.div>
        </div>
        <h2 className="thanks-title" id="t-thanks" data-reveal="up">Cảm ơn</h2>
        <p className="thanks-text" data-reveal="up">{w.thanks}</p>
        <div className="hy" data-reveal="zoom" aria-hidden="true" style={{ margin: '22px auto 0' }}>囍</div>
      </section>
      <footer className="foot">{v.dateShort}</footer>
    </>
  );
}
