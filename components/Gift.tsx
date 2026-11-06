'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GiftView } from '@/lib/view';
import { SectionHead } from './Ornaments';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function Gift({ accounts }: { accounts: GiftView[] }) {
  const [activeAcc, setActiveAcc] = useState<GiftView | null>(null);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Khóa scroll khi mở modal & đóng bằng phím ESC
  useEffect(() => {
    if (!activeAcc) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveAcc(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeAcc]);

  const copy = useCallback(async (no: string) => {
    await copyText(no.replace(/\s/g, ''));
    setToast('Đã sao chép số tài khoản');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  if (!accounts.length) return null;

  return (
    <section className="sec gift" id="mungcuoi" aria-labelledby="t-gift">
      <SectionHead
        id="t-gift"
        title="Hộp mừng cưới"
        sub="Gửi những lời chúc tốt đẹp cùng món quà ý nghĩa tới cô dâu & chú rể"
      />

      {/* Danh sách các hộp quà */}
      <div className="gift-boxes-container">
        {accounts.map((acc, i) => (
          <div key={i} className="gift-trigger-box" data-reveal="up">
            <button
              type="button"
              className="gift-box-btn"
              onClick={() => setActiveAcc(acc)}
              aria-haspopup="dialog"
              aria-label={`Mở hộp quà mừng cưới - ${acc.owner} (${acc.bank})`}
            >
              {/* Hiệu ứng hào quang lấp lánh */}
              <div className="gift-glow" aria-hidden="true" />

              {/* Icon hộp quà 3D tinh xảo vẽ bằng SVG */}
              <div className="gift-box-icon-wrap" aria-hidden="true">
                <svg className="gift-box-svg" viewBox="0 0 84 84" fill="none">
                  {/* Bóng đổ dưới đáy hộp */}
                  <ellipse cx="42" cy="74" rx="30" ry="6" fill="#000" fillOpacity="0.22" />

                  {/* Thân hộp quà */}
                  <rect x="14" y="36" width="56" height="34" rx="7" fill="url(#gift-body-grad)" stroke="#C9A45C" strokeWidth="1.5" />

                  {/* Nắp hộp quà */}
                  <rect x="10" y="27" width="64" height="12" rx="4" fill="url(#gift-lid-grad)" stroke="#C9A45C" strokeWidth="1.5" />

                  {/* Dải ruy băng dọc thân */}
                  <rect x="37" y="36" width="10" height="34" fill="url(#ribbon-grad)" />
                  <line x1="37" y1="36" x2="37" y2="70" stroke="#FFE9A8" strokeWidth="0.8" strokeOpacity="0.8" />
                  <line x1="47" y1="36" x2="47" y2="70" stroke="#FFE9A8" strokeWidth="0.8" strokeOpacity="0.8" />

                  {/* Dải ruy băng dọc nắp */}
                  <rect x="37" y="27" width="10" height="12" fill="url(#ribbon-grad)" />

                  {/* Chiếc nơ vàng kim hoàng gia */}
                  {/* Cánh nơ trái */}
                  <path
                    d="M42 27 C34 16 19 19 25 27 C31 33 39 28 42 27 Z"
                    fill="url(#ribbon-grad)"
                    stroke="#C9A45C"
                    strokeWidth="1.2"
                  />
                  {/* Cánh nơ phải */}
                  <path
                    d="M42 27 C50 16 65 19 59 27 C53 33 45 28 42 27 Z"
                    fill="url(#ribbon-grad)"
                    stroke="#C9A45C"
                    strokeWidth="1.2"
                  />
                  {/* Dây nơ rủ xuống */}
                  <path d="M38 27 C32 32 30 38 31 43" stroke="#C9A45C" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M46 27 C52 32 54 38 53 43" stroke="#C9A45C" strokeWidth="2.4" strokeLinecap="round" />

                  {/* Nút thắt tâm nơ */}
                  <ellipse cx="42" cy="27" rx="5" ry="4" fill="#FFE399" stroke="#9A752B" strokeWidth="1.2" />

                  {/* Chi tiết hoa văn chữ Hỷ nhỏ trên thân hộp */}
                  <circle cx="42" cy="53" r="3.5" fill="#FFE7A3" fillOpacity="0.9" />

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="gift-body-grad" x1="14" y1="36" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#A82830" />
                      <stop offset="0.5" stopColor="#8C1C22" />
                      <stop offset="1" stopColor="#5E0F15" />
                    </linearGradient>
                    <linearGradient id="gift-lid-grad" x1="10" y1="27" x2="74" y2="39" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#BF363D" />
                      <stop offset="0.5" stopColor="#9C2027" />
                      <stop offset="1" stopColor="#6E131A" />
                    </linearGradient>
                    <linearGradient id="ribbon-grad" x1="37" y1="16" x2="47" y2="70" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFE7A3" />
                      <stop offset="0.35" stopColor="#D8A94C" />
                      <stop offset="0.75" stopColor="#B3862A" />
                      <stop offset="1" stopColor="#D4A446" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Thông tin nhãn hộp quà */}
              <div className="gift-box-info">
                <h3 className="gift-box-title">Gửi quà chúc phúc</h3>
                <div className="gift-open-cta">
                  <span>Mở hộp quà</span>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* POPUP MODAL MÃ QR & TÀI KHOẢN */}
      {activeAcc && (
        <div
          className="gift-modal-backdrop"
          onClick={() => setActiveAcc(null)}
          role="presentation"
        >
          <div
            className="gift-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              className="gift-modal-close"
              onClick={() => setActiveAcc(null)}
              aria-label="Đóng hộp quà"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* Header Modal */}
            <div className="gift-modal-head">
              <span className="gift-modal-tag">Thông tin chuyển khoản</span>
              <h3 id="gift-modal-title" className="gift-modal-title">
                Mừng cưới cô dâu & chú rể
              </h3>
              <p className="gift-modal-desc">Quét mã QR bằng ứng dụng ngân hàng bất kỳ để gửi quà mừng</p>
            </div>

            {/* Khung Mã QR */}
            <div className="gift-modal-qr-wrap">
              <div className="gift-modal-qr-frame">
                <Image
                  className="gift-modal-qr-img"
                  src={activeAcc.qrSrc}
                  alt={activeAcc.hasQr ? `Mã QR chuyển khoản ${activeAcc.bank} ${activeAcc.accountNo}` : 'Chưa có mã QR'}
                  width={220}
                  height={220}
                  unoptimized
                  priority
                />
              </div>
              <p className="gift-modal-qr-hint">Chụp màn hình hoặc quét trực tiếp</p>
            </div>

            {/* Chi tiết tài khoản */}
            <div className="gift-modal-details">
              <div className="gift-detail-row">
                <span className="gift-detail-label">Ngân hàng</span>
                <span className="gift-detail-value font-serif">{activeAcc.bank}</span>
              </div>

              <div className="gift-detail-row">
                <span className="gift-detail-label">Chủ tài khoản</span>
                <span className="gift-detail-value is-bold">{activeAcc.accountName || activeAcc.owner}</span>
              </div>

              <div className="gift-detail-row is-acc">
                <span className="gift-detail-label">Số tài khoản</span>
                <span className="gift-detail-value is-number">{activeAcc.accountNo}</span>
              </div>
            </div>

            {/* Nút sao chép */}
            {activeAcc.accountNo && (
              <button
                className="gift-copy-btn"
                type="button"
                onClick={() => copy(activeAcc.accountNo)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                  <path d="M4 13V4a1 1 0 0 1 1-1h9" strokeLinecap="round" />
                </svg>
                <span>Sao chép số tài khoản</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast thông báo sao chép */}
      <div className={toast ? 'toast is-show' : 'toast'} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}
