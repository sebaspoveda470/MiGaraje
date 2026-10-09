import React, { useId } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  variant?: 'default' | 'icon-only' | 'horizontal' | 'compact' | 'badge-only';
  /** "dark" = placed on a dark background (white "Mi" and tagline) */
  theme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

/**
 * The garage + car mark, traced from the official logo ("Logo MIGaraje (1).png").
 * Drawn on its own navy tile so the white roof and neon glow read on any background.
 * Coordinates are the official PNG's pixels (1254 × 1254).
 */
export const LogoMark: React.FC<{ className?: string; glow?: boolean }> = ({ className = '', glow = true }) => {
  const uid = useId().replace(/:/g, '');
  const tile = `tile-${uid}`;
  const house = `house-${uid}`;
  const neon = `neon-${uid}`;

  return (
    <svg viewBox="278 120 700 700" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06214f" />
          <stop offset="100%" stopColor="#020a1d" />
        </linearGradient>
        <linearGradient id={house} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2BB3FD" />
          <stop offset="100%" stopColor="#1E8BFB" />
        </linearGradient>
        <filter id={neon} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="278" y="120" width="700" height="700" rx="150" fill={`url(#${tile})`} />

      <g filter={glow ? `url(#${neon})` : undefined} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Garage */}
        <path
          d="M 372 405 L 628 262 L 879 405 L 879 650 Q 879 688 841 688 L 410 688 Q 372 688 372 650 Z"
          stroke={`url(#${house})`}
          strokeWidth="38"
        />
        {/* Roof of the car */}
        <path d="M 495 515 C 500 478, 522 434, 628 434 C 734 434, 756 478, 761 515" stroke="#F8FAFC" strokeWidth="21" />
        {/* Body / hood */}
        <path
          d="M 441 632 C 424 600, 424 562, 468 546 C 520 531, 580 531, 628 531 C 676 531, 736 531, 788 546 C 832 562, 832 600, 815 632"
          stroke="#228EFB"
          strokeWidth="31"
        />
        {/* Headlights */}
        <path d="M 448 589 L 526 599" stroke="#3CCBFE" strokeWidth="25" />
        <path d="M 808 589 L 730 599" stroke="#3CCBFE" strokeWidth="25" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = false,
  badgeText = 'COLOMBIA',
  variant = 'default',
  theme = 'light',
  className = '',
  onClick,
}) => {
  const dims = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', sub: 'text-[0.5625rem]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[0.625rem]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
    '2xl': { icon: 'w-24 h-24', text: 'text-4xl sm:text-5xl', sub: 'text-base' },
  }[size];

  const dark = theme === 'dark';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <LogoMark className={`${dims.icon} shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105`} />

      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`${dims.text} font-logo font-bold tracking-tight leading-none`}>
              <span className={dark ? 'text-white' : 'text-slate-950'}>Mi</span>
              <span className="text-[#1E8BFB]">Garaje</span>
            </span>
            {showBadge && (
              <span className="text-[0.5625rem] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badgeText}
              </span>
            )}
          </div>
          {showTagline && (
            <p className={`${dims.sub} font-logo font-medium tracking-[0.14em] mt-1 leading-none ${dark ? 'text-slate-200' : 'text-slate-500'}`}>
              Ecosistema Automotriz
            </p>
          )}
        </div>
      )}
    </div>
  );
};
