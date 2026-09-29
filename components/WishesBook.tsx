'use client';

import { useState, useId } from 'react';
import useSWR from 'swr';
import type { WishItem, WishSide } from '@/lib/wishes-repo';
import { WishSpotlight } from './WishSpotlight';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function WishesBook() {
  const formId = useId();
  const [sending, setSending] = useState(false);
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Lấy danh sách 100 lời chúc mới nhất cho trình chiếu
  const { data, mutate, isLoading } = useSWR<{ items: WishItem[]; total: number }>('/api/wishes?limit=100', fetcher, {
    revalidateOnFocus: false,
  });

  const wishes = data?.items || [];
  const total = data?.total || 0;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const handleDirectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get('name') ?? '').trim();
    const message = String(fd.get('message') ?? '').trim();
    const side = String(fd.get('side') ?? 'bride');
    const website = String(fd.get('website') ?? '');

    if (!name || name.length < 2) {
      showToast('Vui lòng nhập tên của bạn (tối thiểu 2 ký tự).', 'error');
      return;
    }
    if (!message || message.length < 5) {
      showToast('Vui lòng nhập lời chúc (tối thiểu 5 ký tự).', 'error');
      return;
    }

    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticWish: WishItem = {
      id: tempId,
      name,
      message,
      side: (side as WishSide) || 'bride',
      createdAt: new Date().toISOString(),
      approved: true,
    };

    // Optimistic update
    mutate(
      (currentData) => {
        const currentItems = currentData?.items || [];
        return {
          items: [optimisticWish, ...currentItems],
          total: (currentData?.total || 0) + 1,
        };
      },
      false
    );

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, side, website }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Chưa gửi được lời chúc.');
      }

      // Revalidate to get real data
      await mutate();
      form.reset();
      setShowDirectForm(false);
      showToast('Cảm ơn bạn đã gửi lời chúc ý nghĩa tới cô dâu & chú rể!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi.';
      showToast(msg, 'error');
      // Revert optimistic update by revalidating
      mutate();
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="sec wishes-section" id="so-luu-but" aria-labelledby="t-wishes">
      <div className="wishes-inner">
        <header className="wishes-header">
          <p className="wishes-subtitle">Sổ Lưu Bút</p>
          <h2 className="wishes-title" id="t-wishes">
            Lời Chúc Yêu Thương
            {total > 0 && <span className="wishes-count">({total})</span>}
          </h2>
          <div className="wishes-dec-line" aria-hidden="true">
            <span className="wishes-dec-star">❦</span>
          </div>
        </header>

        <div className="wishes-cta-wrap">
          <button
            type="button"
            className="wishes-btn-open-form"
            onClick={() => setShowDirectForm((prev) => !prev)}
            aria-expanded={showDirectForm}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {showDirectForm ? 'Đóng khung viết lời chúc' : 'Gửi lời chúc cho đôi uyên ương'}
          </button>
        </div>

        {showDirectForm && (
          <form className="wishes-direct-form" onSubmit={handleDirectSubmit} noValidate>
            <h3 className="wishes-form-heading">Gửi lời chúc mừng hạnh phúc</h3>

            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor={`${formId}-website`}>Website</label>
              <input id={`${formId}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="wishes-form-row">
              <div className="wishes-form-group">
                <label htmlFor={`${formId}-name`} className="wishes-label">Tên của bạn *</label>
                <input
                  id={`${formId}-name`}
                  name="name"
                  type="text"
                  required
                  maxLength={40}
                  className="wishes-input"
                  placeholder="Ví dụ: Bạn Tuấn Anh, Chị Linh..."
                />
              </div>

              <div className="wishes-form-group">
                <label htmlFor={`${formId}-side`} className="wishes-label">Bạn là khách của</label>
                <select id={`${formId}-side`} name="side" className="wishes-select" defaultValue="bride">
                  <option value="bride">Nhà gái</option>
                  <option value="groom">Nhà trai</option>
                  <option value="both">Bạn chung cả hai</option>
                </select>
              </div>
            </div>

            <div className="wishes-form-group">
              <label htmlFor={`${formId}-message`} className="wishes-label">Lời chúc của bạn *</label>
              <textarea
                id={`${formId}-message`}
                name="message"
                required
                rows={3}
                maxLength={300}
                className="wishes-textarea"
                placeholder="Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương nhau..."
              />
              <span className="wishes-hint">Tối đa 300 ký tự (không kèm link web).</span>
            </div>

            <button type="submit" className="wishes-submit-btn" disabled={sending}>
              {sending ? (
                <span className="wishes-spinner-wrap">
                  <span className="wishes-spinner" /> Đang gửi lời chúc...
                </span>
              ) : (
                'Gửi lời chúc ngay ♥'
              )}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="wishes-grid" aria-busy="true" aria-label="Đang tải lời chúc...">
            <div className="wish-card wish-skeleton">
              <div className="wish-card-header">
                <div className="wish-skel-avatar" />
                <div className="wish-skel-meta">
                  <div className="wish-skel-line wish-skel-name" />
                  <div className="wish-skel-line wish-skel-time" />
                </div>
              </div>
              <div className="wish-skel-line wish-skel-msg-1" />
              <div className="wish-skel-line wish-skel-msg-2" />
            </div>
          </div>
        ) : (
          <WishSpotlight wishes={wishes} />
        )}
      </div>

      {toast && (
        <div className={`wishes-toast wishes-toast-${toast.type}`} role="status" aria-live="polite">
          <span className="wishes-toast-icon">{toast.type === 'success' ? '✓' : '!'}</span>
          <span className="wishes-toast-text">{toast.msg}</span>
        </div>
      )}
    </section>
  );
}
