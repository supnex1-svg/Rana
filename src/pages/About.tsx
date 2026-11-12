import React from 'react';
import { Target, Eye, Award, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage, type Lang } from '../context/LanguageContext';

const en = {
  seoTitle: 'About Onboarding 4U | Pharmacy Retail Advisory & Management',
  seoDesc:
    "Learn about Onboarding 4U's mission to modernize pharmacy retail operations across Egypt and the MENA region.",
  badge: 'About Us',
  title: 'About Onboarding 4U',
  intro:
    'Founded in Cairo, Egypt, Onboarding 4U is a specialized pharmacy advisory and operations management firm dedicated to setting higher standards in pharmaceutical retail across Egypt and the Middle East.',
  approachEyebrow: 'Our Operational Approach',
  approachTitle: 'Domain Expertise & On-Ground Execution',
  p1: 'Pharmacy retail faces unique market pressures and intense competition. Pharmacy owners and regional chains require more than generic consulting advice—they need operational partners who understand stock turnover, team dynamics, deadstock reduction, and patient trust.',
  p2: 'At O4U, we focus on on-ground execution. We go beyond writing strategy reports to deliver tangible results reflected in daily operations, financial statements, and customer retention metrics.',
  stats: {
    pharmacies: 'Pharmacies Optimized',
    staff: 'Staff Members Trained',
    markets: 'Key Markets (Egypt & KSA)',
    support: 'Supervisory Support',
  },
  missionTitle: 'Our Mission',
  missionText:
    'To transition retail pharmacies from operational friction into organized systems, driving sustainable growth and higher profitability.',
  visionTitle: 'Our Vision',
  visionText:
    'Empowering independent pharmacies and regional chains to operate with transparency, scale, and long-term resilience.',
  valuesTitle: 'Core Values',
  values: [
    'On-ground Pharmacy Mindset',
    'Execution over Mere Advisory',
    'Operational Clarity & Systemization',
    'Long-term Partnerships & Accountability',
  ],
};

type AboutContent = typeof en;

const ar: AboutContent = {
  seoTitle: 'عن Onboarding 4U | استشارات وإدارة تجزئة الصيدليات',
  seoDesc:
    'تعرّف على رسالة Onboarding 4U في تحديث عمليات تجزئة الصيدليات في مصر ومنطقة الشرق الأوسط وشمال أفريقيا.',
  badge: 'من نحن',
  title: 'عن Onboarding 4U',
  intro:
    'تأسست Onboarding 4U في القاهرة بمصر، وهي شركة متخصصة في الاستشارات الصيدلانية وإدارة العمليات، تعمل على رفع معايير تجزئة الأدوية في مصر والشرق الأوسط.',
  approachEyebrow: 'نهجنا التشغيلي',
  approachTitle: 'خبرة في المجال وتنفيذ على أرض الواقع',
  p1: 'تواجه تجزئة الصيدليات ضغوطًا سوقية فريدة ومنافسة شديدة. يحتاج أصحاب الصيدليات والسلاسل الإقليمية إلى أكثر من نصائح استشارية عامة؛ إنهم يحتاجون إلى شركاء تشغيليين يفهمون دوران المخزون وديناميكيات الفريق وتقليل الأصناف الراكدة وثقة المرضى.',
  p2: 'في O4U نركّز على التنفيذ الميداني. لا نكتفي بكتابة تقارير الاستراتيجية، بل نحقق نتائج ملموسة تنعكس في العمليات اليومية والقوائم المالية ومؤشرات الاحتفاظ بالعملاء.',
  stats: {
    pharmacies: 'صيدلية تم تحسينها',
    staff: 'موظف تم تدريبهم',
    markets: 'أسواق رئيسية (مصر والسعودية)',
    support: 'دعم إشرافي',
  },
  missionTitle: 'رسالتنا',
  missionText:
    'نقل الصيدليات من الاحتكاك التشغيلي إلى أنظمة منظمة، لتحقيق نمو مستدام وربحية أعلى.',
  visionTitle: 'رؤيتنا',
  visionText:
    'تمكين الصيدليات المستقلة والسلاسل الإقليمية من العمل بشفافية وقدرة على التوسع ومرونة طويلة المدى.',
  valuesTitle: 'قيمنا الأساسية',
  values: [
    'عقلية صيدلانية ميدانية',
    'التنفيذ قبل الاستشارة المجردة',
    'وضوح تشغيلي وتحويل العمل إلى أنظمة',
    'شراكات طويلة المدى ومساءلة',
  ],
};

const content: Record<Lang, AboutContent> = { en, ar };

const About: React.FC = () => {
  const { lang, isRTL } = useLanguage();
  const t = content[lang];

  // في العربي بنعكس اتجاه دخول العناصر
  const side = (d: 'left' | 'right') => (isRTL ? (d === 'left' ? 'right' : 'left') : d);

  return (
    <div className="flex flex-col bg-white text-gray-900 leading-relaxed">
      <SEO title={t.seoTitle} description={t.seoDesc} />

      {/* Hero Section - Dark Theme for Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Radial Glow */}
        <div aria-hidden="true" className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md hover:scale-105 transition-transform cursor-default">
              {t.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium pt-2">
              {t.intro}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Philosophy & Stats Section */}
      <section className="py-20 sm:py-28 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">

            {/* Content Column */}
            <ScrollReveal direction={side('left')} className="space-y-6">
              <span className="text-xs font-extrabold text-[#C8202F] uppercase tracking-widest">
                {t.approachEyebrow}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
                {t.approachTitle}
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium text-base">{t.p1}</p>
              <p className="text-gray-600 leading-relaxed font-medium text-base">{t.p2}</p>
            </ScrollReveal>

            {/* Interactive Stats Cards Grid */}
            <ScrollReveal direction={side('right')} delay={0.15} className="grid grid-cols-2 gap-4">
              <div className="group bg-gray-50 border border-gray-200/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-center text-center shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300">
                <span dir="ltr" className="text-3xl sm:text-4xl font-black text-[#C8202F] mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                  +100
                </span>
                <span className="text-xs uppercase font-extrabold text-gray-800 tracking-wider">
                  {t.stats.pharmacies}
                </span>
              </div>

              <div className="group bg-[#171717] text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-center text-center shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <span dir="ltr" className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                  +5,000
                </span>
                <span className="text-xs uppercase font-extrabold opacity-80 tracking-wider">
                  {t.stats.staff}
                </span>
              </div>

              <div className="group bg-[#171717] text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-center text-center shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <span dir="ltr" className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                  2
                </span>
                <span className="text-xs uppercase font-extrabold opacity-80 tracking-wider">
                  {t.stats.markets}
                </span>
              </div>

              <div className="group bg-gray-50 border border-gray-200/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-center text-center shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300">
                <span dir="ltr" className="text-3xl sm:text-4xl font-black text-[#C8202F] mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                  24/7
                </span>
                <span className="text-xs uppercase font-extrabold text-gray-800 tracking-wider">
                  {t.stats.support}
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Pillars: Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="group p-8 border-t-4 border-[#C8202F] shadow-md hover:shadow-2xl rounded-b-2xl bg-white hover:-translate-y-1.5 transition-all duration-300 h-full border-x border-b border-gray-100">
                <div className="w-14 h-14 bg-red-50 text-[#C8202F] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#C8202F] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <Target size={30} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black mb-3 text-[#171717]">{t.missionTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">{t.missionText}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="group p-8 border-t-4 border-[#171717] shadow-md hover:shadow-2xl rounded-b-2xl bg-white hover:-translate-y-1.5 transition-all duration-300 h-full border-x border-b border-gray-100">
                <div className="w-14 h-14 bg-gray-100 text-[#171717] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#171717] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <Eye size={30} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black mb-3 text-[#171717]">{t.visionTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">{t.visionText}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="group p-8 border-t-4 border-[#C8202F] shadow-md hover:shadow-2xl rounded-b-2xl bg-white hover:-translate-y-1.5 transition-all duration-300 h-full border-x border-b border-gray-100">
                <div className="w-14 h-14 bg-red-50 text-[#C8202F] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#C8202F] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                  <Award size={30} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black mb-3 text-[#171717]">{t.valuesTitle}</h3>
                <ul className="text-gray-600 text-sm space-y-3 font-semibold">
                  {t.values.map((value) => (
                    <li key={value} className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} aria-hidden="true" className="text-[#C8202F] flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;