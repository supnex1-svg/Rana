import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  label: string; // اسم الكاروسيل لقارئ الشاشة (مش بيظهر على الشاشة)
  aspectClass?: string; // شكل الصورة، الافتراضي 4:3. للبوسترات المربعة: 'aspect-square'
  hoverZoom?: boolean; // زوم خفيف عند الـ hover
  loop?: boolean; // بعد آخر صورة ترجع الأولى (لوب)
}

// عدد الصور المكررة على كل طرف للوب (لازم يكون على الأقل عدد الصور الظاهرة - 1)
const CLONES = 3;

// لو الصورة مش موجودة يظهر مربع بديل بدل أيقونة مكسورة
const Slide: React.FC<{
  image: CarouselImage;
  index: number;
  total: number;
  aspectClass: string;
  hoverZoom: boolean;
  clone: boolean;
}> = ({ image, index, total, aspectClass, hoverZoom, clone }) => {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      role={clone ? undefined : 'group'}
      aria-roledescription={clone ? undefined : 'slide'}
      aria-label={clone ? undefined : `${index + 1} of ${total}`}
      aria-hidden={clone ? true : undefined}
      className="snap-start shrink-0 basis-full sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)] m-0"
    >
      <div className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group`}>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs font-semibold">
            <ImageOff size={28} aria-hidden="true" />
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
            className={`w-full h-full object-cover transition-transform duration-700 motion-reduce:transition-none ${
              hoverZoom ? 'group-hover:scale-105 motion-reduce:group-hover:scale-100' : ''
            }`}
          />
        )}
      </div>
      {image.caption && (
        <figcaption className="mt-3 text-sm font-semibold text-gray-800">{image.caption}</figcaption>
      )}
    </figure>
  );
};

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  label,
  aspectClass = 'aspect-[4/3]',
  hoverZoom = true,
  loop = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const n = images.length;
  const loopOn = loop && n > 3; // اللوب مالوش لازمة لو الصور قليلة
  const C = loopOn ? Math.min(CLONES, n) : 0;

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(n > 1);
  const [active, setActive] = useState(0);

  const logicalRef = useRef(0); // رقم الصورة الحالية الحقيقي (من غير النسخ المكررة)
  const touchingRef = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);

  // عرض الصورة + المسافة بين الصور = خطوة السهم الواحدة
  const getStep = useCallback(() => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.offsetWidth + gap;
  }, []);

  // قفزة فورية من غير حركة (بتستخدم في اللوب)
  const jumpTo = useCallback((left: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = left;
    el.style.scrollBehavior = '';
  }, []);

  // تحديث حالة الأسهم حسب مكان السكرول
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const step = getStep();
    const idx = step ? Math.round(el.scrollLeft / step) : 0;
    if (loopOn) {
      const logical = (((idx - C) % n) + n) % n;
      logicalRef.current = logical;
      setActive(logical);
    } else {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
      setActive(idx);
    }
  }, [getStep, loopOn, C, n]);

  // لما السكرول يقف جوه النسخ المكررة نرجع للأصلية (القفزة مش بتبان لأن الصور متطابقة)
  const normalize = useCallback(() => {
    const el = trackRef.current;
    if (!el || !loopOn || touchingRef.current) return;
    const step = getStep();
    if (!step) return;
    const idx = Math.round(el.scrollLeft / step);
    if (idx < C) jumpTo(el.scrollLeft + n * step);
    else if (idx >= C + n) jumpTo(el.scrollLeft - n * step);
  }, [getStep, jumpTo, loopOn, C, n]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;

    const schedule = () => {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(normalize, 140);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
      if (loopOn) schedule();
    };
    const onTouchStart = () => {
      touchingRef.current = true;
    };
    const onTouchEnd = () => {
      touchingRef.current = false;
      if (loopOn) schedule();
    };

    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // أول مرة وعند تغيير المقاس: نثبّت المكان على الصورة الحالية (وفي اللوب نبدأ بعد النسخ المكررة)
    const ro = new ResizeObserver(() => {
      if (loopOn) jumpTo((C + logicalRef.current) * getStep());
      update();
    });
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer.current);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      ro.disconnect();
    };
  }, [update, normalize, loopOn, C, getStep, jumpTo]);

  const prefersReducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({
      left: (C + i) * getStep(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const move = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getStep(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // أسهم الكيبورد لما الفوكس على الصور
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(-1);
    }
  };

  const arrowClass =
    'absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#171717] border border-gray-200 shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-[#C8202F] hover:text-white hover:border-[#C8202F] active:scale-90 disabled:opacity-0 disabled:pointer-events-none';

  // نقط التنقل لحد 8 صور بس (من غير أرقام)
  const useDots = n > 1 && n <= 8;

  // الصور: في اللوب بنحط نسخة من آخر صور في الأول ونسخة من أول صور في الآخر
  const slides = loopOn
    ? [
        ...images.slice(n - C).map((img, i) => ({ img, key: `head-${i}`, clone: true, index: n - C + i })),
        ...images.map((img, i) => ({ img, key: `main-${img.src}`, clone: false, index: i })),
        ...images.slice(0, C).map((img, i) => ({ img, key: `tail-${i}`, clone: true, index: i })),
      ]
    : images.map((img, i) => ({ img, key: `main-${img.src}`, clone: false, index: i }));

  return (
    // dir="ltr": الكاروسيل بيفضل شمال/يمين حتى لو الصفحة عربي (عشان حساب السكرول واللوب)
    <div dir="ltr" role="region" aria-roledescription="carousel" aria-label={label} className="relative">
      {/* إخفاء شريط السكرول */}
      <style>{`.o4u-track::-webkit-scrollbar { display: none; }`}</style>

      {/* السهم الشمال */}
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={!loopOn && !canPrev}
        aria-label={`Previous images, ${label}`}
        className={`${arrowClass} left-2 sm:-left-5`}
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>

      {/* الصور جنب بعض */}
      <div
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="o4u-track flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto pb-1 rounded-2xl focus-visible:outline-offset-4"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {slides.map(({ img, key, clone, index }) => (
          <Slide
            key={key}
            image={img}
            index={index}
            total={n}
            aspectClass={aspectClass}
            hoverZoom={hoverZoom}
            clone={clone}
          />
        ))}
      </div>

      {/* السهم اليمين */}
      <button
        type="button"
        onClick={() => move(1)}
        disabled={!loopOn && !canNext}
        aria-label={`Next images, ${label}`}
        className={`${arrowClass} right-2 sm:-right-5`}
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>

      {/* نقط التنقل (لحد 8 صور) */}
      {useDots && (
        <div className="mt-5 flex justify-center gap-2" role="group" aria-label={`${label} navigation`}>
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              className="p-2.5 -m-0.5"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-[#C8202F]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;