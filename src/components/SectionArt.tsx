import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../utils/scrollReveal';

export type SectionTone = 'vehiculos' | 'productos' | 'comunidad';

// Brand blue plus one accent per section: WhatsApp green for orders, a warm tone for the clubs
const GLOWS: Record<SectionTone, string> = {
  vehiculos:
    'radial-gradient(38% 60% at 12% 30%, rgb(26 140 255 / 0.32), transparent 70%), radial-gradient(34% 55% at 82% 12%, rgb(79 166 255 / 0.28), transparent 70%)',
  productos:
    'radial-gradient(38% 60% at 12% 30%, rgb(26 140 255 / 0.28), transparent 70%), radial-gradient(34% 55% at 82% 12%, rgb(16 185 129 / 0.26), transparent 70%)',
  comunidad:
    'radial-gradient(38% 60% at 12% 30%, rgb(26 140 255 / 0.28), transparent 70%), radial-gradient(34% 55% at 82% 12%, rgb(251 176 64 / 0.3), transparent 70%)',
};

/**
 * Soft colored light behind a section's header that fades into the page background.
 * Place it first inside a `relative isolate` container.
 */
export const SectionGlow: React.FC<{ tone: SectionTone }> = ({ tone }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -z-10 -top-16 sm:-top-24 -inset-x-8 sm:-inset-x-24 h-[420px] sm:h-[620px] [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    style={{ background: GLOWS[tone] }}
  />
);

/** Frosted-glass card for the header's buttons (same surface as the home page cards) */
export const heroGlassClass =
  'bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-xl rounded-3xl p-3 sm:p-4';

interface SectionHeroProps {
  image: string;
  alt: string;
  /** Where the photo is anchored when it's cropped (CSS object-position) */
  focus?: string;
  children: React.ReactNode;
}

/**
 * Section header in the home page style: full photo with a slow parallax, the title in white
 * over a dark fade, and the buttons in a glass card (children decide the content).
 */
export const SectionHero: React.FC<SectionHeroProps> = ({ image, alt, focus = '50% 60%', children }) => {
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      const y = Math.min(window.scrollY, 700);
      if (photoRef.current) photoRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 + y * 0.00012})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-slate-900 min-h-[360px] sm:min-h-[440px] lg:min-h-[480px] flex flex-col justify-end">
      <div className="absolute inset-x-0 -top-[6%] h-[125%] hero-settle pointer-events-none">
        <img
          ref={photoRef}
          src={image}
          alt={alt}
          className="w-full h-full object-cover select-none will-change-transform"
          style={{ objectPosition: focus }}
        />
      </div>
      {/* Dark fade from the bottom-left so the white title reads on any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 lg:bg-gradient-to-tr lg:from-black/90 lg:via-black/55 lg:to-transparent pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-8 lg:p-12 flex flex-col items-stretch sm:items-start gap-4 sm:gap-5 lg:max-w-[62%] text-white">
        {children}
      </div>
    </div>
  );
};
