'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (no: string) => {
    await copyText(no.replace(/\s/g, ''));
    setToast('Đã sao chép số tài khoản');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  };

  if (!accounts.length) return null;

  return (
    <section className="sec gift" id="mungcuoi" aria-labelledby="t-gift">
      <SectionHead id="t-gift" title="Hộp mừng cưới" sub="Quét mã hoặc sao chép số tài khoản nếu bạn muốn gửi quà từ xa" />
      <div className="gift-grid">
        {accounts.map((acc, i) => (
          <div key={i} className="gift-card" data-reveal={i % 2 ? 'right' : 'left'}>
            {/* Ảnh QR giữ nguyên bản gốc để quét chính xác */}
            <Image
              className="qr"
              src={acc.qrSrc}
              alt={acc.hasQr ? `Mã QR chuyển khoản ${acc.bank} ${acc.accountNo}` : 'Chưa có mã QR'}
              width={118}
              height={118}
              unoptimized
            />
            <div>
              <p className="gift-who">{acc.owner}</p>
              <p className="gift-bank">{acc.bank}</p>
              <p className={acc.accountNo ? 'gift-acc' : 'gift-acc is-empty'}>{acc.accountNo || 'Chưa điền số tài khoản'}</p>
              {acc.accountName ? <p className="gift-holder">{acc.accountName}</p> : null}
              {acc.accountNo ? (
                <button className="btn" type="button" onClick={() => copy(acc.accountNo)}>Sao chép số tài khoản</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className={toast ? 'toast is-show' : 'toast'} role="status" aria-live="polite">{toast}</div>
    </section>
  );
}
