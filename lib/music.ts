/* Chỉ dùng ở client. play() phải được gọi ngay trong sự kiện chạm/bấm của người xem. */

export type Player = {
  play: () => Promise<boolean>;
  pause: () => void;
  destroy: () => void;
};

/** Hộp nhạc tự tổng hợp bằng Web Audio (giai điệu tự viết) – dùng khi chưa có file nhạc */
function createMusicBox(): Player {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let suspendTimer: ReturnType<typeof setTimeout> | undefined;
  let next = 0;
  let step = 0;
  const STEP = 0.34;
  const CHORDS = [[48, 60, 64, 67, 72], [45, 57, 60, 64, 69], [41, 57, 60, 65, 69], [43, 55, 59, 62, 67]];
  const PATTERN = [1, 2, 3, 4, 3, 2];

  const bell = (midi: number, t: number, vol: number, len: number) => {
    if (!ctx || !master) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain();
    g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    for (const [mul, amp] of [[1, 1], [2, 0.2], [3.01, 0.05]]) {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.frequency.value = f * mul;
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + len + 0.05);
    }
  };

  const schedule = () => {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.4) {
      const bar = Math.floor(step / 6);
      const i = step % 6;
      const chord = CHORDS[bar % 4];
      if (i === 0) bell(chord[0], next, 0.09, 2.8);
      bell(chord[PATTERN[i]] + 12, next, i === 0 ? 0.08 : 0.05, 1.9);
      if (i === 3 && bar % 2 === 1) bell(chord[4] + 12, next + STEP * 0.5, 0.03, 2.2);
      step++;
      next += STEP;
    }
  };

  return {
    async play() {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      if (!ctx) {
        ctx = new AC();
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 3200;
        master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(lowpass).connect(ctx.destination);
      }
      clearTimeout(suspendTimer);
      const resumed = ctx.resume();
      const t = ctx.currentTime;
      next = t + 0.08;
      master!.gain.cancelScheduledValues(t);
      master!.gain.setValueAtTime(Math.max(master!.gain.value, 0.0001), t);
      master!.gain.exponentialRampToValueAtTime(0.75, t + 1.6);
      clearInterval(timer);
      timer = setInterval(schedule, 100);
      schedule();
      await resumed.catch(() => undefined);
      return true;
    },
    pause() {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      clearInterval(timer);
      suspendTimer = setTimeout(() => ctx?.suspend(), 600);
    },
    destroy() {
      clearInterval(timer);
      clearTimeout(suspendTimer);
      ctx?.close();
      ctx = null;
    },
  };
}

function createFilePlayer(src: string, volume: number): Player {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = volume;
  return {
    play: () => audio.play().then(() => true, () => false),
    pause: () => audio.pause(),
    destroy: () => {
      audio.pause();
      audio.src = '';
    },
  };
}

export function createPlayer(src?: string, volume = 0.6): Player {
  return src ? createFilePlayer(src, volume) : createMusicBox();
}
