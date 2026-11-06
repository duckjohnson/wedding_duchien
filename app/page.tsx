import type { Metadata } from 'next';
import { wedding } from '@/config/wedding';
import { buildView } from '@/lib/view';
import { Cover } from '@/components/Cover';
import { MusicButton, Petals } from '@/components/Effects';
import { Gallery } from '@/components/Gallery';
import { Gift } from '@/components/Gift';
import { InviteProvider } from '@/components/InviteProvider';
import { SvgSprite } from '@/components/Ornaments';
import { Rsvp } from '@/components/Rsvp';
import { WishesBook } from '@/components/WishesBook';
import { FloatingWishesWrapper } from '@/components/FloatingWishesWrapper';
import { CalendarSection, Couple, Events, Hero, Letter, MapSection, Thanks } from '@/components/Sections';
import { AutoScrollButton } from '@/components/AutoScrollButton';

// Phiên bản OG – tăng lên (3, 4, ...) mỗi khi đổi ảnh để Zalo/Facebook bỏ cache ảnh cũ
const OG_VERSION = '4';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Nhà trai: "Hữu Đức & Vũ Hiền" – Nhà gái: "Vũ Hiền & Hữu Đức"
const [firstName, secondName] =
  wedding.side === 'bride'
    ? [wedding.bride.name, wedding.groom.name]
    : [wedding.groom.name, wedding.bride.name];
const COUPLE = `${firstName} & ${secondName}`;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Tên khách lấy từ link: /?khach=Anh%20Nam hoặc /?name=... hoặc /?guest=...
function guestFrom(sp: Record<string, string | string[] | undefined>) {
  const raw = sp.khach ?? sp.name ?? sp.guest ?? sp.to;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 60) ?? '';
  return { guest: value || wedding.defaultGuest, fromLink: Boolean(value), rawGuest: value };
}

// Lọc tham số theo dõi (utm_*, fbclid, zarsrc) khỏi URL canonical
function cleanUrl(baseUrl: string, guestName: string): string {
  const url = new URL(baseUrl);
  if (guestName) url.searchParams.set('khach', guestName);
  return url.toString();
}

// Ảnh xem trước: lấy từ config (meta.ogImage), ví dụ '/photos/og.jpg' (nên 1200×630)
function ogImageUrl(): string | null {
  const path = wedding.meta.ogImage;
  if (!path) return null;
  const abs = new URL(path, SITE_URL);
  abs.searchParams.set('v', OG_VERSION);
  return abs.toString();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const { rawGuest } = guestFrom(sp);

  const title = rawGuest
    ? `Thân mời ${rawGuest} đến dự lễ cưới ${COUPLE}`
    : `Thiệp cưới ${COUPLE}`;

  const description = wedding.meta.description;
  const image = ogImageUrl();
  const canonicalUrl = cleanUrl(`${SITE_URL}/`, rawGuest);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      siteName: `Thiệp cưới ${COUPLE}`,
      url: canonicalUrl,
      title,
      description,
      images: image
        ? [
            {
              url: image,
              secureUrl: image,
              alt: rawGuest
                ? `Thiệp mời ${rawGuest} đến dự lễ cưới ${COUPLE}`
                : `Thiệp cưới ${COUPLE}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function Page({ searchParams }: Props) {
  const { guest, fromLink } = guestFrom(await searchParams);
  const v = buildView(wedding);

  return (
    <InviteProvider coverEnabled={wedding.cover.enabled} music={wedding.music}>
      <SvgSprite />
      {wedding.cover.enabled ? (
        <Cover groomName={wedding.groom.name} brideName={wedding.bride.name} dateShort={v.dateShort} guest={guest} />
      ) : null}

      <main className="page" id="page">
        <Hero w={wedding} v={v} />
        <Letter w={wedding} guest={guest} />
        <Couple w={wedding} v={v} />
        <Events v={v} />
        <CalendarSection v={v} />
        <Gallery items={v.gallery} />
        <MapSection v={v} />
        {wedding.rsvp.enabled ? (
          <Rsvp guest={guest} guestFromLink={fromLink} deadline={wedding.rsvp.deadline} />
        ) : null}
        <WishesBook />
        {wedding.gift.enabled ? <Gift accounts={v.gifts} /> : null}
        <Thanks w={wedding} v={v} />
      </main>

      <div className="floating-controls">
        <AutoScrollButton />
        <MusicButton />
      </div>
      <FloatingWishesWrapper />
      <Petals />
    </InviteProvider>
  );
}
