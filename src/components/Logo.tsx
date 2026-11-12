import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", light = false }) => {
  return (
    <div className={`flex items-center gap-2.5 md:gap-3 select-none ${className}`}>
      {/* Logo Image */}
      <div className="relative shrink-0">
        <img 
          src="/images/logo/logo.webp" 
          alt="Onboarding 4 U Logo" 
          className="h-8 md:h-11 lg:h-12 w-auto object-contain transition-all duration-300"
        />
      </div>
      
      {/* Brand Name Text */}
      <div className="flex flex-col justify-center leading-tight">
        <span 
          className={`
            text-[13px] md:text-[16px] lg:text-[18px] font-black tracking-tighter transition-colors duration-300 whitespace-nowrap
            ${light ? 'text-white' : 'text-[#1F2937]'}
          `}
        >
          Onboarding
        </span>
        <span 
          className="text-[8px] md:text-[9.5px] lg:text-[10px] font-black text-[#C8202F] uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap"
        >
          4 u Consulting
        </span>
      </div>
    </div>
  );
};

export default Logo;