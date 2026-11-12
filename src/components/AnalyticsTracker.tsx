import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview, trackEngaged, trackEvent } from '../lib/analytics';

const WHATSAPP_HOSTS = ['wa.me', 'whatsapp.com'];

// لو اللينك واتساب / تليفون / إيميل بنرجّع نوعه، غير كده null
function contactLabel(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute('href') || '';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('whatsapp:')) return 'whatsapp';
  try {
    const host = new URL(href, window.location.origin).hostname;
    if (WHATSAPP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'whatsapp';
  } catch {
    /* لينك مش صالح */
  }
  return null;
}

// بيتحط جوه <Router> في App.tsx. مش بيعرض أي حاجة على الشاشة.
const AnalyticsTracker: React.FC = () => {
  const { pathname } = useLocation();

  // مشاهدة صفحة عند كل تغيير في الصفحة
  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  // التفاعل: 10 ثواني والتبويب ظاهر
  useEffect(() => {
    let seconds = 0;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      seconds += 1;
      if (seconds >= 10) {
        trackEngaged();
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // ضغطات التواصل (واتساب، تليفون، إيميل) من أي مكان في الموقع
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const label = contactLabel(link);
      if (label) trackEvent('click', label);
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
};

export default AnalyticsTracker;