import React from 'react';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-left bg-white text-gray-900 leading-relaxed dir-ltr">
      <SEO 
        title="Privacy Policy | Onboarding 4U" 
        description="Privacy policy and data protection guidelines for Onboarding 4U pharmacy consulting and management services."
      />

      {/* Hero Section - Dark Theme for Header Contrast */}
      <section className="bg-[#171717] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C8202F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <span className="bg-[#C8202F] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase inline-block shadow-md">
              Data Security & Privacy
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium pt-2">
              Learn how Onboarding 4U collects, utilizes, and protects your operational and personal data with complete confidentiality.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 sm:py-28 bg-white flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="space-y-10 text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
              
              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">01</span>
                  Introduction
                </h2>
                <p>
                  Onboarding 4U ("we", "us", or "our") is strictly committed to safeguarding the privacy and confidentiality of our clients and website visitors. This Privacy Policy outlines how we collect, process, and protect information when you visit our website or engage our pharmacy management services.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">02</span>
                  Data We Collect
                </h2>
                <p>
                  We may collect personal and operational information provided directly by you, including:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-600 font-medium">
                  <li>Full name, phone/WhatsApp number, and email address when requesting an audit or consultation.</li>
                  <li>Pharmacy name, chain brand, branch count, and geographic region.</li>
                  <li>On-ground operational, financial, and inventory data shared under Non-Disclosure Agreements (NDAs).</li>
                </ul>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">03</span>
                  How We Use Your Information
                </h2>
                <p>
                  The collected information is strictly utilized for the following operational purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-600 font-medium">
                  <li>Delivering, executing, and evaluating pharmacy audit roadmaps and management services.</li>
                  <li>Communicating directly with pharmacy owners to coordinate initial consultations and site visits.</li>
                  <li>Optimizing website performance and overall user experience.</li>
                </ul>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">04</span>
                  Data Security & Confidentiality
                </h2>
                <p>
                  We enforce stringent technical and organizational security protocols to ensure your pharmacy’s financial statements and operational data remain safe from unauthorized access or disclosure. We do not sell, lease, or share client data with third parties for commercial marketing.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">05</span>
                  Regional Compliance
                </h2>
                <p>
                  Our data processing practices adhere to applicable personal data protection laws in the Arab Republic of Egypt and the Kingdom of Saudi Arabia.
                </p>
              </section>

              <section className="space-y-3 p-6 sm:p-8 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-[#171717] flex items-center gap-3">
                  <span className="text-xs bg-[#C8202F] text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold">06</span>
                  Contact Us
                </h2>
                <p>
                  For any inquiries or concerns regarding this Privacy Policy, feel free to contact us via email at: <a href="mailto:info@onboarding4u.com" className="text-[#C8202F] font-bold hover:underline">info@onboarding4u.com</a>.
                </p>
              </section>

            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;