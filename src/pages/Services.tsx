import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';
import { Users, ClipboardCheck, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage, type Lang } from '../context/LanguageContext';
import { localizeService } from '../i18n/services';

const en = {
  seoTitle: 'Strategic Services | Onboarding 4U',
  seoDesc:
    'Explore the four pillars of pharmacy development: Operations, Marketing, Human Resources, and Quality.',
  badge: 'Our Expertise',
  title: 'Specialized Expertise & Management for Pharmacies',
  intro:
    'Comprehensive solutions ensuring complete pharmacy restructuring and elevating all pillars of commercial and operational success.',
  learnMore: 'Learn More',
  learnMoreAbout: (title: string) => `Learn more about ${title}`,
};

type ServicesContent = typeof en;

const ar: ServicesContent = {
  seoTitle: 'الخدمات الاستراتيجية | Onboarding 4U',
  seoDesc:
    'استكشف الركائز الأربع لتطوير الصيدليات: العمليات والتسويق والموارد البشرية والجودة.',
  badge: 'خبراتنا',
  title: 'خبرة متخصصة وإدارة للصيدليات',
  intro:
    'حلول شاملة تضمن إعادة هيكلة الصيدلية بالكامل وترفع جميع ركائز النجاح التجاري والتشغيلي.',
  learnMore: 'اعرف المزيد',
  learnMoreAbout: (title: string) => `اعرف المزيد عن ${title}`,
};

const content: Record<Lang, ServicesContent> = { en, ar };

const Services: React.FC = () => {
  const { lang, isRTL } = useLanguage();
  const t = content[lang];
  const side = (d: 'left' | 'right') => (isRTL ? (d === 'left' ? 'right' : 'left') : d);

  return (
    <div className="flex flex-col bg-white text-gray-900 leading-relaxed">
      <SEO title={t.seoTitle} description={t.seoDesc} />

      {/* Hero Header - Dark Theme for Top Navigation Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
        {/* Subtle Decorative Background Glow */}
        <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C8202F]/20 blur-3xl rounded-full pointer-events-none" />

        <ScrollReveal direction="up" className="max-w-4xl mx-auto relative z-10 space-y-4">
          <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md hover:scale-105 transition-transform cursor-default">
            {t.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            {t.title}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium pt-2">
            {t.intro}
          </p>
        </ScrollReveal>
      </section>

      {/* Service Details with Enhanced Animations and Hover States */}
      {SERVICES.map((baseService, index) => {
        const service = localizeService(baseService, lang);
        const reversed = index % 2 !== 0;

        return (
          <section
            key={service.id}
            className={`py-20 sm:py-28 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} border-b border-gray-100/80`}
            id={service.id}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-16 items-center`}>

                {/* Content Column */}
                <ScrollReveal direction={side(reversed ? 'left' : 'right')} className="flex-1 space-y-6">
                  {/* Animated Icon Container */}
                  <div className="w-16 h-16 bg-red-50 text-[#C8202F] rounded-2xl flex items-center justify-center shadow-sm border border-red-100 hover:bg-[#C8202F] hover:text-white hover:scale-110 hover:rotate-3 transition-all duration-300">
                    {service.icon === 'Users' && <Users size={32} aria-hidden="true" />}
                    {service.icon === 'ClipboardCheck' && <ClipboardCheck size={32} aria-hidden="true" />}
                    {service.icon === 'TrendingUp' && <TrendingUp size={32} aria-hidden="true" />}
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
                    {service.title}
                  </h2>

                  <p className="text-gray-600 text-base leading-relaxed font-medium">
                    {service.description}
                  </p>

                  {/* Feature Cards Grid with Interactive Hovers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {service.points.map((point, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="w-6 h-6 rounded-full bg-red-100 text-[#C8202F] flex items-center justify-center group-hover:bg-[#C8202F] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                          <ChevronRight
                            size={14}
                            aria-hidden="true"
                            className="rtl:rotate-180 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Action Button */}
                  <div className="pt-4">
                    <Link
                      to={`/services/${service.id}`}
                      aria-label={t.learnMoreAbout(service.title)}
                      className="group inline-flex items-center gap-2.5 bg-[#171717] hover:bg-[#C8202F] text-white text-xs font-extrabold uppercase tracking-widest py-4 px-7 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-200"
                    >
                      <span>{t.learnMore}</span>
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="rtl:-scale-x-100 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300"
                      />
                    </Link>
                  </div>
                </ScrollReveal>

                {/* Interactive Image Showcase Column */}
                <ScrollReveal direction={side(reversed ? 'right' : 'left')} delay={0.15} className="flex-1 w-full">
                  <div className="group relative aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border-4 border-white transition-all duration-500">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    {/* Subtle Gradient Hover Overlay */}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </ScrollReveal>

              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Services;