"use client";

import React, { useState } from 'react';
import { Mountain, Flame } from 'lucide-react';

interface SummitLogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export const SummitLogo: React.FC<SummitLogoProps> = ({ className = '', size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);

  // We try multiple paths in order of resolution priority
  const logoPaths = [
    "/.dyad/media/e6f0780907527e4724dd172ac8ed48e2cdda2b3bf8b6f3cb0747f3ec3126d399.jpg",
    "https://www.dyad.sh/favicon.ico", // tertiary fallback
  ];

  const sizeClasses = size === 'lg' 
    ? 'w-32 h-32 rounded-3xl border-2 shadow-2xl' 
    : 'w-16 h-16 rounded-2xl border-2 shadow-lg';

  if (imgError) {
    // Elegant, premium golden mountain peak emblem fallback if the dynamic system asset path is blocked
    return (
      <div className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-amber-400/80 flex flex-col items-center justify-center relative overflow-hidden group ${sizeClasses} ${className}`}>
        <div className="absolute inset-0 bg-amber-400/5 group-hover:bg-amber-400/10 transition-all duration-300" />
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
      src={logoPaths[0]}
      alt="GUYS Summit Logo"
      className={`${sizeClasses} border-amber-400/80 object-cover ${className}`}
      onError={() => {
        console.warn("Summit logo failed to load from primary path, switching to high-contrast golden emblem.");
        setImgError(true);
      }}
    />
  );
};

export default SummitLogo;