import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICES } from '../constants';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage, type Lang } from '../context/LanguageContext';
import { localizeService } from '../i18n/services';

const en = {
  back: 'Back to All Practice Areas',
  badge: 'Specialized Core Pillar',
  frameworkTitle: 'Strategic Execution & Framework',
  ctaTitle: 'Ready to Implement This Pillar in Your Pharmacy?',
  ctaText:
    'Connect with us today or request a full pharmacy audit to build a tailored operational roadmap that maximizes profitability and standardizes execution.',
  ctaAudit: 'Request Pharmacy Audit',
  ctaContact: 'Contact Advisory Team',
};

type PillarContent = typeof en;

const ar: PillarContent = {
  back: 'العودة إلى كل مجالات الخبرة',
  badge: 'ركيزة أساسية متخصصة',
  frameworkTitle: 'التنفيذ الاستراتيجي والإطار',
  ctaTitle: 'جاهز لتطبيق هذه الركيزة في صيدليتك؟',
  ctaText:
    'تواصل معنا اليوم أو اطلب تدقيقًا كاملًا للصيدلية لبناء خارطة طريق تشغيلية مخصصة تعظّم الربحية وتوحّد التنفيذ.',
  ctaAudit: 'اطلب تدقيق الصيدلية',
  ctaContact: 'تواصل مع الفريق الاستشاري',
};

const content: Record<Lang, PillarContent> = { en, ar };

const PillarDetail: React.FC = () => {
  const { lang, isRTL } = useLanguage();
  const t = content[lang];
  const side = (d: 'left' | 'right') => (isRTL ? (d === 'left' ? 'right' : 'left') : d);

  const { pillarId } = useParams<{ pillarId: string }>();
  const baseService = SERVICES.find((s) => s.id === pillarId) || SERVICES[0];
  const service = localizeService(baseService, lang);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 leading-relaxed">
      <SEO title={`${service.title} | Onboarding 4U`} description={service.description} />

      {/* Hero Section - Dark Theme for Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div aria-hidden="true" className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="space-y-4">
            <div className="mb-4">
              <Link
                to="/services"
                className="text-xs font-extrabold text-[#C8202F] hover:text-white transition-colors flex items-center gap-1.5 inline-flex uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
              >
                <ArrowLeft size={14} aria-hidden="true" className="rtl:rotate-180" /> {t.back}
              </Link>
            </div>
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
              {t.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              {service.title}
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content Details */}
      <section className="py-20 sm:py-28 bg-white flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            {/* Text & Points Column */}
            <ScrollReveal direction={side('right')} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
                {t.frameworkTitle}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                {service.description}
              </p>

              <div className="space-y-3.5 pt-4">
                {service.points.map((point, idx) => (
                  <div key={idx} className="group flex items-center gap-3.5 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300">
                    <CheckCircle2 size={20} aria-hidden="true" className="text-[#C8202F] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">{point}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Image Showcase Column */}
            <ScrollReveal direction={side('left')} delay={0.15}>
              <div className="group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border-4 border-white aspect-[4/3] relative bg-gray-100 transition-all duration-500">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Call to Action Banner */}
          <ScrollReveal direction="up" className="bg-[#171717] text-white p-10 sm:p-16 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-[#C8202F]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                {t.ctaTitle}
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                {t.ctaText}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <Link
                  to="/audit"
                  className="bg-[#C8202F] hover:bg-red-700 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>{t.ctaAudit}</span>
                  <ArrowRight size={18} aria-hidden="true" className="rtl:rotate-180" />
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white hover:bg-white hover:text-[#171717] text-white font-extrabold py-4 px-8 rounded-xl transition-all duration-300 shadow-sm text-sm uppercase tracking-wider flex items-center justify-center"
                >
                  {t.ctaContact}
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
};

export default PillarDetail;