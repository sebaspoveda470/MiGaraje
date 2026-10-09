import React, { useEffect, useState } from 'react';

/**
 * "Tamaño de letra": lets people (older adults especially) enlarge every text on the site.
 * It scales the root font size, and the whole interface is sized in rem, so everything grows together.
 * The choice is remembered on the device; index.html applies it before the page paints.
 */
export type FontSize = 'normal' | 'grande' | 'muy-grande';

const STORAGE_KEY = 'migaraje_font_size';
// Keep in sync with the inline script in index.html
const SCALE: Record<FontSize, string> = { normal: '', grande: '112.5%', 'muy-grande': '125%' };

const OPTIONS: { id: FontSize; label: string; sample: string }[] = [
  { id: 'normal', label: 'Letra normal', sample: 'text-xs' },
  { id: 'grande', label: 'Letra grande', sample: 'text-sm' },
  { id: 'muy-grande', label: 'Letra muy grande', sample: 'text-base' },
];

function readSize(): FontSize {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'grande' || saved === 'muy-grande') return saved;
  } catch {
    // storage unavailable: normal size
  }
  return 'normal';
}

function applySize(size: FontSize) {
  document.documentElement.style.fontSize = SCALE[size];
  // Lets CSS tighten crowded spots (the phone header) while the text is enlarged
  if (size === 'normal') document.documentElement.removeAttribute('data-font-size');
  else document.documentElement.setAttribute('data-font-size', size);
  try {
    if (size === 'normal') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // convenience only
  }
  // Other copies of the control (top bar, footer) stay in step
  window.dispatchEvent(new CustomEvent('migaraje-font-size', { detail: size }));
}

export const FontSizeControl: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [size, setSize] = useState<FontSize>(readSize);

  useEffect(() => {
    const onChange = (e: Event) => setSize((e as CustomEvent<FontSize>).detail);
    window.addEventListener('migaraje-font-size', onChange);
    return () => window.removeEventListener('migaraje-font-size', onChange);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label="Tamaño de letra">
      <span className="text-xs font-semibold text-slate-600">Tamaño de letra</span>
      <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-200/70">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => applySize(option.id)}
            aria-pressed={size === option.id}
            aria-label={option.label}
            title={option.label}
            className={`w-8 h-7 rounded-full flex items-center justify-center font-bold leading-none cursor-pointer transition-colors ${option.sample} ${
              size === option.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            A
          </button>
        ))}
      </div>
    </div>
  );
};
