import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

export type Lang = 'en' | 'ar';

const STORAGE_KEY = 'o4u-lang';

interface LanguageContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// اللغة المحفوظة، ولو مفيش الإنجليزي (غيّريها لـ 'ar' لو عايزة العربي الافتراضي)
const getInitialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* تجاهل */
  }
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // تثبيت lang و dir على <html> و <body>، ولو أي كود تاني غيّرهم بنرجّعهم علطول
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const apply = () => {
      if (root.lang !== lang) root.lang = lang;
      if (root.dir !== dir) root.dir = dir;
      if (body.dir !== dir) body.dir = dir;
    };
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ['dir', 'lang'] });
    observer.observe(body, { attributes: true, attributeFilter: ['dir'] });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* تجاهل */
    }

    return () => observer.disconnect();
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((p) => (p === 'en' ? 'ar' : 'en')), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, isRTL: lang === 'ar', setLang, toggleLang }),
    [lang, dir, setLang, toggleLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {/* عنصر لافّ التطبيق كله بالاتجاه (مش بيأثر على التصميم) */}
      <div dir={dir} lang={lang} style={{ display: 'contents' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
};