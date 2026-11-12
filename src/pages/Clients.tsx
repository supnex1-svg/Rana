import React, { useState } from 'react';
import { CLIENTS } from '../constants';
import { Quote, Globe } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage, type Lang } from '../context/LanguageContext';

const en = {
  seoTitle: 'Our Partners & Clients | Onboarding 4U',
  seoDesc: 'Trusted by leading pharmacy retail chains and partners across Egypt and Saudi Arabia.',
  badge: 'Regional Footprint',
  title: 'Strategic Partnerships & Success Stories',
  intro:
    'Empowering operational excellence for major pharmacy retail chains and leading healthcare providers across Egypt and Saudi Arabia.',
  egyptTitle: 'Our Partners in the Arab Republic of Egypt',
  ksaTitle: 'Our Partners in the Kingdom of Saudi Arabia',
  egyptRole: 'Development & Audit Partner',
  ksaRole: 'Strategic Expansion Partner',
  logoAlt: (name: string) => `${name} logo`,
  quote:
    '"Standard advice doesn\'t make a difference; operational rigor and on-ground presence do. Our partners choose us because we speak the language of the pharmacist and the entire ecosystem."',
  quoteBy: 'Onboarding 4U • Advisory Board',
};

type ClientsContent = typeof en;

const ar: ClientsContent = {
  seoTitle: 'شركاؤنا وعملاؤنا | Onboarding 4U',
  seoDesc: 'موثوق به من كبرى سلاسل تجزئة الصيدليات والشركاء في مصر والمملكة العربية السعودية.',
  badge: 'حضورنا الإقليمي',
  title: 'شراكات استراتيجية وقصص نجاح',
  intro:
    'نمكّن التميّز التشغيلي لكبرى سلاسل تجزئة الصيدليات ومقدمي الرعاية الصحية الرائدين في مصر والمملكة العربية السعودية.',
  egyptTitle: 'شركاؤنا في جمهورية مصر العربية',
  ksaTitle: 'شركاؤنا في المملكة العربية السعودية',
  egyptRole: 'شريك التطوير والتدقيق',
  ksaRole: 'شريك التوسع الاستراتيجي',
  logoAlt: (name: string) => `شعار ${name}`,
  quote:
    '«النصائح التقليدية لا تصنع فرقًا؛ الصرامة التشغيلية والحضور الميداني هما ما يصنعه. يختارنا شركاؤنا لأننا نتحدث لغة الصيدلي والمنظومة بأكملها.»',
  quoteBy: 'Onboarding 4U • المجلس الاستشاري',
};

const content: Record<Lang, ClientsContent> = { en, ar };

// الشريك ممكن يكون له logo (مسار الصورة). لو مفيش، بيظهر الاسم بدالها.
type Partner = (typeof CLIENTS)[number] & { logo?: string };

// لوجو الشريك مع بديل لو الصورة مش موجودة
const PartnerLogo: React.FC<{ partner: Partner; boxClass: string; alt: string }> = ({
  partner,
  boxClass,
  alt,
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = !!partner.logo && !failed;

  return (
    <div
      className={`w-20 h-20 rounded-xl flex items-center justify-center p-3 shadow-sm border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${boxClass}`}
    >
      {showImage ? (
        <img
          src={partner.logo}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <span aria-hidden="true" className="text-xs font-black text-[#171717] text-center">
          {partner.name.split(' ')[0]}
        </span>
      )}
    </div>
  );
};

// كارت الشريك (بيتستخدم في مصر والسعودية)
const PartnerCard: React.FC<{
  partner: Partner;
  role: string;
  logoAlt: string;
  cardClass: string;
  logoBoxClass: string;
}> = ({ partner, role, logoAlt, cardClass, logoBoxClass }) => (
  <div
    className={`group rounded-2xl p-6 flex items-center gap-5 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 ${cardClass}`}
  >
    <PartnerLogo partner={partner} boxClass={logoBoxClass} alt={logoAlt} />
    <div>
      <h3 className="text-base font-bold text-[#171717] group-hover:text-[#C8202F] transition-colors">
        {partner.name}
      </h3>
      <p className="text-xs text-gray-600 font-medium">{role}</p>
    </div>
  </div>
);

const Clients: React.FC = () => {
  const { lang } = useLanguage();
  const t = content[lang];

  const egyptPartners = CLIENTS.filter((c) => c.region === 'Egypt') as Partner[];
  const ksaPartners = CLIENTS.filter((c) => c.region === 'Saudi Arabia') as Partner[];

  return (
    <div className="flex flex-col bg-white text-gray-900 leading-relaxed">
      <SEO title={t.seoTitle} description={t.seoDesc} />

      {/* Hero Section - Dark Theme for Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div aria-hidden="true" className="absolute -top-24 left-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8202F] text-white text-xs font-bold uppercase tracking-widest shadow-md">
              <Globe size={14} aria-hidden="true" /> {t.badge}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              {t.title}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed font-medium pt-2">
              {t.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Egypt Partners Section */}
      <section className="py-20 sm:py-28 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mb-12 border-s-4 border-[#C8202F] ps-4 tracking-tight">
              {t.egyptTitle}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {egyptPartners.map((partner, i) => (
              <ScrollReveal key={partner.name} direction="up" delay={i * 0.08}>
                <PartnerCard
                  partner={partner}
                  role={t.egyptRole}
                  logoAlt={t.logoAlt(partner.name)}
                  cardClass="bg-gray-50"
                  logoBoxClass="bg-white"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Saudi Arabia Partners Section (if available) */}
      {ksaPartners.length > 0 && (
        <section className="py-20 sm:py-28 bg-gray-50/80 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] mb-12 border-s-4 border-[#C8202F] ps-4 tracking-tight">
                {t.ksaTitle}
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ksaPartners.map((partner, i) => (
                <ScrollReveal key={partner.name} direction="up" delay={i * 0.08}>
                  <PartnerCard
                    partner={partner}
                    role={t.ksaRole}
                    logoAlt={t.logoAlt(partner.name)}
                    cardClass="bg-white"
                    logoBoxClass="bg-gray-50"
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Impact Quote Section */}
      <section className="py-24 bg-[#171717] text-white text-center relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none" />

        <ScrollReveal direction="up" className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <Quote className="mx-auto text-[#C8202F]" size={54} aria-hidden="true" />
          <h2 className="text-xl sm:text-3xl font-black leading-snug tracking-tight">
            {t.quote}
          </h2>
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.3em]">{t.quoteBy}</p>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Clients;