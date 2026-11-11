import React from 'react';
import kyneraMark from '../assets/kynera-mark.svg';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'compact';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8 sm:h-9 sm:w-9',
    lg: 'h-9 w-9 sm:h-10 sm:w-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-[22px]',
    lg: 'text-2xl sm:text-[26px]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={kyneraMark}
        alt="Kynera mark"
        className={`${iconSizes[size]} object-contain flex-shrink-0`}
      />

      {variant === 'full' && (
        <span
          className={`${textSizes[size]} font-extrabold font-heading tracking-tight leading-none text-brand-navy`}
        >
          Ky<span className="text-brand-blue">nera</span>
        </span>
      )}
    </div>
  );
};
