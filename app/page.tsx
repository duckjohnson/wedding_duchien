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

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Tên khách lấy từ link: /?khach=Anh%20Nam
function guestFrom(sp: Record<string, string | string[] | undefined>) {
  const raw = sp.khach ?? sp.to;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 60) ?? '';
  return { guest: value || wedding.defaultGuest, fromLink: Boolean(value) };
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

      <MusicButton />
      <FloatingWishesWrapper />
      <Petals />
    </InviteProvider>
  );
}
