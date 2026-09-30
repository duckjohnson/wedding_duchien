import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { wedding } from '@/config/wedding';
import fs from 'fs';
import path from 'path';

export const runtime = 'edge';

// We have to use fetch for Edge runtime instead of fs if the font is in public folder.
// Since Next.js 14 edge runtime cannot use fs.readFileSync easily, we can use URL for fetch.
// We'll read the font from the request URL origin.
export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = req.nextUrl;
    
    // Fallback names
    const guestParam = searchParams.get('khach') ?? searchParams.get('to') ?? searchParams.get('guest');
    const guestName = guestParam ? guestParam.slice(0, 60) : '';
    
    const brideName = wedding.bride.name;
    const groomName = wedding.groom.name;
    
    // Background image (Hero photo or OG image)
    const bgUrl = wedding.photos.hero || wedding.meta.ogImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200';

    // Fetch fonts from the public folder
    const [greatVibesFont, cormorantFont] = await Promise.all([
      fetch(new URL('/fonts/GreatVibes-Regular.ttf', origin)).then((res) => res.arrayBuffer()),
      fetch(new URL('/fonts/CormorantGaramond-Regular.ttf', origin)).then((res) => res.arrayBuffer()),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: '"Cormorant Garamond"',
            position: 'relative',
          }}
        >
          {/* Dark Overlay to make text readable */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)', // Lớp phủ màu đen mờ
            }}
          />

          {/* Nội dung chữ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              textAlign: 'center',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              padding: '40px 80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span
              style={{
                fontSize: 40,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                marginBottom: 20,
              }}
            >
              Thiệp mời cưới
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: '"Great Vibes"',
                fontSize: 100,
                color: '#fff',
                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                lineHeight: 1.2,
                marginTop: 10,
                marginBottom: 40,
              }}
            >
              {brideName} <span style={{ fontSize: 60, margin: '0 20px', fontFamily: '"Cormorant Garamond"' }}>&amp;</span> {groomName}
            </div>

            {guestName ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    color: 'rgba(255,255,255,0.8)',
                    fontStyle: 'italic',
                    marginBottom: 10,
                  }}
                >
                  Trân trọng kính mời
                </span>
                <span
                  style={{
                    fontSize: 52,
                    color: '#fff',
                    fontWeight: 600,
                    borderBottom: '2px solid #fff',
                    paddingBottom: 10,
                  }}
                >
                  {guestName}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    color: '#fff',
                    fontStyle: 'italic',
                    fontWeight: 500,
                  }}
                >
                  Trân trọng kính mời bạn tới dự
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Great Vibes',
            data: greatVibesFont,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'Cormorant Garamond',
            data: cormorantFont,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'Cormorant Garamond',
            data: cormorantFont,
            style: 'normal',
            weight: 600,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
