import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, toggleLang } = useLanguage();
  const toArabic = lang === 'en';

  return (
    <button
      type="button"
      onClick={toggleLang}
      lang={toArabic ? 'ar' : 'en'}
      aria-label={toArabic ? 'التبديل إلى اللغة العربية' : 'Switch to English'}
      className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-4 py-2 min-h-[44px] text-xs font-black text-[#171717] hover:border-[#C8202F] hover:text-[#C8202F] transition-colors ${className}`}
    >
      <Globe size={16} aria-hidden="true" />
      <span>{toArabic ? 'العربية' : 'English'}</span>
    </button>
  );
};

export default LanguageToggle;