"use client";

import React, { useState } from 'react';
import { Mountain, Flame } from 'lucide-react';

interface SummitLogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export const SummitLogo: React.FC<SummitLogoProps> = ({ className = '', size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);

  // Reference the newly copied local public asset for high-performance instant load
  const logoPath = "/guy-logo.jpg";

  const sizeClasses = size === 'lg' 
    ? 'w-32 h-32 rounded-2xl object-cover' 
    : 'w-16 h-16 rounded-xl object-cover';

  if (imgError) {
    // Elegant, premium golden mountain peak emblem fallback if loading has any issue
    return (
      <div className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden group ${sizeClasses} ${className}`}>
        <Mountain className={`${size === 'lg' ? 'h-14 w-14' : 'h-8 w-8'} text-amber-400 animate-pulse`} />
        {size === 'lg' && (
          <div className="flex items-center gap-1 mt-1 text-[9px] font-black tracking-widest text-amber-400/80 font-mono">
            <Flame className="h-3 w-3 text-amber-500" /> APEX
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      alt="GUYS Summit Logo"
      className={`${sizeClasses} ${className}`}
      onError={() => {
        console.warn("Summit logo failed to load, switching to high-contrast golden emblem.");
        setImgError(true);
      }}
    />
  );
};

export default SummitLogo;