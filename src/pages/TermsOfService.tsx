import React from 'react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';

const TermsOfService: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-left bg-white text-gray-900 leading-relaxed dir-ltr">
      <SEO 
        title="Terms of Service | Onboarding 4U" 
        description="Terms and conditions governing the use of the Onboarding 4U website and specialized consulting services."
      />

      {/* Hero Section - Dark Theme for Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
              Legal Agreement
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium pt-2">
              Please read these terms and conditions carefully before exploring and using the Onboarding 4U website and consulting platform.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 sm:py-28 bg-white flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="space-y-12 text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
              
              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">01</span>
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing and using the Onboarding 4U website, you agree to comply with and be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, please refrain from using this site.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">02</span>
                  Consulting Services
                </h2>
                <p>
                  All on-ground operational and advisory services provided by Onboarding 4U are governed by formal Master Service Agreements (MSAs) signed separately between the company and the client. Content displayed on the website is for informational and guidance purposes only.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">03</span>
                  Intellectual Property
                </h2>
                <p>
                  All materials, texts, designs, organizational frameworks, and logos displayed on this website are the exclusive property of Onboarding 4U and are protected by international copyright and intellectual property laws. Unauthorized use or reproduction is strictly prohibited.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">04</span>
                  Limitation of Liability
                </h2>
                <p>
                  While we strive to provide accurate and updated information on the website, Onboarding 4U assumes no liability or responsibility for any inadvertent errors or damages arising from the use of materials available on this platform.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">05</span>
                  Governing Law
                </h2>
                <p>
                  These Terms of Service are governed by and construed in accordance with the laws and regulations applicable in the Arab Republic of Egypt and the Kingdom of Saudi Arabia, and competent courts shall have jurisdiction over any disputes arising therefrom.
                </p>
              </section>

            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;