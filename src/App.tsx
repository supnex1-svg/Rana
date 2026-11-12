import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ClickFeedback from './components/ClickFeedback';
import AnalyticsTracker from './components/AnalyticsTracker';
import { ToastProvider } from './components/ToastProvider';
import { ConfirmProvider } from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import { PageSkeleton } from './components/Skeleton';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './pages/Home';

// الصفحات التانية بتتحمل لما تتطلب (تحميل أسرع للصفحة الأولى)
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Clients = lazy(() => import('./pages/Clients'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Audit = lazy(() => import('./pages/Audit'));
const PillarDetail = lazy(() => import('./pages/Pillars'));

const TEXT = {
  en: {
    skip: 'Skip to main content',
    navigated: 'Navigated to',
    notFoundCode: 'Error 404',
    notFoundTitle: "We couldn't find that page",
    notFoundText: 'The link may be broken or the page may have moved. Try one of these instead.',
    backHome: 'Back to home',
    viewServices: 'View services',
  },
  ar: {
    skip: 'تخطي إلى المحتوى الرئيسي',
    navigated: 'تم الانتقال إلى',
    notFoundCode: 'خطأ 404',
    notFoundTitle: 'لم نتمكن من العثور على هذه الصفحة',
    notFoundText: 'قد يكون الرابط معطلاً أو تم نقل الصفحة. جرّب أحد الخيارات التالية.',
    backHome: 'العودة للرئيسية',
    viewServices: 'عرض الخدمات',
  },
};

// رابط "تخطي للمحتوى" لمستخدمي الكيبورد وقارئ الشاشة
const SkipLink: React.FC = () => {
  const { lang } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => {
        const main = document.getElementById('main-content');
        main?.focus();
        main?.scrollIntoView();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[2000] focus:bg-[#171717] focus:text-white focus:px-5 focus:py-3 focus:rounded-lg focus:font-bold"
    >
      {TEXT[lang].skip}
    </button>
  );
};

// عند تغيير الصفحة: اسكرول لفوق + فوكس على المحتوى + إعلان لقارئ الشاشة
const RouteChangeHandler: React.FC = () => {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById('main-content')?.focus({ preventScroll: true });
    const id = setTimeout(() => setMessage(`${TEXT[lang].navigated} ${document.title}`), 150);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -10 }}
      transition={{ duration: reduce ? 0.01 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const NotFound: React.FC = () => {
  const { lang } = useLanguage();
  const t = TEXT[lang];
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
      <p className="text-sm font-bold text-[#C8202F] uppercase tracking-widest">{t.notFoundCode}</p>
      <h1 className="text-3xl font-extrabold text-[#171717]">{t.notFoundTitle}</h1>
      <p className="text-gray-700 text-sm leading-relaxed">{t.notFoundText}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-[#C8202F] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl min-h-[48px] transition-colors"
        >
          {t.backHome}
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center justify-center border border-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl min-h-[48px] hover:bg-gray-50 transition-colors"
        >
          {t.viewServices}
        </Link>
      </div>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
            <Route path="/services/:pillarId" element={<PageWrapper><PillarDetail /></PageWrapper>} />
            <Route path="/clients" element={<PageWrapper><Clients /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/audit" element={<PageWrapper><Audit /></PageWrapper>} />
            <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Router>
            <SkipLink />
            <RouteChangeHandler />

            {/* تتبّع الزيارات (مش بيعرض أي حاجة على الشاشة) */}
            <AnalyticsTracker />

            {/* صوت التكة + تأثير النبضة لأي زرار أو لينك في الموقع */}
            <ClickFeedback />

            <div className="flex flex-col min-h-screen relative">
              <Navbar />
              <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
                <AnimatedRoutes />
              </main>
              <Footer />

              {/* زر الواتساب الدائري العائم الثابت على الشاشة */}
              <WhatsAppButton />
            </div>
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;