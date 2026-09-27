import React from 'react';

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
 * Soft colored light behind a section's title that fades into the page background.
 * Place it first inside a `relative isolate` container.
 */
export const SectionGlow: React.FC<{ tone: SectionTone }> = ({ tone }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -z-10 -top-16 sm:-top-24 -inset-x-8 sm:-inset-x-24 h-[420px] sm:h-[560px] [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    style={{ background: GLOWS[tone] }}
  />
);

/** Header photo, computers only (phones keep the title and buttons within reach). */
export const SectionPhoto: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div
    data-reveal="zoom"
    className="hidden lg:block lg:col-start-2 lg:row-start-1 lg:row-span-2 self-stretch min-h-[240px] rounded-[2rem] overflow-hidden shadow-lg"
  >
    <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
  </div>
);

/** Header layout: text and buttons on the left, photo on the right (computers). */
export const sectionHeaderClass =
  'px-1 sm:px-2 pt-2 sm:pt-6 flex flex-col items-start gap-4 sm:gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-x-12 lg:gap-y-6 lg:items-center';
