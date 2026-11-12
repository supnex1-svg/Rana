import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PreloaderProps {
  onComplete: () => void;
  onReveal?: () => void; // بيتنادي أول ما البخار يبدأ يتبدد
}

const RED = '#C8202F';
const PINK = '#F7C6CB';
const T_REVEAL = 4300; // لحظة بدء كشف الصفحة الرئيسية (بالمللي ثانية)
const T_FADE = 700; // مدة تبدد البخار

// شكل المخبار (الدورق) المستقبِل
const FLASK =
  'M224 182 H240 V202 L262 230 Q265 238 256 238 H208 Q199 238 202 230 L224 202 Z';

const PUFFS = [
  { r: 14, dx: -22, delay: 2.2 },
  { r: 18, dx: 8, delay: 2.4 },
  { r: 12, dx: 30, delay: 2.6 },
  { r: 16, dx: -6, delay: 2.8 },
  { r: 20, dx: 22, delay: 3.0 },
  { r: 13, dx: -30, delay: 3.2 },
];

const BUBBLES = [
  { x: 214, r: 3 },
  { x: 224, r: 2.2 },
  { x: 233, r: 3.4 },
  { x: 243, r: 2.4 },
  { x: 252, r: 2.8 },
  { x: 228, r: 1.8 },
];

const SPARKS = [
  { x: 262, y: 150 },
  { x: 206, y: 134 },
  { x: 276, y: 118 },
  { x: 236, y: 100 },
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, onReveal }) => {
  const [progress, setProgress] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const anchorRef = useRef<SVGRectElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  // مكان خروج الدخان من المخبار (نقطة بداية انتشار البخار على الشاشة)
  useLayoutEffect(() => {
    const measure = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // شريط التقدم + بدء الكشف
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = reduce ? 300 : T_REVEAL;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1);
      setProgress(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setReveal(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // أول ما البخار يتبدد: نبدأ أنيميشن الـ Hero، وبعد التبدد نشيل الـ Preloader
  useEffect(() => {
    if (!reveal) return;
    onRevealRef.current?.();
    const id = setTimeout(() => onCompleteRef.current(), T_FADE);
    return () => clearTimeout(id);
  }, [reveal]);

  const content = (
    <div
      className="fixed inset-0 overflow-hidden bg-white flex flex-col items-center justify-center px-4"
      style={{
        zIndex: 2147483647,
        opacity: reveal ? 0 : 1,
        transition: `opacity ${T_FADE}ms ease`,
        pointerEvents: reveal ? 'none' : 'auto',
      }}
    >
      <style>{`
        .o-scene { animation: o-in .3s ease both; }
        @keyframes o-in { from { opacity: 0; } to { opacity: 1; } }

        /* الذراع الأيسر بيرتفع شوية، وبعدين المخبار الأول بيميل */
        .o-arm  { transform-origin: 152px 130px; animation: o-arm .4s ease-in-out .4s forwards; }
        @keyframes o-arm { to { transform: rotate(-8deg); } }
        .o-tube { transform-origin: 172px 168px; animation: o-tube .6s ease-in-out .7s forwards; }
        @keyframes o-tube { to { transform: rotate(100deg); } }
        .o-drain { transform-origin: 172px 170px; animation: o-drain 1.3s ease-in 1.4s forwards; }
        @keyframes o-drain { to { transform: scaleY(.05); } }

        /* خيط السائل */
        .o-stream { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; animation: o-stream 1.3s ease-in-out 1.4s forwards; }
        @keyframes o-stream {
          0%   { stroke-dashoffset: 1; opacity: 1; }
          14%  { stroke-dashoffset: 0; opacity: 1; }
          85%  { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        /* السائل الأحمر بيملا المخبار التاني */
        .o-fill { transform-origin: 232px 240px; transform: scaleY(0); animation: o-fill 1.3s ease-out 1.4s forwards; }
        @keyframes o-fill { to { transform: scaleY(1); } }

        /* توهج خفيف عند التفاعل */
        .o-glow { transform-origin: 232px 215px; opacity: 0; animation: o-glow .8s ease-out 2s forwards, o-pulse 1s ease-in-out 2.8s infinite alternate; }
        @keyframes o-glow {
          0%   { opacity: 0; transform: scale(.5); }
          100% { opacity: .8; transform: scale(1); }
        }
        @keyframes o-pulse { from { opacity: .5; } to { opacity: .9; } }

        /* الفقاعات */
        .o-bubble { transform-box: fill-box; transform-origin: center; animation: o-bubble .9s ease-in infinite both; }
        @keyframes o-bubble {
          0%   { transform: translateY(0) scale(.6); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(-34px) scale(1.1); opacity: 0; }
        }

        /* الدخان الطالع من المخبار */
        .o-puff { transform-box: fill-box; transform-origin: center; animation: o-puff 1.5s ease-out infinite both; }
        @keyframes o-puff {
          0%   { transform: translate(0,0) scale(.3); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translate(var(--dx),-140px) scale(2.6); opacity: 0; }
        }

        /* علامات + حمرا طالعة مع الدخان */
        .o-spark { transform-box: fill-box; transform-origin: center; animation: o-spark 1.1s ease-in-out infinite both; }
        @keyframes o-spark {
          0%, 100% { opacity: 0; transform: scale(.4); }
          50%      { opacity: 1; transform: scale(1.2); }
        }

        /* البخار اللي بيغطي الشاشة */
        .o-cover {
          position: absolute;
          width: 300vmax; height: 300vmax;
          margin: -150vmax 0 0 -150vmax;
          border-radius: 50%;
          filter: blur(14px);
          pointer-events: none;
          animation: o-cover 1.4s cubic-bezier(.45,.05,.55,.95) both;
        }
        @keyframes o-cover {
          0%   { transform: scale(.02); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <p className="sr-only" role="status">
        Loading Onboarding 4U
      </p>

      {/* الشخصية (2D من غير خلفية) */}
      <svg
        className="o-scene w-[min(340px,86vw)] h-auto"
        viewBox="0 0 400 260"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="o4u-fadeg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="260">
            <stop offset="0.72" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="o4u-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="260">
            <rect x="0" y="0" width="400" height="260" fill="url(#o4u-fadeg)" />
          </mask>
          <radialGradient id="o4u-glow">
            <stop offset="0" stopColor={RED} stopOpacity=".35" />
            <stop offset="1" stopColor={RED} stopOpacity="0" />
          </radialGradient>
          <clipPath id="o4u-flask">
            <path d={FLASK} />
          </clipPath>
        </defs>

        {/* البالطو */}
        <g mask="url(#o4u-fade)">
          <path
            d="M148 124 Q200 108 252 124 L268 300 H132 Z"
            fill="#fff"
            stroke={RED}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="M178 118 L200 152 L222 118" fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* علامة الزائد على الصدر */}
        <path d="M198 164 V188 M186 176 H210" stroke={RED} strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* الرأس: طاقية حمرا + نضارة أمان */}
        <path d="M192 97 V112 M208 97 V112" stroke={RED} strokeWidth="5" strokeLinecap="round" />
        <circle cx="200" cy="72" r="26" fill="#fff" stroke={RED} strokeWidth="6" />
        <path d="M173 68 A27 27 0 0 1 227 68 Q200 56 173 68 Z" fill={RED} />
        <rect x="179" y="70" width="42" height="12" rx="6" fill="#fff" stroke={RED} strokeWidth="4" />

        {/* توهج التفاعل */}
        <circle className="o-glow" cx="232" cy="215" r="80" fill="url(#o4u-glow)" />

        {/* المخبار التاني (المستقبِل) */}
        <path d={FLASK} fill="#fff" />
        <g clipPath="url(#o4u-flask)">
          <rect x="195" y="224" width="75" height="16" fill={PINK} />
          <rect className="o-fill" x="195" y="206" width="75" height="34" fill={RED} opacity=".92" />
          {BUBBLES.map((b, i) => (
            <circle
              key={i}
              className="o-bubble"
              cx={b.x}
              cy="232"
              r={b.r}
              fill="#fff"
              style={{ animationDelay: `${1.7 + i * 0.12}s` }}
            />
          ))}
        </g>
        <path d={FLASK} fill="none" stroke={RED} strokeWidth="5" strokeLinejoin="round" />
        <rect x="221" y="178" width="22" height="6" rx="3" fill={RED} />
        <rect ref={anchorRef} x="231" y="179" width="2" height="2" fill="none" />

        {/* الذراع الأيمن ماسك المخبار التاني */}
        <path d="M248 132 L276 188 L232 218" stroke={RED} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M248 132 L276 188 L232 218" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="232" cy="218" r="9" fill="#fff" stroke={RED} strokeWidth="5" />

        {/* الذراع الأيسر + المخبار الأول (اللي بيصب) */}
        <g className="o-arm">
          <path d="M152 132 L128 190 L172 168" stroke={RED} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M152 132 L128 190 L172 168" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <g className="o-tube">
            <path d="M165 112 H179 V169 A7 7 0 0 1 165 169 Z" fill="#fff" stroke={RED} strokeWidth="4" strokeLinejoin="round" />
            <rect className="o-drain" x="167.5" y="128" width="9" height="42" rx="4" fill={RED} />
            <rect x="162" y="108" width="20" height="6" rx="3" fill={RED} />
          </g>
          <circle cx="172" cy="168" r="9" fill="#fff" stroke={RED} strokeWidth="5" />
        </g>

        {/* خيط السائل */}
        <path
          className="o-stream"
          pathLength={1}
          d="M233 170 V206"
          stroke={RED}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* علامات + حمرا */}
        {SPARKS.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <path
              className="o-spark"
              d="M-5 0H5M0 -5V5"
              stroke={RED}
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animationDelay: `${2.3 + i * 0.2}s` }}
            />
          </g>
        ))}

        {/* الدخان */}
        {PUFFS.map((p, i) => (
          <circle
            key={i}
            className="o-puff"
            cx="232"
            cy="180"
            r={p.r}
            fill="#fff"
            stroke="rgba(200,32,47,.3)"
            strokeWidth="2.5"
            style={
              {
                '--dx': `${p.dx}px`,
                animationDelay: `${p.delay}s`,
                filter: 'drop-shadow(0 0 4px rgba(200,32,47,.18))',
              } as React.CSSProperties
            }
          />
        ))}
      </svg>

      {/* اسم الشركة */}
      <div className="mt-4 flex items-center gap-1.5 text-xl font-black tracking-tight">
        <span style={{ color: RED }}>Onboarding</span>
        <span className="text-[#171717]">4U</span>
      </div>

      {/* التحميل */}
      <div className="w-[min(340px,86vw)] mt-5">
        <div className="flex items-center justify-between mb-1.5 text-sm font-bold tracking-wide" style={{ color: RED }}>
          <span>Loading</span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-red-100 overflow-hidden"
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: RED, boxShadow: '0 0 10px rgba(200,32,47,.55)' }}
          />
        </div>
      </div>

      {/* البخار اللي بيغطي الشاشة كلها (فوق كل حاجة) */}
      <div
        className="o-cover"
        style={{
          left: origin.x,
          top: origin.y,
          animationDelay: '2.7s',
          background:
            'radial-gradient(closest-side, #ffffff 0%, #ffffff 58%, rgba(200,32,47,.10) 66%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="o-cover"
        style={{
          left: origin.x,
          top: origin.y,
          animationDelay: '2.85s',
          animationDuration: '1.3s',
          background:
            'radial-gradient(closest-side, rgba(255,240,241,.95) 0%, rgba(255,246,247,.9) 58%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* تخطي */}
      <button
        type="button"
        onClick={() => setReveal(true)}
        aria-label="Skip loading animation"
        className="absolute bottom-6 right-5 z-10 text-xs font-semibold text-gray-600 hover:text-[#C8202F] transition-colors"
      >
        Skip
      </button>
    </div>
  );

  return createPortal(content, document.body);
};

export default Preloader;