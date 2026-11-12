import type { Lang } from '../context/LanguageContext';

const AR: Record<string, string> = {
  Home: 'الرئيسية',
  'The Firm': 'عن الشركة',
  'Strategic Services': 'خدماتنا الاستراتيجية',
  Partnerships: 'الشراكات',
  Consultation: 'استشارة',
};

export const navLabel = (label: string, lang: Lang): string =>
  lang === 'ar' ? AR[label] ?? label : label;