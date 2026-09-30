import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { wedding } from '@/config/wedding';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestParam = searchParams.get('guest') ?? searchParams.get('khach') ?? searchParams.get('to') ?? searchParams.get('name');
    const name = guestParam?.slice(0, 60);
    
    // Cloudinary URL forced to JPG with quality good
    const bgUrl = wedding.photos.hero || wedding.meta.ogImage || 'https://res.cloudinary.com/txyieslq/image/upload/f_jpg,q_auto:good/w_1200,h_630,c_fill,g_faces/ZHUN4223.jpg';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay to ensure text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(94, 15, 21, 0.45)', // #5E0F15 mờ
            }}
          />
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(245, 230, 211, 0.5)', // --kim mờ
              borderRadius: '24px',
              padding: '60px',
              backgroundColor: 'rgba(60, 8, 12, 0.65)', // --son-dark
              color: '#F5E6D3', // --kim-light
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 42,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 20,
                color: '#D4AF37', // --kim
              }}
            >
              Trân trọng kính mời
            </div>
            
            {name ? (
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  marginBottom: 50,
                  textAlign: 'center',
                }}
              >
                {name}
              </div>
            ) : (
              <div style={{ height: 30 }} />
            )}
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 80,
                marginBottom: 10,
              }}
            >
              <span style={{ marginRight: 30 }}>{wedding.bride.name}</span>
              <span style={{ fontSize: 60, color: '#D4AF37' }}>&amp;</span>
              <span style={{ marginLeft: 30 }}>{wedding.groom.name}</span>
            </div>
            
            <div
              style={{
                fontSize: 32,
                marginTop: 20,
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              18 . 10 . 2026
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
