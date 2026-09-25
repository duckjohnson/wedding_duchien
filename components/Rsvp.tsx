'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { Wish } from '@/config/wedding';
import { SectionHead } from './Ornaments';

type Props = { guest: string; guestFromLink: boolean; deadline?: string; initialWishes: Wish[] };

type Attend = 'Có' | 'Không' | 'Chưa chắc';
const CHOICES: [Attend, string][] = [['Có', 'Mình sẽ đến'], ['Không', 'Tiếc quá, mình bận'], ['Chưa chắc', 'Chưa chắc']];

export function Rsvp({ guest, guestFromLink, deadline, initialWishes }: Props) {
  const [wishes, setWishes] = useState<(Wish & { isNew?: boolean; key: string })[]>(
    initialWishes.map((w, i) => ({ ...w, key: `s${i}` })),
  );
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState<'name' | 'attend' | null>(null);
  const [sending, setSending] = useState(false);
  const [doneText, setDoneText] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const fail = (msg: string, field: 'name' | 'attend' | null) => {
    setError(msg);
    setInvalid(field);
    if (field === 'name') nameRef.current?.focus();
    if (field === 'attend') formRef.current?.querySelector<HTMLInputElement>('input[name=attend]')?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const attend = fd.get('attend') as Attend | null;
    if (!name) return fail('Nhập tên của bạn để cô dâu chú rể biết ai đã phản hồi.', 'name');
    if (!attend) return fail('Chọn một trong ba lựa chọn: sẽ đến, bận hoặc chưa chắc.', 'attend');

    const payload = {
      name,
      phone: String(fd.get('phone') ?? ''),
      attend,
      guests: String(fd.get('guests') ?? ''),
      side: String(fd.get('side') ?? ''),
      message: String(fd.get('message') ?? '').trim(),
      linkGuest: guestFromLink ? guest : '',
    };

    setSending(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return fail(data.error ?? 'Chưa gửi được. Bấm Gửi xác nhận lần nữa sau ít phút.', null);
    } catch {
      return fail('Chưa gửi được vì mất kết nối mạng. Kiểm tra mạng rồi bấm Gửi xác nhận lần nữa.', null);
    } finally {
      setSending(false);
    }

    if (payload.message) setWishes((w) => [{ name, message: payload.message, isNew: true, key: `n${Date.now()}` }, ...w]);
    setDoneText(
      attend === 'Có'
        ? `Cảm ơn ${name}! Chúng mình rất mong được gặp bạn trong ngày vui.`
        : attend === 'Không'
          ? `Cảm ơn ${name} đã báo cho chúng mình. Hẹn bạn một dịp khác nhé!`
          : `Cảm ơn ${name}! Khi chắc chắn, bạn có thể gửi lại câu trả lời.`,
    );
    requestAnimationFrame(() => doneRef.current?.focus());
  };

  const editAgain = () => {
    setDoneText(null);
    requestAnimationFrame(() => {
      const msg = formRef.current?.querySelector('textarea');
      if (msg) msg.value = '';
      nameRef.current?.focus();
    });
  };

  return (
    <section className="sec rsvp" id="xacnhan" aria-labelledby="t-rsvp">
      <SectionHead
        id="t-rsvp"
        title="Xác nhận tham dự"
        sub={deadline ? `Bạn vui lòng phản hồi trước ngày ${deadline} để gia đình chuẩn bị chu đáo` : 'Bạn vui lòng cho gia đình biết bạn có đến được không'}
      />

      <form ref={formRef} className="form" noValidate data-reveal="up" onSubmit={onSubmit} hidden={doneText !== null}>
        <div className="field">
          <label htmlFor="f-name">Tên của bạn</label>
          <input
            ref={nameRef}
            className="input"
            id="f-name"
            name="name"
            autoComplete="name"
            required
            defaultValue={guestFromLink ? guest : ''}
            aria-invalid={invalid === 'name' || undefined}
            onInput={() => invalid === 'name' && setInvalid(null)}
          />
        </div>
        <div className="field">
          <label htmlFor="f-phone">Số điện thoại (không bắt buộc)</label>
          <input className="input" id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
        </div>
        <fieldset className="field">
          <legend>Bạn sẽ đến dự chứ?</legend>
          <div className="choices">
            {CHOICES.map(([value, label]) => (
              <label key={value} className="choice">
                <input
                  type="radio"
                  name="attend"
                  value={value}
                  aria-invalid={invalid === 'attend' || undefined}
                  onChange={() => {
                    if (invalid === 'attend') {
                      setInvalid(null);
                      setError('');
                    }
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-guests">Số người đi cùng</label>
            <select className="input" id="f-guests" name="guests" defaultValue="1">
              <option value="1">1 người</option>
              <option value="2">2 người</option>
              <option value="3">3 người</option>
              <option value="4">4 người</option>
              <option value="5+">5 người trở lên</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-side">Bạn là khách của</label>
            <select className="input" id="f-side" name="side" defaultValue="Nhà trai">
              <option>Nhà trai</option>
              <option>Nhà gái</option>
              <option>Cả hai</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-msg">Lời chúc gửi cô dâu chú rể</label>
          <textarea className="input" id="f-msg" name="message" rows={3} maxLength={500} />
        </div>
        <p className="form-error" role="alert">{error}</p>
        <button className="btn btn-solid btn-block" type="submit" disabled={sending}>
          {sending ? 'Đang gửi…' : 'Gửi xác nhận'}
        </button>
      </form>

      {doneText !== null ? (
        <div ref={doneRef} className="form-done" tabIndex={-1}>
          <p className="form-done-title">Đã gửi xác nhận</p>
          <p>{doneText}</p>
          <button className="btn" type="button" onClick={editAgain}>Sửa câu trả lời</button>
        </div>
      ) : null}

      <div className="wishes" data-reveal="up">
        <h3 className="wishes-title">Sổ lưu bút</h3>
        <ul className="wish-list" aria-live="polite">
          {wishes.map((w) => (
            <li key={w.key} className={w.isNew ? 'wish is-new' : 'wish'}>
              <p className="wish-name">{w.name}</p>
              <p className="wish-msg">{w.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
