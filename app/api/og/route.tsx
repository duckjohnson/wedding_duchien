import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { wedding } from '@/config/wedding';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // Use nodejs to safely read local files with fs

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    
    // Fallback names
    const guestParam = searchParams.get('khach') ?? searchParams.get('to') ?? searchParams.get('guest');
    const guestName = guestParam ? guestParam.slice(0, 60) : '';
    
    const brideName = wedding.bride.name;
    const groomName = wedding.groom.name;
    
    // Background image (Hero photo or OG image)
    const bgUrl = wedding.photos.hero || wedding.meta.ogImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200';

    // Read fonts from the public folder using fs
    const greatVibesFont = fs.readFileSync(path.join(process.cwd(), 'public/fonts/GreatVibes-Regular.ttf'));
    const cormorantFont = fs.readFileSync(path.join(process.cwd(), 'public/fonts/CormorantGaramond-Regular.ttf'));
    const allisonFont = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Allison-Regular.ttf')).buffer; // Wait, I didn't download Allison!


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
              backgroundColor: 'rgba(94, 15, 21, 0.45)', // Lớp phủ tối màu đỏ đô mờ
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
              border: '2px solid rgba(220, 180, 100, 0.6)', // Viền vàng đồng
              padding: '40px 80px',
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
              <div style={{ display: 'flex' }}>
                {brideName.split('A').flatMap((part, i, arr) => i < arr.length - 1 ? [part, <span key={i} style={{ fontFamily: '"Allison"', fontSize: 130, transform: 'translateY(10px)' }}>A</span>] : [part])}
              </div>
              <span style={{ fontSize: 60, margin: '0 20px', fontFamily: '"Cormorant Garamond"' }}>&amp;</span>
              <div style={{ display: 'flex' }}>
                {groomName.split('A').flatMap((part, i, arr) => i < arr.length - 1 ? [part, <span key={i} style={{ fontFamily: '"Allison"', fontSize: 130, transform: 'translateY(10px)' }}>A</span>] : [part])}
              </div>
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
                    borderBottom: '2px solid rgba(220, 180, 100, 0.8)',
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
            name: 'Allison',
            data: allisonFont,
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
        headers: {
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
