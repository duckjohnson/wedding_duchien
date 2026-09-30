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

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

import type { Metadata, ResolvingMetadata } from 'next';

// Tên khách lấy từ link: /?khach=Anh%20Nam
function guestFrom(sp: Record<string, string | string[] | undefined>) {
  const raw = sp.khach ?? sp.to;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 60) ?? '';
  return { guest: value || wedding.defaultGuest, fromLink: Boolean(value), rawGuest: value };
}

export async function generateMetadata({ searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const sp = await searchParams;
  const { guest, rawGuest } = guestFrom(sp);
  
  const ogUrl = new URL('/api/og', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  if (rawGuest) ogUrl.searchParams.set('guest', rawGuest);
  ogUrl.searchParams.set('v', '1');

  const title = rawGuest 
    ? `Thân mời ${rawGuest} tới dự Lễ Cưới Linh Anh & Thái Hùng` 
    : `Thiệp cưới Linh Anh & Thái Hùng`;

  return {
    title,
    openGraph: {
      title,
      description: wedding.meta.description,
      type: 'website',
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
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
