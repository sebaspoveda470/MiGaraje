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
 * en tonalidades azul neón (#0095FF / #38BDF8 / #2563EB) y texto blanco y celeste.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = false,
  badgeText = 'WEB',
  variant = 'default',
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const iconDimensions = {
    sm: { container: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { container: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { container: 'w-14 h-14', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { container: 'w-20 h-20', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
    '2xl': { container: 'w-28 h-28', text: 'text-4xl sm:text-5xl', sub: 'text-base' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Icon Graphic: House/Garage outline with car silhouette inside */}
      <div className={`relative ${iconDimensions.container} shrink-0 flex items-center justify-center`}>
        {/* Soft Radial Backlight Glow matching image smoke/atmosphere */}
        <div className="absolute inset-[-20%] bg-blue-500/25 rounded-full blur-xl group-hover:bg-blue-400/40 group-hover:scale-110 transition-all duration-300 pointer-events-none" />

        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,149,255,0.4)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Bright Neon Gradient for the House/Garage Roof & Frame */}
            <linearGradient id="garageNeonOutline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A6FF" />
              <stop offset="50%" stopColor="#0080FF" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>

            {/* Cyan LED Headlights Gradient */}
            <linearGradient id="headlightsCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>

            {/* Glowing filter for neon effect */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* --- HOUSE / GARAGE CONTOUR (Hexagonal House Silhouette) --- */}
          {/* Outer thick neon frame */}
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
            className="drop-shadow-[0_0_8px_rgba(0,166,255,0.6)]"
          />

          {/* --- CAR CABIN / UPPER ROOF ARC (White Arch) --- */}
          <path
            d="M 68 116 
               C 74 88, 86 78, 100 78 
               C 114 78, 126 88, 132 116"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          />

          {/* --- CAR HOOD / MAIN HORIZONTAL BUMPER ARC (Blue Wide Band) --- */}
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
            className="drop-shadow-[0_0_10px_rgba(0,145,255,0.7)]"
          />

          {/* --- LEFT LED HEADLIGHT (Sleek Cyan Pill) --- */}
          <path
            d="M 58 146 Q 74 142 86 148 Q 74 152 58 146 Z"
            fill="url(#headlightsCyan)"
            className="drop-shadow-[0_0_6px_#38BDF8]"
          />

          {/* --- RIGHT LED HEADLIGHT (Sleek Cyan Pill) --- */}
          <path
            d="M 142 146 Q 126 142 114 148 Q 126 152 142 146 Z"
            fill="url(#headlightsCyan)"
            className="drop-shadow-[0_0_6px_#38BDF8]"
          />
        </svg>
      </div>

      {/* Typography / Wordmark matching exactly the image typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          {/* Main Title Row: "MiGaraje" with Mi in white, Garaje in vibrant cyan/sky blue */}
          <div className="flex items-center gap-2">
            <span className={`${iconDimensions.text} font-black tracking-normal flex items-center leading-none font-sans`}>
              <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">Mi</span>
              <span className="text-[#1EB4FF] drop-shadow-[0_2px_12px_rgba(30,180,255,0.4)]">
                Garaje
              </span>
            </span>

            {showBadge && (
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-[#38BDF8] border border-blue-400/30 backdrop-blur-md">
                {badgeText}
              </span>
            )}
          </div>

          {/* Subtitle / Slogan: "Ecosistema Automotriz" in clean, tracked geometric white text */}
          {showTagline && (
            <p className={`${iconDimensions.sub} text-slate-300 font-light tracking-[0.22em] uppercase mt-1 leading-none drop-shadow-sm`}>
              Ecosistema Automotriz
            </p>
          )}
        </div>
      )}
    </div>
  );
};
