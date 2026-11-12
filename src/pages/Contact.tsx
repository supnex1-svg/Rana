import React, { useRef, useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import { trackConversion } from '../lib/analytics';

// بيانات التواصل (لو عايزة تغيّريها في مكان واحد بس، انقليها لـ constants.ts)
const PHONES = [
  { display: '01007222422', tel: '+201007222422' },
  { display: '01003939499', tel: '+201003939499' },
];

const MAP_URL = 'https://maps.google.com/?q=30.105133,31.371695';

// السيرفر اللي بيستقبل الفورم ويبعته PDF على الإيميل
const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/contact`;

const TEXT = {
  en: {
    seoTitle: 'Contact Us | Onboarding 4U',
    seoDesc: "Get in touch with our senior advisors to start your consultation and elevate your pharmacy's performance.",
    badge: 'Get In Touch',
    title: 'Contact Our Advisory Team',
    intro:
      'We prefer direct communication with pharmacy owners and decision-makers to initiate immediate structural and on-ground assessments.',
    emailTitle: 'Email Address',
    phoneTitle: 'Direct Phone',
    call: 'Call',
    hqTitle: 'Headquarters',
    address: CONTACT_INFO.address,
    map: 'View on Google Maps',
    mapAria: 'Open Onboarding 4U location on Google Maps (opens in a new tab)',
    formEyebrow: 'Direct Inquiry',
    formTitle: 'Ready to Scale Your Pharmacy?',
    formText:
      'Fill out the form and our advisory team will get in touch immediately to discuss your audit requirements and baseline opportunities.',
    nameLabel: 'Full Name',
    namePh: 'e.g. Dr. Ahmed Mohamed',
    phoneLabel: 'Phone / WhatsApp Number',
    phonePh: '+20 100 000 0000',
    notesLabel: 'Pharmacy Name / Notes',
    notesPh: 'Share brief details about your pharmacy size or challenges',
    submit: 'Submit Request',
    sending: 'Sending...',
    successTitle: 'Message sent',
    success: 'Your message has been sent successfully. Our advisory team will contact you shortly.',
    refLabel: 'Reference number',
    again: 'Send another message',
    errorInvalid: 'Please check your name and phone number, then try again.',
    errorTooMany: 'Too many attempts. Please try again in a few minutes.',
    errorServer: 'We could not send your message right now. Please try again, or contact us by phone or WhatsApp.',
    errorNetwork: 'We could not reach the server. Please check your connection and try again.',
  },
  ar: {
    seoTitle: 'تواصل معنا | Onboarding 4U',
    seoDesc: 'تواصل مع مستشارينا الأوائل لبدء استشارتك والارتقاء بأداء صيدليتك.',
    badge: 'تواصل معنا',
    title: 'تواصل مع فريقنا الاستشاري',
    intro:
      'نفضّل التواصل المباشر مع أصحاب الصيدليات وصنّاع القرار لبدء تقييمات هيكلية وميدانية فورية.',
    emailTitle: 'البريد الإلكتروني',
    phoneTitle: 'الهاتف المباشر',
    call: 'اتصل بـ',
    hqTitle: 'المقر الرئيسي',
    address: 'القاهرة الجديدة، القاهرة، مصر',
    map: 'عرض على خرائط جوجل',
    mapAria: 'فتح موقع Onboarding 4U على خرائط جوجل (يفتح في تبويب جديد)',
    formEyebrow: 'استفسار مباشر',
    formTitle: 'جاهز لتنمية صيدليتك؟',
    formText:
      'املأ النموذج وسيتواصل معك فريقنا الاستشاري فورًا لمناقشة متطلبات التدقيق وفرص التحسين الأساسية.',
    nameLabel: 'الاسم بالكامل',
    namePh: 'مثال: د. أحمد محمد',
    phoneLabel: 'رقم الهاتف / واتساب',
    phonePh: '+20 100 000 0000',
    notesLabel: 'اسم الصيدلية / ملاحظات',
    notesPh: 'شاركنا نبذة عن حجم صيدليتك أو التحديات التي تواجهها',
    submit: 'إرسال الطلب',
    sending: 'جارٍ الإرسال...',
    successTitle: 'تم إرسال الرسالة',
    success: 'تم إرسال رسالتك بنجاح. سيتواصل معك فريقنا الاستشاري قريبًا.',
    refLabel: 'رقم المرجع',
    again: 'إرسال رسالة أخرى',
    errorInvalid: 'من فضلك راجع الاسم ورقم الهاتف ثم حاول مرة أخرى.',
    errorTooMany: 'محاولات كثيرة. حاول مرة أخرى بعد بضع دقائق.',
    errorServer: 'تعذّر إرسال رسالتك الآن. حاول مرة أخرى أو تواصل معنا هاتفيًا أو عبر واتساب.',
    errorNetwork: 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
  },
};

const EMPTY_FORM = { name: '', phone: '', notes: '' };

const Contact: React.FC = () => {
  const { lang } = useLanguage();
  const t = TEXT[lang];

  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null); // لو فيه قيمة يبقى الرسالة اتبعتت
  const honeypot = useRef<HTMLInputElement>(null); // حقل مخفي لصد البوتات

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, website: honeypot.current?.value ?? '' }),
      });
      if (!res.ok) {
        setError(res.status === 400 ? t.errorInvalid : res.status === 429 ? t.errorTooMany : t.errorServer);
        return;
      }
      const json: { id?: string } = await res.json().catch(() => ({}));
      setRefId(json.id || `CT-${Date.now().toString().slice(-8)}`);
      trackConversion('contact');
    } catch {
      setError(t.errorNetwork); // مشكلة اتصال: السيرفر مش شغّال أو النت قاطع
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setRefId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 leading-relaxed">
      <SEO title={t.seoTitle} description={t.seoDesc} />

      {/* Hero Section - Dark Theme for Top Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div aria-hidden="true" className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
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

      {/* Main Content & Info Cards */}
      <section className="py-20 sm:py-28 bg-white flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Contact Cards Grid: 3 كروت متساوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Email */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="group bg-gray-50 p-8 rounded-3xl border border-gray-200/80 text-center space-y-4 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1.5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-[#C8202F] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Mail size={26} aria-hidden="true" />
                </div>
                <h4 className="font-extrabold text-lg text-[#171717]">{t.emailTitle}</h4>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  dir="ltr"
                  className="text-[#C8202F] font-bold text-sm hover:underline inline-block py-2 break-all"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </ScrollReveal>

            {/* Phones */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="group bg-gray-50 p-8 rounded-3xl border border-gray-200/80 text-center space-y-4 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1.5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-[#171717] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Phone size={26} aria-hidden="true" />
                </div>
                <h4 className="font-extrabold text-lg text-[#171717]">{t.phoneTitle}</h4>
                <p className="flex flex-wrap items-center justify-center gap-x-2 text-gray-800 font-bold text-sm" dir="ltr">
                  {PHONES.map((p, i) => (
                    <React.Fragment key={p.tel}>
                      {i > 0 && <span aria-hidden="true" className="text-gray-400">|</span>}
                      <a
                        href={`tel:${p.tel}`}
                        aria-label={`${t.call} ${p.display}`}
                        className="hover:text-[#C8202F] hover:underline inline-block py-2"
                      >
                        {p.display}
                      </a>
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </ScrollReveal>

            {/* Location */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="group bg-gray-50 p-8 rounded-3xl border border-gray-200/80 text-center space-y-4 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1.5 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-[#C8202F] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <MapPin size={26} aria-hidden="true" />
                </div>
                <h4 className="font-extrabold text-lg text-[#171717]">{t.hqTitle}</h4>
                <address className="not-italic text-gray-700 text-xs sm:text-sm font-medium">
                  {t.address}
                </address>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.mapAria}
                  className="inline-flex items-center gap-1.5 text-[#C8202F] font-bold text-sm hover:underline py-2"
                >
                  <MapPin size={16} aria-hidden="true" />
                  <span>{t.map}</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Consultation Form Section */}
          <ScrollReveal direction="up" className="max-w-4xl mx-auto bg-[#171717] text-white p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-[#C8202F]/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[#C8202F] text-xs font-bold tracking-widest uppercase">{t.formEyebrow}</span>
                <h3 className="text-2xl sm:text-3xl font-black">{t.formTitle}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  {t.formText}
                </p>
              </div>

              <div className="lg:col-span-7 bg-white text-[#171717] p-6 sm:p-8 rounded-2xl shadow-inner">
                {refId ? (
                  <div className="text-center py-6 space-y-3" role="status">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={34} aria-hidden="true" />
                    </div>
                    <h4 className="font-extrabold text-lg text-[#171717]">{t.successTitle}</h4>
                    <p className="text-sm text-gray-600 font-medium">{t.success}</p>
                    <p className="inline-block bg-gray-100 text-xs font-bold text-[#171717] px-3 py-1.5 rounded-lg">
                      <span>{t.refLabel}: </span>
                      <span dir="ltr">{refId}</span>
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={reset}
                        className="border border-gray-300 text-gray-800 font-semibold text-sm px-5 py-3 rounded-xl min-h-[44px] hover:bg-gray-50 transition-colors"
                      >
                        {t.again}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* حقل فخ للبوتات: الزائر الحقيقي مش بيشوفه */}
                    <input
                      ref={honeypot}
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="sr-only"
                    />
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-gray-700 mb-1">{t.nameLabel}</label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder={t.namePh}
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full p-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8202F] focus:border-transparent transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold text-gray-700 mb-1">{t.phoneLabel}</label>
                      <input
                        id="contact-phone"
                        type="tel"
                        dir="ltr"
                        placeholder={t.phonePh}
                        required
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full p-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8202F] focus:border-transparent transition-all font-medium rtl:text-right"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-notes" className="block text-xs font-bold text-gray-700 mb-1">{t.notesLabel}</label>
                      <textarea
                        id="contact-notes"
                        placeholder={t.notesPh}
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        className="w-full p-3.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8202F] focus:border-transparent transition-all font-medium"
                      ></textarea>
                    </div>

                    {error && (
                      <p role="alert" className="bg-red-50 border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#C8202F] rounded-lg px-4 py-3 text-sm font-semibold text-[#C8202F]">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-[#C8202F] hover:bg-red-700 active:scale-98 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-200 uppercase tracking-wider disabled:opacity-70 disabled:cursor-wait"
                    >
                      {sending ? (
                        <>
                          <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                          <span>{t.sending}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.submit}</span>
                          <ArrowRight size={18} aria-hidden="true" className="rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>
    </div>
  );
};

export default Contact;