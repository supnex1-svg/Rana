import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { navLabel } from '../i18n/navLabels';
import { NAV_LINKS, CONTACT_INFO, SOCIAL_LINKS } from '../constants';

const TEXT = {
  en: {
    about:
      'A specialized firm in pharmacy management and operational performance across Egypt and the Middle East, driving efficiency and profitability.',
    quickLinks: 'Quick Links',
    requestAudit: 'Request Pharmacy Audit',
    pillarsTitle: 'Core Pillars',
    pillars: ['Operations Management', 'Marketing & Growth', 'Human Resources (HR)', 'Quality & Excellence'],
    contactTitle: 'Contact Info',
    address: CONTACT_INFO.address,
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
  },
  ar: {
    about:
      'شركة متخصصة في إدارة الصيدليات والأداء التشغيلي في مصر والشرق الأوسط، تعمل على رفع الكفاءة والربحية.',
    quickLinks: 'روابط سريعة',
    requestAudit: 'اطلب تدقيق الصيدلية',
    pillarsTitle: 'الركائز الأساسية',
    pillars: ['إدارة العمليات', 'التسويق والنمو', 'الموارد البشرية', 'الجودة والتميّز'],
    contactTitle: 'معلومات التواصل',
    address: 'القاهرة الجديدة، القاهرة، مصر',
    rights: 'جميع الحقوق محفوظة.',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    facebook: 'فيسبوك',
    linkedin: 'لينكدإن',
  },
};

const PILLAR_PATHS = ['/services/operations', '/services/marketing', '/services/hr', '/services/quality'];

const Footer: React.FC = () => {
  const { lang } = useLanguage();
  const t = TEXT[lang];

  return (
    <footer className="bg-[#171717] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1">
            <Logo light={true} className="mb-6" />
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs font-medium">
              {t.about}
            </p>
            <div className="flex gap-3">
              <a 
                href={SOCIAL_LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#C8202F] hover:text-white transition-all shadow-sm"
                aria-label={t.facebook}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href={SOCIAL_LINKS.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#C8202F] hover:text-white transition-all shadow-sm"
                aria-label={t.linkedin}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-widest">{t.quickLinks}</h4>
            <ul className="space-y-3 font-medium">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-[#C8202F] transition-colors text-sm">
                    {navLabel(link.label, lang)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/audit" className="text-[#C8202F] font-bold hover:underline transition-colors text-sm">
                  {t.requestAudit}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-widest">{t.pillarsTitle}</h4>
            <ul className="space-y-3 font-medium">
              {PILLAR_PATHS.map((path, i) => (
                <li key={path}>
                  <Link to={path} className="text-gray-400 hover:text-[#C8202F] transition-colors text-sm">
                    {t.pillars[i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-6 text-xs uppercase tracking-widest">{t.contactTitle}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={18} className="text-[#C8202F] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">{t.address}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={18} className="text-[#C8202F] shrink-0" aria-hidden="true" />
                <span dir="ltr">{CONTACT_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={18} className="text-[#C8202F] shrink-0" aria-hidden="true" />
                <span dir="ltr">{CONTACT_INFO.email}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-bold tracking-wider">
          <p>© {new Date().getFullYear()} Onboarding 4U. {t.rights}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-[#C8202F] transition-colors">{t.privacy}</Link>
            <Link to="/terms" className="hover:text-[#C8202F] transition-colors">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;