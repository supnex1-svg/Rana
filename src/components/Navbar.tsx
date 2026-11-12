import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Menu, X, ArrowRight, Home, Info, Briefcase, Handshake, MessageSquare, ClipboardCheck, Share2, Globe } from 'lucide-react';
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { navLabel } from '../i18n/navLabels';
import { NAV_LINKS, SOCIAL_LINKS } from '../constants';

const TEXT = {
  en: {
    requestAudit: 'Request Audit',
    requestPharmacyAudit: 'Request Pharmacy Audit',
    contactUs: 'Contact Us',
    openMenu: 'Open Menu',
    closeMenu: 'Close Menu',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
  },
  ar: {
    requestAudit: 'اطلب تدقيق',
    requestPharmacyAudit: 'اطلب تدقيق الصيدلية',
    contactUs: 'تواصل معنا',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    facebook: 'فيسبوك',
    linkedin: 'لينكدإن',
  },
};

const Navbar: React.FC = () => {
  const { lang, isRTL } = useLanguage();
  const t = TEXT[lang];

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  }, [location.pathname]);

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // القايمة بتفتح من اليمين في الإنجليزي ومن الشمال في العربي
  const offscreen = isRTL ? '-100%' : '100%';

  const drawerVariants: Variants = {
    closed: { 
      x: offscreen,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: { 
      x: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: isRTL ? -10 : 10 },
    open: { opacity: 1, x: 0 }
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home': return <Home size={18} />;
      case 'The Firm': return <Info size={18} />;
      case 'Strategic Services': return <Briefcase size={18} />;
      case 'Partnerships': return <Handshake size={18} />;
      case 'Consultation': return <MessageSquare size={18} />;
      default: return null;
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled || isOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex-shrink-0 relative z-[110]">
              <Logo className={`${isScrolled ? 'scale-90' : 'scale-100'} transform-gpu ltr:origin-left rtl:origin-right`} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-8 lg:gap-10 items-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-bold transition-all uppercase tracking-[0.15em] relative group ${
                    isActive(link.path) ? 'text-[#C8202F]' : 'text-[#171717] hover:text-[#C8202F]'
                  }`}
                >
                  {navLabel(link.label, lang)}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#C8202F] transform ltr:origin-left rtl:origin-right transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
              ))}

              {/* زرار تبديل اللغة */}
              <LanguageToggle />
              
              <Link
                to="/audit"
                className="bg-[#C8202F] text-white px-6 py-2.5 rounded-full text-[11px] font-black hover:bg-[#171717] transition-all shadow-md hover:shadow-red-500/20 uppercase tracking-wider flex items-center gap-2"
              >
                <ClipboardCheck size={15} />
                <span>{t.requestAudit}</span>
              </Link>
            </div>

            {/* Mobile: زرار اللغة + زرار القايمة */}
            <div className="md:hidden relative z-[110] flex items-center gap-2">
              <LanguageToggle className="px-3" />
              <button 
                onClick={toggleMenu} 
                className={`p-2 rounded-xl transition-all duration-300 active:scale-90 ${isOpen ? 'text-[#C8202F] bg-red-50' : 'text-[#171717] bg-transparent'}`}
                aria-label={isOpen ? t.closeMenu : t.openMenu}
              >
                {isOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="absolute top-0 ltr:right-0 rtl:left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex flex-col pt-24 px-6 pb-10 h-full overflow-y-auto">
                <div className="space-y-1 mb-6">
                  {NAV_LINKS.map((link) => (
                    <motion.div key={link.path} variants={itemVariants}>
                      <Link
                        to={link.path}
                        className={`text-lg font-black uppercase tracking-tighter flex items-center justify-between py-3.5 px-2 border-b border-gray-50 group active:bg-gray-50 transition-colors ${isActive(link.path) ? 'text-[#C8202F]' : 'text-[#171717]'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`p-2 rounded-lg transition-colors ${isActive(link.path) ? 'bg-red-100 text-[#C8202F]' : 'bg-gray-100 text-gray-400'}`}>
                            {getIcon(link.label)}
                          </span>
                          {navLabel(link.label, lang)}
                        </span>
                        <ArrowRight
                          size={18}
                          className={`rtl:rotate-180 transition-all duration-300 ${
                            isActive(link.path)
                              ? 'opacity-100 translate-x-0'
                              : 'opacity-0 ltr:-translate-x-2 rtl:translate-x-2'
                          }`}
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={itemVariants} className="space-y-3">
                  <Link
                    to="/audit"
                    className="w-full bg-[#C8202F] text-white py-3.5 rounded-xl text-center font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <ClipboardCheck size={16} />
                    <span>{t.requestPharmacyAudit}</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full bg-gray-100 text-[#171717] py-3 rounded-xl text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>{t.contactUs}</span>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-auto pt-8">
                  <div className="flex justify-center gap-5 mb-4">
                    <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#171717] active:bg-red-100 active:text-[#C8202F] transition-all" aria-label={t.facebook}>
                      <Globe size={18} />
                    </a>
                    <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-[#171717] active:bg-red-100 active:text-[#C8202F] transition-all" aria-label={t.linkedin}>
                      <Share2 size={18} />
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;