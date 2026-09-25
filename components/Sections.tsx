import Image from 'next/image';
import type { WeddingConfig } from '@/config/wedding';
import type { View } from '@/lib/view';
import { Countdown } from './Countdown';
import { Corners, delay, Divider, SectionHead } from './Ornaments';

type P = { w: WeddingConfig; v: View };

/* ===================== ẢNH CÔ DÂU CHÚ RỂ ===================== */
export function Hero({ w, v }: P) {
  return (
    <section className="hero" id="top">
      <p className="hero-kicker" data-reveal="up">Lễ thành hôn</p>
      <div className="hero-frame" data-reveal="arch" style={delay(0.1)}>
        <div className="hero-photo">
          <div className="parallax-layer" data-parallax="0.1">
            <Image src={v.photos.hero} alt="Ảnh cưới của cô dâu và chú rể" fill preload className="img-cover" sizes="(max-width: 480px) 90vw, 330px" />
          </div>
        </div>
      </div>
      <h1 className="hero-names" id="heroTitle" tabIndex={-1}>
        <span className="hn" data-reveal="up" style={delay(0.6)}>{w.groom.name}</span>
        <span className="hn-amp" data-reveal="zoom" style={delay(0.8)}>&amp;</span>
        <span className="hn" data-reveal="up" style={delay(0.95)}>{w.bride.name}</span>
      </h1>
      <div className="datelock" data-reveal="up" style={delay(1.15)}>
        <span className="dl-side">{v.weekday}</span>
        <span className="dl-day">{v.day}</span>
        <span className="dl-side">{v.monthLabel}<br />{v.year}</span>
      </div>
      <p className="hero-lunar" data-reveal="up" style={delay(1.3)}>{v.mainLunar}</p>
      <a className="scroll-cue" href="#loimoi" aria-label="Xem lời mời">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 7 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </a>
    </section>
  );
}

/* ===================== LỜI MỜI ===================== */
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
        {fam('Nhà trai', w.families.groom, 'left', 0)}
        {fam('Nhà gái', w.families.bride, 'right', 0.1)}
      </div>
      <div className="hy" data-reveal="zoom" aria-hidden="true">囍</div>
      <p className="announce" data-reveal="up">Trân trọng báo tin lễ thành hôn của con chúng tôi</p>
      <div className="pair">
        <div data-reveal="up">
          <span className="pair-role">{w.groom.role}</span>
          <span className="pair-name">{w.groom.fullName}</span>
        </div>
        <span className="pair-amp" data-reveal="zoom" aria-hidden="true">&amp;</span>
        <div data-reveal="up" style={delay(0.1)}>
          <span className="pair-role">{w.bride.role}</span>
          <span className="pair-name">{w.bride.fullName}</span>
        </div>
      </div>
      <Divider />
      <p className="invite-lead" data-reveal="up">Trân trọng kính mời</p>
      <p className="guest-name" data-reveal="up">{guest}</p>
      <p className="invite-text" data-reveal="up">{w.invitation}</p>
    </section>
  );
}

/* ===================== CHÚ RỂ & CÔ DÂU ===================== */
export function Couple({ w, v }: P) {
  const people = [
    { p: w.groom, role: 'Chú rể', src: v.photos.groom, alt: 'Chân dung chú rể', cls: 'portrait', dir: 'left', d: 0 },
    { p: w.bride, role: 'Cô dâu', src: v.photos.bride, alt: 'Chân dung cô dâu', cls: 'portrait portrait--low', dir: 'right', d: 0.15 },
  ] as const;
  return (
    <section className="sec couple" aria-labelledby="t-couple">
      <SectionHead id="t-couple" title="Chú rể & Cô dâu" />
      <div className="couple-grid">
        {people.map(({ p, role, src, alt, cls, dir, d }) => (
          <figure key={role} className={cls} data-reveal={dir} style={delay(d)}>
            <div className="portrait-arch">
              <div>
                <Image src={src} alt={alt} fill sizes="(max-width: 480px) 45vw, 220px" />
              </div>
            </div>
            <figcaption>
              <span className="portrait-role">{role}</span>
              <span className="portrait-name">{p.name}</span>
              {p.bio ? <span className="portrait-bio">{p.bio}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ===================== THỜI GIAN & ĐỊA ĐIỂM ===================== */
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

/* ===================== LỊCH & ĐẾM NGƯỢC ===================== */
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

/* ===================== BẢN ĐỒ ===================== */
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

/* ===================== LỜI CẢM ƠN ===================== */
export function Thanks({ w, v }: P) {
  return (
    <>
      <section className="thanks" aria-labelledby="t-thanks">
        <div className="thanks-photo">
          <div className="parallax-layer" data-parallax="0.08">
            <Image src={v.photos.thanks} alt="Cô dâu và chú rể" fill className="img-cover" sizes="(max-width: 480px) 100vw, 480px" />
          </div>
        </div>
        <h2 className="thanks-title" id="t-thanks" data-reveal="up">Cảm ơn</h2>
        <p className="thanks-text" data-reveal="up">{w.thanks}</p>
        <p className="thanks-sign" data-reveal="up">{w.groom.name} &amp; {w.bride.name}</p>
      </section>
      <footer className="foot">{v.dateShort}</footer>
    </>
  );
}
