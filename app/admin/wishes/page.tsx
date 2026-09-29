'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type { WishItem } from '@/lib/wishes-repo';
import type { RsvpItem } from '@/lib/rsvp-repo';

type Tab = 'rsvp' | 'wishes';

export default function AdminDashboardPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('rsvp');

  // Wishes state
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);
  const [actionWishId, setActionWishId] = useState<string | null>(null);

  // RSVP state
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [actionRsvpId, setActionRsvpId] = useState<string | null>(null);

  // Kiểm tra đăng nhập
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      setAuthed(Boolean(data.authenticated));
      if (data.authenticated) {
        loadAllData();
      }
    } catch {
      setAuthed(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loadAllData = () => {
    loadRsvps();
    loadWishes();
  };

  const loadWishes = async () => {
    setLoadingWishes(true);
    try {
      const res = await fetch('/api/admin/wishes');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWishes(data.items || []);
    } catch {
      console.error('Không thể tải danh sách lời chúc.');
    } finally {
      setLoadingWishes(false);
    }
  };

  const loadRsvps = async () => {
    setLoadingRsvps(true);
    try {
      const res = await fetch('/api/admin/rsvp');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRsvps(data.items || []);
    } catch {
      console.error('Không thể tải danh sách xác nhận tham dự.');
    } finally {
      setLoadingRsvps(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Mật khẩu không chính xác.');
        return;
      }
      setAuthed(true);
      setPassword('');
      loadAllData();
    } catch {
      setAuthError('Có lỗi xảy ra khi đăng nhập.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthed(false);
    setWishes([]);
    setRsvps([]);
  };

  // Wishes actions
  const handleToggleHide = async (id: string, currentApproved: boolean) => {
    setActionWishId(id);
    try {
      const res = await fetch('/api/admin/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !currentApproved }),
      });
      if (!res.ok) throw new Error();
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, approved: !currentApproved } : w)),
      );
    } catch {
      alert('Không thể cập nhật trạng thái.');
    } finally {
      setActionWishId(null);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn lời chúc này?')) return;
    setActionWishId(id);
    try {
      const res = await fetch('/api/admin/wishes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert('Không thể xóa lời chúc.');
    } finally {
      setActionWishId(null);
    }
  };

  const handleExportWishesCSV = () => {
    if (wishes.length === 0) {
      alert('Chưa có lời chúc nào để xuất.');
      return;
    }
    const headers = ['ID', 'Thời gian', 'Người gửi', 'Khách của bên', 'Trạng thái', 'Nội dung'];
    const rows = wishes.map((w) => [
      `"${w.id}"`,
      `"${new Date(w.createdAt).toLocaleString('vi-VN')}"`,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      `"${w.side === 'groom' ? 'Nhà trai' : w.side === 'bride' ? 'Nhà gái' : w.side === 'both' ? 'Cả hai' : 'Chưa chọn'}"`,
      `"${w.approved ? 'Đang hiển thị' : 'Đã ẩn'}"`,
      `"${(w.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    downloadCSV(csvContent, `so_luu_but_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // RSVP actions
  const handleDeleteRsvp = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi xác nhận này?')) return;
    setActionRsvpId(id);
    try {
      const res = await fetch('/api/admin/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setRsvps((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Không thể xóa bản ghi.');
    } finally {
      setActionRsvpId(null);
    }
  };

  const handleExportRsvpCSV = () => {
    if (rsvps.length === 0) {
      alert('Chưa có phản hồi nào để xuất.');
      return;
    }
    const headers = ['Thời gian', 'Họ và tên', 'Số điện thoại', 'Tham dự', 'Số người đi cùng', 'Khách của bên', 'Lời chúc', 'Link khách'];
    const rows = rsvps.map((r) => [
      `"${new Date(r.submittedAt).toLocaleString('vi-VN')}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${r.attend}"`,
      `"${r.guests || '1'}"`,
      `"${(r.side || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${(r.linkGuest || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    downloadCSV(csvContent, `danh_sach_tham_du_cuoi_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tính thống kê RSVP
  const stats = {
    total: rsvps.length,
    yes: rsvps.filter((r) => r.attend === 'Có').length,
    no: rsvps.filter((r) => r.attend === 'Không').length,
    maybe: rsvps.filter((r) => r.attend === 'Chưa chắc').length,
    totalGuests: rsvps
      .filter((r) => r.attend === 'Có')
      .reduce((sum, r) => {
        const n = parseInt(r.guests, 10);
        return sum + (Number.isNaN(n) ? 1 : n);
      }, 0),
  };

  if (authed === null) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Màn hình đăng nhập
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF6F0',
        padding: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 12px 32px rgba(94, 15, 21, 0.1)',
          border: '1px solid rgba(201, 164, 92, 0.3)'
        }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#5E0F15', textAlign: 'center' }}>
            Quản Trị Thiệp Cưới
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#666', textAlign: 'center' }}>
            Nhập mật khẩu quản trị để xem danh sách khách và lời chúc
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="admin-pw" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                Mật khẩu (ADMIN_PASSWORD)
              </label>
              <input
                id="admin-pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  fontSize: 15,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {authError && (
              <p style={{ color: '#DC2626', fontSize: 13, margin: '0 0 16px' }}>{authError}</p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 8,
                border: 'none',
                background: '#5E0F15',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {loggingIn ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard chính
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF6F0',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1f2937'
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Header trên cùng */}
        <header style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: '#fff',
          padding: '18px 24px',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid rgba(201, 164, 92, 0.25)',
          marginBottom: 20
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#5E0F15' }}>
              Quản Trị Thiệp Cưới
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Dữ liệu được lưu trữ tự động trên Upstash Redis
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href="/"
              target="_blank"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                fontSize: 13,
                textDecoration: 'none',
                color: '#374151'
              }}
            >
              ↗ Xem web thiệp
            </a>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: '#fee2e2',
                color: '#991b1b',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          borderBottom: '2px solid rgba(201, 164, 92, 0.2)',
          paddingBottom: 8
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('rsvp')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: activeTab === 'rsvp' ? '#5E0F15' : 'transparent',
              color: activeTab === 'rsvp' ? '#fff' : '#4b5563',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all .2s ease'
            }}
          >
            📋 Xác nhận tham dự ({rsvps.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishes')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: activeTab === 'wishes' ? '#5E0F15' : 'transparent',
              color: activeTab === 'wishes' ? '#fff' : '#4b5563',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all .2s ease'
            }}
          >
            💌 Sổ lưu bút ({wishes.length})
          </button>
        </div>

        {/* ====================================================
            TAB 1: XÁC NHẬN THAM DỰ (RSVP)
           ==================================================== */}
        {activeTab === 'rsvp' && (
          <div>
            {/* Thống kê RSVP */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 20
            }}>
              <div style={{ background: '#fff', padding: '14px 18px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Tổng phản hồi</p>
                <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: '#111827' }}>{stats.total}</p>
              </div>
              <div style={{ background: '#DCFCE7', padding: '14px 18px', borderRadius: 12, border: '1px solid #BBF7D0' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#166534', fontWeight: 600 }}>Sẽ đến dự (Có)</p>
                <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: '#166534' }}>
                  {stats.yes} <span style={{ fontSize: 14, fontWeight: 500 }}>({stats.totalGuests} người)</span>
                </p>
              </div>
              <div style={{ background: '#FEE2E2', padding: '14px 18px', borderRadius: 12, border: '1px solid #FECACA' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#991B1B', fontWeight: 600 }}>Tiếc quá, bận</p>
                <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: '#991B1B' }}>{stats.no}</p>
              </div>
              <div style={{ background: '#FEF3C7', padding: '14px 18px', borderRadius: 12, border: '1px solid #FDE68A' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#92400E', fontWeight: 600 }}>Chưa chắc</p>
                <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: '#92400E' }}>{stats.maybe}</p>
              </div>
            </div>

            {/* Thanh công cụ RSVP */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Danh sách khách phản hồi</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleExportRsvpCSV}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#15803D',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📥 Xuất Excel (CSV)
                </button>
                <button
                  type="button"
                  onClick={loadRsvps}
                  disabled={loadingRsvps}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  🔄 {loadingRsvps ? 'Đang tải...' : 'Làm mới'}
                </button>
              </div>
            </div>

            {/* Bảng RSVP */}
            {rsvps.length === 0 ? (
              <div style={{ background: '#fff', padding: 40, borderRadius: 16, textAlign: 'center', color: '#6b7280' }}>
                {loadingRsvps ? 'Đang tải danh sách...' : 'Chưa có phản hồi xác nhận tham dự nào.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {rsvps.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '16px 20px',
                      border: '1px solid rgba(201, 164, 92, 0.25)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{r.name}</span>
                        {r.phone && (
                          <a href={`tel:${r.phone}`} style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none' }}>
                            📞 {r.phone}
                          </a>
                        )}
                        <span style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontWeight: 600,
                          background: r.attend === 'Có' ? '#DCFCE7' : r.attend === 'Không' ? '#FEE2E2' : '#FEF3C7',
                          color: r.attend === 'Có' ? '#166534' : r.attend === 'Không' ? '#991B1B' : '#92400E'
                        }}>
                          {r.attend === 'Có' ? `✓ Sẽ đến (${r.guests} người)` : r.attend === 'Không' ? '✕ Tiếc quá, bận' : '? Chưa chắc'}
                        </span>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: '#f3f4f6',
                          color: '#4b5563'
                        }}>
                          {r.side}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {new Date(r.submittedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {r.message && (
                      <p style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: '#4b5563',
                        background: '#fafafa',
                        padding: '8px 12px',
                        borderRadius: 8,
                        borderLeft: '3px solid var(--kim, #C9A45C)'
                      }}>
                        <strong>Lời chúc:</strong> {r.message}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        disabled={actionRsvpId === r.id}
                        onClick={() => handleDeleteRsvp(r.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #fee2e2',
                          background: '#fff',
                          fontSize: 12,
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa bản ghi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 2: SỔ LƯU BÚT (WISHES)
           ==================================================== */}
        {activeTab === 'wishes' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>
                Danh sách lời chúc ({wishes.length})
              </h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleExportWishesCSV}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#15803D',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📥 Xuất CSV (Excel)
                </button>
                <button
                  type="button"
                  onClick={loadWishes}
                  disabled={loadingWishes}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  🔄 {loadingWishes ? 'Đang tải...' : 'Làm mới'}
                </button>
              </div>
            </div>

            {wishes.length === 0 ? (
              <div style={{ background: '#fff', padding: 40, borderRadius: 16, textAlign: 'center', color: '#6b7280' }}>
                {loadingWishes ? 'Đang tải danh sách...' : 'Chưa có lời chúc nào trong hệ thống.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '16px 20px',
                      border: w.approved ? '1px solid rgba(201, 164, 92, 0.3)' : '1px solid #e5e7eb',
                      opacity: w.approved ? 1 : 0.65,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{w.name}</span>
                        <span style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: w.side === 'groom' ? '#FEE2E2' : w.side === 'bride' ? '#FCE7F3' : '#FEF3C7',
                          color: w.side === 'groom' ? '#991B1B' : w.side === 'bride' ? '#9D174D' : '#92400E',
                          fontWeight: 600
                        }}>
                          {w.side === 'groom' ? 'Nhà trai' : w.side === 'bride' ? 'Nhà gái' : w.side === 'both' ? 'Cả hai' : 'Khác'}
                        </span>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: w.approved ? '#DCFCE7' : '#F3F4F6',
                          color: w.approved ? '#166534' : '#6B7280',
                          fontWeight: 600
                        }}>
                          {w.approved ? '● Đang hiện' : '○ Đã ẩn'}
                        </span>
                      </div>

                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {new Date(w.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <p style={{
                      margin: 0,
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: '#374151',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}>
                      {w.message}
                    </p>

                    <div style={{ display: 'flex', gap: 10, marginTop: 4, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                      <button
                        type="button"
                        disabled={actionWishId === w.id}
                        onClick={() => handleToggleHide(w.id, w.approved)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          border: '1px solid #d1d5db',
                          background: '#fff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: w.approved ? '#d97706' : '#16a34a',
                          cursor: 'pointer'
                        }}
                      >
                        {w.approved ? 'Ẩn lời chúc' : 'Hiện lời chúc'}
                      </button>

                      <button
                        type="button"
                        disabled={actionWishId === w.id}
                        onClick={() => handleDeleteWish(w.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          border: '1px solid #fee2e2',
                          background: '#fff',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
