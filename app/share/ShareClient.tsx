'use client';
import { useState, useEffect } from 'react';

export default function ShareClient() {
  const [guest, setGuest] = useState('');
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const shareUrl = guest ? `${url}/?khach=${encodeURIComponent(guest.trim())}` : url;
  const ogUrl = guest ? `${url}/api/og?guest=${encodeURIComponent(guest.trim())}` : `${url}/api/og`;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareZalo = () => {
    window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Thân mời ${guest} tới dự Lễ Cưới`,
        url: shareUrl,
      });
    }
  };

  if (!url) return null; // Avoid hydration mismatch

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Công cụ tạo link cho Dâu Rể</h1>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Tên khách mời:</label>
        <input 
          type="text" 
          value={guest}
          onChange={(e) => setGuest(e.target.value)}
          placeholder="Nhập tên khách... (VD: Anh Đức)"
          style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: 30 }}>
        <p style={{ marginBottom: 8, fontWeight: 'bold' }}>Link chia sẻ:</p>
        <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, wordBreak: 'break-all', marginBottom: 12, color: '#333' }}>
          {shareUrl}
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={copy} style={{ padding: '10px 16px', backgroundColor: copied ? '#4CAF50' : '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
            {copied ? 'Đã copy!' : 'Copy link'}
          </button>
          <button onClick={shareZalo} style={{ padding: '10px 16px', backgroundColor: '#0068FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
            Gửi Zalo
          </button>
          <button onClick={nativeShare} style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
            Chia sẻ...
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
        <h3 style={{ marginBottom: 10 }}>Xem trước Zalo Preview</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>Lưu ý: Ảnh này sinh trực tiếp theo tên bạn gõ.</p>
        <div style={{ width: '100%', aspectRatio: '1200/630', backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', border: '1px solid #ddd' }}>
          <img src={ogUrl} alt="Zalo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  );
}
