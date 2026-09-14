import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  variant?: 'default' | 'icon-only' | 'horizontal' | 'compact' | 'badge-only';
  className?: string;
  onClick?: () => void;
}

/**
 * Logotipo oficial MiGaraje - Ecosistema Automotriz
 * Basado fielmente en el diseño de casa/garaje hexagonal con silueta de automóvil
 * en tonalidades azul neón (#0095FF / #38BDF8 / #2563EB) y texto de alto contraste.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = false,
  badgeText = 'COLOMBIA',
  variant = 'default',
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const iconDimensions = {
    sm: { container: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { container: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { container: 'w-12 h-12', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { container: 'w-16 h-16', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
    '2xl': { container: 'w-24 h-24', text: 'text-4xl sm:text-5xl', sub: 'text-base' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Icon Graphic: House/Garage outline with car silhouette inside */}
      <div className={`relative ${iconDimensions.container} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Bright Neon Gradient for the House/Garage Roof & Frame */}
            <linearGradient id="garageNeonOutline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A6FF" />
              <stop offset="50%" stopColor="#0072FF" />
              <stop offset="100%" stopColor="#0051FF" />
            </linearGradient>

            {/* Cyan LED Headlights Gradient */}
            <linearGradient id="headlightsCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>

          {/* --- HOUSE / GARAGE CONTOUR (Hexagonal House Silhouette) --- */}
          <path
            d="M 100 28 
               L 165 70 
               Q 170 73 170 80 
               L 170 156 
               Q 170 168 158 168 
               L 42 168 
               Q 30 168 30 156 
               L 30 80 
               Q 30 73 35 70 
               Z"
            stroke="url(#garageNeonOutline)"
            strokeWidth="14"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* --- CAR CABIN / UPPER ROOF ARC --- */}
          <path
            d="M 68 116 
               C 74 88, 86 78, 100 78 
               C 114 78, 126 88, 132 116"
            stroke="#0f172a"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* --- CAR HOOD / MAIN HORIZONTAL BUMPER ARC --- */}
          <path
            d="M 52 148 
               C 50 134, 58 124, 76 120 
               C 88 118, 112 118, 124 120 
               C 142 124, 150 134, 148 148
               C 146 154, 140 154, 138 148
               C 134 136, 122 130, 100 130
               C 78 130, 66 136, 62 148
               C 60 154, 54 154, 52 148 Z"
            fill="#0091FF"
          />

          {/* --- LEFT LED HEADLIGHT --- */}
          <path
            d="M 58 146 Q 74 142 86 148 Q 74 152 58 146 Z"
            fill="url(#headlightsCyan)"
          />

          {/* --- RIGHT LED HEADLIGHT --- */}
          <path
            d="M 142 146 Q 126 142 114 148 Q 126 152 142 146 Z"
            fill="url(#headlightsCyan)"
          />
        </svg>
      </div>

      {/* Typography / Wordmark with High Contrast for Light/Friendly Theme */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`${iconDimensions.text} font-black tracking-tight flex items-center leading-none font-sans`}>
              <span className="text-slate-950">Mi</span>
              <span className="text-[#0084FF]">
                Garaje
              </span>
            </span>

            {showBadge && (
              <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badgeText}
              </span>
            )}
          </div>

          {showTagline && (
            <p className={`${iconDimensions.sub} text-slate-600 font-bold tracking-[0.18em] uppercase mt-0.5 leading-none`}>
              Ecosistema Automotriz
            </p>
          )}
        </div>
      )}
    </div>
  );
};
