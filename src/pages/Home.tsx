import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Phone, Mail, ArrowRight, ClipboardCheck } from 'lucide-react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import Preloader from '../components/Preloader';
import ImageCarousel from '../components/ImageCarousel';
import { useLanguage, type Lang } from '../context/LanguageContext';

const PRELOADER_KEY = 'o4u-preloader-seen';

// هل اللودينج اتعرض قبل كده في الجلسة دي؟
const hasSeenPreloader = () => {
  try {
    return sessionStorage.getItem(PRELOADER_KEY) === '1';
  } catch {
    return false; // لو المتصفح مانع التخزين، نعرض اللودينج عادي
  }
};

const markPreloaderSeen = () => {
  try {
    sessionStorage.setItem(PRELOADER_KEY, '1');
  } catch {
    /* تجاهل */
  }
};

// ============ النصوص بالإنجليزي والعربي ============
const en = {
  seoTitle: 'O4U | Specialized Pharmacy Management & Performance Improvement',
  seoDesc:
    'Onboarding 4U helps pharmacy owners optimize operations, maximize profitability, and elevate team performance.',
  hero: {
    badge: 'Onboarding 4U (O4U)',
    title: 'Your Pharmacy Deserves More Than Just Standard Advice.',
    text: 'We empower pharmacy owners to optimize operations, enhance staff productivity, scale marketing, and boost profitability through structured auditing and hands-on execution.',
    ctaAudit: 'Request Pharmacy Audit',
    ctaServices: 'Explore Services',
    imgAlt: 'Pharmacy Management',
  },
  challenges: {
    eyebrow: 'Key Challenges',
    title: 'What Problems Do We Solve for Pharmacies?',
    items: [
      'Declining net and gross profit margins across retail operations.',
      'Lack of stock control, inefficient purchasing, and deadstock buildup.',
      'Unstructured or chaotic daily operational routines.',
      'Underperforming pharmacy staff lacking accountability & clear KPIs.',
      'Ineffective marketing strategies and low customer retention rates.',
      'Difficulty maintaining quality standards across multiple branches.',
    ],
  },
  method: {
    eyebrow: 'Our Methodology',
    title: 'How We Work Step by Step',
    steps: [
      { step: '01', title: '1. Pharmacy Audit', desc: 'Evaluating current financial & operational metrics.' },
      { step: '02', title: '2. Gap Analysis', desc: 'Identifying bottlenecks and performance leakages.' },
      { step: '03', title: '3. Actionable Plan', desc: 'Building structured roadmaps with target deadlines.' },
      { step: '04', title: '4. Execution & Training', desc: 'On-ground training & Standard Operating Procedures.' },
      { step: '05', title: '5. KPI Monitoring', desc: 'Tracking continuous sales growth & benchmark success.' },
    ],
  },
  pillars: {
    eyebrow: 'Core Pillars',
    title: 'Four Pillars of Pharmacy Growth',
    items: [
      { id: 'operations', title: 'Operations Management', desc: 'SOPs, Inventory Control, Purchasing Optimization & Profit Margin Analysis.' },
      { id: 'marketing', title: 'Marketing & Growth', desc: 'Local Retail Marketing, Google Business Optimization & Loyalty Programs.' },
      { id: 'hr', title: 'Human Resources (HR)', desc: 'Recruitment, Job Descriptions, Incentive Systems & Staff Training.' },
      { id: 'quality', title: 'Quality & Excellence', desc: 'Quality Standards, KPI Frameworks, Executive Reporting & Multi-branch Standardization.' },
    ],
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'Our Work in Pictures',
    text: 'A look at our campaigns, our team, and the pharmacies we work with.',
    label: 'Onboarding 4U posters',
  },
  videos: {
    eyebrow: 'Videos',
    title: 'Watch Our Videos',
    titles: ['Onboarding 4U video 1', 'Onboarding 4U video 2'],
    fallback: 'Your browser does not support the video tag.',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions',
    items: [
      {
        q: 'Is Onboarding 4U a digital marketing agency or a pharmacy advisory firm?',
        a: 'We are an all-in-one outsourced management team dedicated to pharmacies. We go beyond marketing by fixing operational workflows, inventory turnover, staff development, HR, and quality assurance to guarantee sustainable profits.',
      },
      {
        q: 'What is a Pharmacy Audit and how does it work?',
        a: 'A Pharmacy Audit is an in-depth operational and financial evaluation of your pharmacy. All you need to do is share key operational data under a Non-Disclosure Agreement (NDA), and our team will handle the full diagnosis and present an actionable roadmap.',
      },
      {
        q: 'Is O4U suitable for single independent pharmacies or chains only?',
        a: 'We tailor our solutions for independent pharmacies (1–3 locations) as well as growing regional chains, adapting the implementation strategy to your pharmacy size and market dynamics.',
      },
      {
        q: 'How long does it take to see tangible performance improvements?',
        a: 'Operational discipline and measurable performance improvements typically become visible within the first 30 to 60 days following roadmap execution, team training, and KPI deployment.',
      },
    ],
  },
  contact: {
    eyebrow: 'Direct Contact',
    title: 'Ready to Elevate Your Pharmacy?',
    text: 'Submit your information and our senior advisory team will contact you for an initial assessment and audit procedure outline.',
    nameLabel: 'Full Name',
    namePh: 'e.g. Dr. Ahmed Mohamed',
    phoneLabel: 'Phone / WhatsApp Number',
    phonePh: '+20 100 000 0000',
    notesLabel: 'Pharmacy Name / Notes',
    notesPh: 'Tell us about your pharmacy size and challenges',
    submit: 'Submit Request',
    success: 'Your request has been sent successfully. Our team will reach out shortly.',
  },
};

type HomeContent = typeof en;

const ar: HomeContent = {
  seoTitle: 'O4U | إدارة الصيدليات المتخصصة وتحسين الأداء',
  seoDesc:
    'تساعد Onboarding 4U أصحاب الصيدليات على تحسين العمليات وتعظيم الأرباح ورفع أداء الفريق.',
  hero: {
    badge: 'Onboarding 4U (O4U)',
    title: 'صيدليتك تستحق أكثر من مجرد نصائح تقليدية.',
    text: 'نمكّن أصحاب الصيدليات من تحسين العمليات ورفع إنتاجية الفريق وتوسيع التسويق وزيادة الأرباح، من خلال التدقيق المنظم والتنفيذ العملي على أرض الواقع.',
    ctaAudit: 'اطلب تدقيق الصيدلية',
    ctaServices: 'استكشف خدماتنا',
    imgAlt: 'إدارة الصيدليات',
  },
  challenges: {
    eyebrow: 'أبرز التحديات',
    title: 'ما المشكلات التي نحلّها للصيدليات؟',
    items: [
      'تراجع هوامش الربح الإجمالي والصافي في عمليات البيع بالتجزئة.',
      'ضعف التحكم في المخزون، وعدم كفاءة المشتريات، وتراكم الأصناف الراكدة.',
      'روتين تشغيلي يومي غير منظم أو عشوائي.',
      'فريق عمل ضعيف الأداء يفتقر إلى المساءلة ومؤشرات الأداء الواضحة.',
      'استراتيجيات تسويق غير فعّالة وانخفاض معدل الاحتفاظ بالعملاء.',
      'صعوبة الحفاظ على معايير الجودة عبر الفروع المتعددة.',
    ],
  },
  method: {
    eyebrow: 'منهجيتنا',
    title: 'كيف نعمل خطوة بخطوة',
    steps: [
      { step: '01', title: '1. تدقيق الصيدلية', desc: 'تقييم المؤشرات المالية والتشغيلية الحالية.' },
      { step: '02', title: '2. تحليل الفجوات', desc: 'تحديد نقاط الاختناق ومواضع تسرّب الأداء.' },
      { step: '03', title: '3. خطة عمل', desc: 'بناء خارطة طريق منظمة بمواعيد مستهدفة.' },
      { step: '04', title: '4. التنفيذ والتدريب', desc: 'تدريب ميداني وإجراءات تشغيل قياسية (SOPs).' },
      { step: '05', title: '5. متابعة المؤشرات', desc: 'تتبع نمو المبيعات ونجاح المقارنات المرجعية بشكل مستمر.' },
    ],
  },
  pillars: {
    eyebrow: 'الركائز الأساسية',
    title: 'أربع ركائز لنمو الصيدلية',
    items: [
      { id: 'operations', title: 'إدارة العمليات', desc: 'إجراءات التشغيل القياسية، التحكم في المخزون، تحسين المشتريات وتحليل هوامش الربح.' },
      { id: 'marketing', title: 'التسويق والنمو', desc: 'التسويق المحلي للتجزئة، تحسين النشاط على Google وبرامج الولاء.' },
      { id: 'hr', title: 'الموارد البشرية', desc: 'التوظيف، الأوصاف الوظيفية، أنظمة الحوافز وتدريب الموظفين.' },
      { id: 'quality', title: 'الجودة والتميّز', desc: 'معايير الجودة، أطر مؤشرات الأداء، التقارير التنفيذية وتوحيد المعايير بين الفروع.' },
    ],
  },
  gallery: {
    eyebrow: 'المعرض',
    title: 'أعمالنا بالصور',
    text: 'نظرة على حملاتنا وفريقنا والصيدليات التي نعمل معها.',
    label: 'بوسترات Onboarding 4U',
  },
  videos: {
    eyebrow: 'فيديوهات',
    title: 'شاهد فيديوهاتنا',
    titles: ['فيديو Onboarding 4U رقم 1', 'فيديو Onboarding 4U رقم 2'],
    fallback: 'متصفحك لا يدعم تشغيل الفيديو.',
  },
  faq: {
    eyebrow: 'الأسئلة الشائعة',
    title: 'الأسئلة المتكررة',
    items: [
      {
        q: 'هل Onboarding 4U شركة تسويق رقمي أم شركة استشارات للصيدليات؟',
        a: 'نحن فريق إدارة متكامل بنظام الإسناد الخارجي مخصص للصيدليات. نتجاوز التسويق إلى إصلاح سير العمل التشغيلي، ودوران المخزون، وتطوير الموظفين، والموارد البشرية، وضمان الجودة لتحقيق أرباح مستدامة.',
      },
      {
        q: 'ما هو تدقيق الصيدلية وكيف يتم؟',
        a: 'تدقيق الصيدلية هو تقييم تشغيلي ومالي معمّق لصيدليتك. كل ما عليك هو مشاركة بيانات التشغيل الأساسية بموجب اتفاقية عدم إفصاح (NDA)، وسيتولى فريقنا التشخيص الكامل ويقدّم لك خارطة طريق قابلة للتنفيذ.',
      },
      {
        q: 'هل O4U مناسبة للصيدليات المستقلة الفردية أم للسلاسل فقط؟',
        a: 'نصمّم حلولنا للصيدليات المستقلة (من 1 إلى 3 فروع) وكذلك للسلاسل الإقليمية النامية، مع تكييف استراتيجية التنفيذ وفق حجم صيدليتك وديناميكيات السوق.',
      },
      {
        q: 'كم يستغرق ظهور تحسّن ملموس في الأداء؟',
        a: 'يظهر الانضباط التشغيلي وتحسّن الأداء القابل للقياس عادةً خلال أول 30 إلى 60 يومًا من تنفيذ خارطة الطريق وتدريب الفريق وتطبيق مؤشرات الأداء.',
      },
    ],
  },
  contact: {
    eyebrow: 'تواصل مباشر',
    title: 'جاهز للارتقاء بصيدليتك؟',
    text: 'أرسل بياناتك وسيتواصل معك فريقنا الاستشاري الأول لإجراء تقييم مبدئي وتوضيح خطوات التدقيق.',
    nameLabel: 'الاسم بالكامل',
    namePh: 'مثال: د. أحمد محمد',
    phoneLabel: 'رقم الهاتف / واتساب',
    phonePh: '+20 100 000 0000',
    notesLabel: 'اسم الصيدلية / ملاحظات',
    notesPh: 'أخبرنا عن حجم صيدليتك وتحدياتها',
    submit: 'إرسال الطلب',
    success: 'تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريبًا.',
  },
};

const content: Record<Lang, HomeContent> = { en, ar };

// البوسترات: public/images/posters/photo_N_2026-11-01_19-44-28.jpg
// n = رقم الصورة في اسم الملف. غيّري الترتيب أو شيلي أو ضيفي سطر (زي n: 17) براحتك.
const POSTER_STAMP = '2026-11-01_19-44-28';
const POSTERS = [
  { n: 1, en: 'Poster: we increase your sales and bring back your customers, with a list of services including landing page, media buying, offers magazine, ABC analysis and reactivation of 1000 customers', ar: 'بوستر: بنزود مبيعاتك وبنرجع عملائك، مع قائمة خدمات تشمل صفحة هبوط وشراء إعلانات ومجلة عروض وتحليل ABC وإعادة تنشيط 1000 عميل' },
  { n: 2, en: 'Poster: ready to take your pharmacy to a new level of success, with a pharmacy storefront and a growth chart', ar: 'بوستر: جاهز تنقل صيدليتك لمستوى نجاح جديد، صيدلية ورسم بياني للنمو' },
  { n: 3, en: 'Poster: OTC customers are the key to increasing your sales, shown as a glowing OTC puzzle piece', ar: 'بوستر: عميل OTC مفتاح زيادة مبيعاتك، قطعة أحجية مضيئة' },
  { n: 4, en: 'Poster: creative ways to display products attractively inside your pharmacy, with a glass display cabinet of skincare products', ar: 'بوستر: طرق مبتكرة لعرض المنتجات بشكل جذاب داخل صيدليتك، فاترينة زجاجية لمنتجات العناية بالبشرة' },
  { n: 5, en: 'Poster: what our clients say about us, with customer reviews around a presenter holding a microphone', ar: 'بوستر: ده اللي بيقوله عملاؤنا، آراء العملاء حول مقدّم يحمل ميكروفونًا' },
  { n: 6, en: 'Poster: we build your presence on social media, with a list of services including strategic plan, designs, reels and videos', ar: 'بوستر: بنبني كيانك على السوشيال ميديا، خدمات تشمل خطة استراتيجية وتصميمات وريلز وفيديوهات' },
  { n: 7, en: 'Poster: we run your pharmacy on the ground and analyze your numbers, including visual merchandising, offline prints and monthly reports', ar: 'بوستر: بندير صيدليتك على الأرض وبنحلل أرقامك، تشمل العرض المرئي للمنتجات والمطبوعات والتقارير الشهرية' },
  { n: 8, en: 'Poster: we are not a marketing company, with a presenter holding a comprehensive guide to managing your pharmacies', ar: 'بوستر: احنا مش شركة تسويق، مقدّم يحمل الدليل الشامل لإدارة الصيدليات' },
  { n: 9, en: 'Poster: joint cooperation between Onboarding 4U and Jamal Pharmacy, with two illuminated towers and a business meeting', ar: 'بوستر: التعاون المشترك بين Onboarding 4U ومؤسسة جمال الدين بن عبدالله للأدوية' },
  { n: 10, en: 'Poster: the difference is not in the pharmacy, it is in marketing, comparing an empty shelf pharmacy with a busy modern pharmacy', ar: 'بوستر: الفرق مش في الصيدلية الفرق في التسويق، مقارنة بين صيدلية فارغة وأخرى مزدحمة' },
  { n: 11, en: 'Poster: ready to take your pharmacy to a new level? Book your free consultation now', ar: 'بوستر: جاهز تنقل صيدليتك لمستوى جديد؟ احجز استشارتك المجانية الآن' },
  { n: 12, en: 'Poster: Onboarding 4U team, one voice and one vision, with the team members inside the company logo', ar: 'بوستر: فريق Onboarding 4U، صوت واحد ورؤية واحدة' },
  { n: 13, en: 'Poster: you are not alone, with the founder in front of pharmacy storefronts and a list of support services', ar: 'بوستر: انت مش لوحدك، واجهات صيدليات وقائمة خدمات الدعم' },
  { n: 14, en: 'Poster: guess our location, announcing the new Onboarding 4U headquarters coming soon', ar: 'بوستر: خمّن موقعنا، إعلان عن المقر الجديد لـ Onboarding 4U قريبًا' },
  { n: 15, en: 'Poster: a new branch, a new story, with the founder in front of a pharmacy branch', ar: 'بوستر: فرع جديد قصة جديدة، أمام فرع صيدلية' },
  { n: 16, en: 'Poster: one voice, one vision, with the founder and the team and a list of consulting services', ar: 'بوستر: صوت واحد ورؤية واحدة، مع الفريق وقائمة خدمات الاستشارات' },
  { n: 18, en: 'Poster: save thousands of pounds and reduce waste in your pharmacy inventory, with the founder holding an inventory optimization report', ar: 'بوستر: وفّر آلاف الجنيهات وقلل الهدر في مخزون صيدليتك، تقرير تحسين المخزون' },
  { n: 19, en: 'Poster: 5 main trends will shape the future of pharmacies in Egypt, with a silhouette of a man standing on glowing stairs', ar: 'بوستر: 5 اتجاهات رئيسية ستشكل مستقبل الصيدليات في مصر، ظل رجل يقف على درج مضيء' },
  { n: 20, en: 'Poster: 5 main trends will shape the future of pharmacies in Egypt, with a hand pressing the number 5 on a glowing keypad', ar: 'بوستر: 5 اتجاهات رئيسية ستشكل مستقبل الصيدليات في مصر، يد تضغط الرقم 5 على لوحة مفاتيح مضيئة' },
  { n: 21, en: 'Poster: no pharmacist means no business, showing customers waiting in a pharmacy with no pharmacist at the counter', ar: 'بوستر: مفيش صيادلة مفيش شغل، عملاء ينتظرون في صيدلية بلا صيدلي' },
  { n: 22, en: 'Poster: Ramadan greeting from Dr. Mohamed Al-Jumeiy to the pharmacy community, shown as a caricature holding a lantern next to a cannon', ar: 'بوستر: تهنئة رمضان من د. محمد الجميعي للصيدلة والأمة الإسلامية، شخصية كاريكاتورية بفانوس بجانب مدفع' },
  { n: 23, en: 'Poster: cooperation toward success between Onboarding 4U and Sherif Pharmacy, with a handshake over a meeting table', ar: 'بوستر: تعاون نحو النجاح بين Onboarding 4U وصيدلية شريف، مصافحة فوق طاولة اجتماعات' },
  { n: 24, en: 'Poster: expanding without a decision means losses without excuses, showing a pharmacy collapsing as an owner is carried on a stretcher', ar: 'بوستر: التوسع من غير قرار خسارة من غير أعذار، صيدلية تنهار ومالك على نقالة' },
  { n: 25, en: 'Poster: training without systems and management wastes money and causes losses, showing a man reading a newspaper with an Onboarding dashboard', ar: 'بوستر: التدريب بدون أنظمة وإدارة مضيعة فلوس وخسارة، رجل يقرأ جريدة بلوحة Onboarding' },
  { n: 26, en: 'Poster: the solution is not a new branch, it is a new problem and a threat, showing a smiling manager while his team panics in a glass office', ar: 'بوستر: الحل مش فرع جديد دي مشكلة جديدة وتهديد، مدير مبتسم وفريقه يصرخ في مكتب زجاجي' },
  { n: 27, en: 'Poster: once Ahmed is absent the customer will not come, showing a manager receiving a resignation letter from an employee', ar: 'بوستر: أول ما أحمد يغيب العميلة مش هتجيب، مدير يتسلم استقالة موظف' },
  { n: 28, en: 'Poster: once control slips it is impossible to stay on top, showing a stressed manager with his head in his hands over financial reports', ar: 'بوستر: أول ما السيطرة تهتز مستحيل تكمل في العز، مدير يضع رأسه بين يديه فوق تقارير مالية' },
  { n: 29, en: 'Poster: defining success, discover it in 3 levels, with a dart flying toward a target', ar: 'بوستر: تحديد النجاح، اكتشفه في 3 مستويات، سهم يندفع نحو هدف' },
];

// الفيديوهات: public/videos/ (الاسم لازم يطابق الملف بالظبط، حروف كبيرة وصغيرة)
// ضيفي أو شيلي سطر براحتك. وصف كل فيديو في content.videos.titles بنفس الترتيب.
const VIDEOS = [
  { src: '/videos/IMG_9717.MP4' },
  { src: '/videos/IMG_9718.MP4' },
];

export const Home: React.FC = () => {
  const { lang } = useLanguage();
  const c = content[lang];

  // اللودينج بيظهر بس لو ده أول فتح في الجلسة
  const [isLoading, setIsLoading] = useState(() => !hasSeenPreloader());
  // لو اللودينج اتخطّى، الـ Hero يبدأ جاهز علطول
  const [heroReady, setHeroReady] = useState(() => hasSeenPreloader());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const posterImages = POSTERS.map((p) => ({
    src: `/images/posters/photo_${p.n}_${POSTER_STAMP}.jpg`,
    alt: p[lang],
  }));

  const handlePreloaderComplete = useCallback(() => {
    markPreloaderSeen(); // نسجّل إنه اتعرض
    setIsLoading(false);
  }, []);

  // أول ما البخار يبدأ يتبدد: أنيميشن الـ Hero يشتغل قدام المستخدم
  const handleReveal = useCallback(() => {
    setHeroReady(true);
  }, []);

  // قفل الاسكرول أثناء ظهور شاشة التحميل
  useEffect(() => {
    if (isLoading) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isLoading]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* شاشة التحميل: بتظهر أول مرة بس في الجلسة (portal على body) وبتتشال بعد ما تخلص */}
      {isLoading && (
        <Preloader onComplete={handlePreloaderComplete} onReveal={handleReveal} />
      )}

      <div className="flex flex-col bg-white text-gray-900 leading-relaxed">
        <SEO title={c.seoTitle} description={c.seoDesc} />

        {/* Hero Section - Dark Theme for Header Contrast */}
        <section className="bg-[#171717] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
            <img
              src="/images/Home/hero.webp"
              alt={c.hero.imgAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#171717] via-[#171717]/90 to-[#171717]/70 z-0"></div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">

            {/* الـ key بيخلي الأنيميشن يتعاد لما البخار يبدأ يتبدد */}
            <ScrollReveal
              key={heroReady ? 'hero-left-on' : 'hero-left-wait'}
              direction="left"
              className="w-full lg:w-1/2 space-y-6"
            >
              <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
                {c.hero.badge}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
                {c.hero.title}
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                {c.hero.text}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link
                  to="/audit"
                  className="w-full sm:w-auto text-center bg-[#C8202F] hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-500/40 outline-none"
                >
                  <ClipboardCheck size={20} aria-hidden="true" />
                  <span>{c.hero.ctaAudit}</span>
                </Link>
                <a
                  href="#services"
                  className="w-full sm:w-auto text-center border-2 border-white text-white hover:bg-white hover:text-[#171717] font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-sm focus:ring-4 focus:ring-gray-300 outline-none"
                >
                  {c.hero.ctaServices}
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal
              key={heroReady ? 'hero-right-on' : 'hero-right-wait'}
              direction="right"
              delay={0.2}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 group">
                <img
                  src="/images/posters/photo_29_2026-11-01_19-44-28.jpg"
                  alt={c.hero.imgAlt}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* Challenges Section */}
        <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.challenges.eyebrow}</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">{c.challenges.title}</h3>
          </ScrollReveal>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.challenges.items.map((challenge, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-start gap-4">
                  <span aria-hidden="true" className="w-9 h-9 rounded-full bg-red-100 text-[#C8202F] font-black flex items-center justify-center flex-shrink-0 text-lg">
                    !
                  </span>
                  <p className="text-gray-800 text-sm font-semibold leading-relaxed pt-1">{challenge}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-100">
          <ScrollReveal direction="up" className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.method.eyebrow}</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#171717]">{c.method.title}</h3>
          </ScrollReveal>

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {c.method.steps.map((item, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center space-y-3 hover:bg-white hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
                  <span className="text-3xl font-black text-[#C8202F] group-hover:scale-110 inline-block transition-transform duration-300">{item.step}</span>
                  <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Four Pillars */}
        <section className="py-20 bg-[#171717] text-white px-4 sm:px-6 lg:px-8" id="services">
          <ScrollReveal direction="up" className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.pillars.eyebrow}</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold">{c.pillars.title}</h3>
          </ScrollReveal>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {c.pillars.items.map((pillar, idx) => (
              <ScrollReveal key={pillar.id} direction="up" delay={idx * 0.1}>
                <Link to={`/services/${pillar.id}`} className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-4 hover:border-[#C8202F] hover:-translate-y-2 transition-all duration-300 block group h-full">
                  <div aria-hidden="true" className="w-12 h-12 bg-[#C8202F] rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    {idx + 1}
                  </div>
                  <h4 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{pillar.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{pillar.desc}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 bg-white px-4 sm:px-6 lg:px-8" id="gallery" aria-labelledby="gallery-title">
          <ScrollReveal direction="up" className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.gallery.eyebrow}</h2>
            <h3 id="gallery-title" className="text-3xl sm:text-4xl font-extrabold text-[#171717]">
              {c.gallery.title}
            </h3>
            <p className="mt-3 text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
              {c.gallery.text}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" className="max-w-7xl mx-auto sm:px-4">
            <ImageCarousel
              label={c.gallery.label}
              images={posterImages}
              aspectClass="aspect-square"
              hoverZoom={false}
              loop
            />
          </ScrollReveal>
        </section>

        {/* Videos Section */}
        <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8" id="videos" aria-labelledby="videos-title">
          <ScrollReveal direction="up" className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.videos.eyebrow}</h2>
            <h3 id="videos-title" className="text-3xl sm:text-4xl font-extrabold text-[#171717]">
              {c.videos.title}
            </h3>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
            {VIDEOS.map((video, idx) => (
              <ScrollReveal key={video.src} direction="up" delay={idx * 0.1} className="w-full max-w-xs">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-lg">
                  <video
                    src={`${video.src}#t=0.1`}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={c.videos.titles[idx] ?? c.videos.titles[0]}
                    className="w-full h-full object-contain"
                  >
                    {c.videos.fallback}
                  </video>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-xs font-bold text-[#C8202F] uppercase tracking-widest mb-2">{c.faq.eyebrow}</h2>
            <h3 className="text-3xl font-extrabold text-[#171717]">{c.faq.title}</h3>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-4">
            {c.faq.items.map((faq, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.05}>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaq === idx}
                    className="w-full p-5 text-left rtl:text-right font-bold text-[#171717] flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8202F]"
                  >
                    <span className="text-base">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={20} aria-hidden="true" className="text-[#C8202F] flex-shrink-0" /> : <ChevronDown size={20} aria-hidden="true" className="flex-shrink-0" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-5 pt-0 text-sm text-gray-700 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

      

      </div>
    </>
  );
};

export default Home;