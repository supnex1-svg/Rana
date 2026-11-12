import React, { useEffect } from 'react';

// أي عنصر من دول بيطلع صوت وتأثير لما يتضغط عليه
const SELECTOR =
  'button, a[href], [role="button"], input[type="submit"], input[type="button"], summary';

let audioCtx: AudioContext | null = null;

// صوت لطيف قصير متولّد بالكود (زي فقاعة صغيرة)
export function playClick() {
  try {
    if (localStorage.getItem('o4u-sound') === 'off') return;
  } catch {
    /* تجاهل */
  }

  try {
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;

    audioCtx = audioCtx ?? new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    // نغمة ناعمة بتنزل شوية
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);

    // فلتر بيشيل الحدة
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    // بداية سريعة ونهاية بتتلاشى بنعومة (من غير فرقعة)
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  } catch {
    /* لو المتصفح منع الصوت منكسرش الموقع */
  }
}

// تشغيل / إيقاف الصوت (اختياري): setClickSound(false)
export function setClickSound(on: boolean) {
  try {
    localStorage.setItem('o4u-sound', on ? 'on' : 'off');
  } catch {
    /* تجاهل */
  }
}

function ripple(x: number, y: number) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.createElement('span');
  el.className = 'o4u-ripple';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  const remove = () => el.remove();
  el.addEventListener('animationend', remove, { once: true });
  setTimeout(remove, 800); // احتياطي
}

const isDisabled = (el: Element) =>
  (el as HTMLButtonElement).disabled === true ||
  el.getAttribute('aria-disabled') === 'true';

export const ClickFeedback: React.FC = () => {
  useEffect(() => {
    // ضغطة بالماوس أو باللمس: صوت + نبضة + اهتزاز
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = (e.target as Element | null)?.closest?.(SELECTOR);
      if (!target || isDisabled(target)) return;

      playClick();
      ripple(e.clientX, e.clientY);
      navigator.vibrate?.(8);
    };

    // ضغطة بالكيبورد (Enter / Space): detail === 0
    const onClick = (e: MouseEvent) => {
      if (e.detail !== 0) return;
      const target = (e.target as Element | null)?.closest?.(SELECTOR);
      if (!target || isDisabled(target)) return;

      playClick();
      const r = target.getBoundingClientRect();
      ripple(r.left + r.width / 2, r.top + r.height / 2);
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('click', onClick, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <style>{`
      .o4u-ripple {
        position: fixed;
        width: 14px;
        height: 14px;
        margin: -7px 0 0 -7px;
        border-radius: 50%;
        border: 2px solid rgba(200, 32, 47, .7);
        background: rgba(255, 255, 255, .35);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, .5);
        pointer-events: none;
        z-index: 2147483647;
        animation: o4u-ripple .55s ease-out forwards;
      }
      @keyframes o4u-ripple {
        0%   { transform: scale(.4); opacity: .9; }
        100% { transform: scale(4.5); opacity: 0; }
      }
    `}</style>
  );
};

export default ClickFeedback;