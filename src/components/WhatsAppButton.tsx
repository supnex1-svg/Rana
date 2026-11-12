import React, { useState } from 'react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = "+201003939499",
  message = "مرحباً، أود الاستفسار عن خدمات Onboarding 4U"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 dir-rtl">
      {/* Tooltip Indication */}
      <div
        className={`bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all duration-300 pointer-events-none ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
        role="tooltip"
      >
        تحدث معنا عبر واتساب
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع فريق Onboarding 4U عبر الواتساب"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl hover:bg-[#20ba5a] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Subtle Ripple Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:animate-none pointer-events-none" />

        {/* Correct Solid WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 fill-white transition-transform duration-300 group-hover:scale-110 relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zM12.04 20.1c-1.42 0-2.81-.38-4.03-1.1l-.29-.17-3.03.8.81-2.95-.19-.31c-.79-1.28-1.21-2.77-1.21-4.29 0-4.47 3.64-8.11 8.11-8.11 2.17 0 4.2 0.85 5.73 2.38 1.53 1.53 2.38 3.56 2.38 5.73 0 4.47-3.64 8.11-8.11 8.11zm4.46-6.04c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.47-.4-.41-.54-.42l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.33.98 2.49.12.16 1.7 2.59 4.12 3.63.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
        </svg>
      </a>
    </div>
  );
};

export default WhatsAppButton;