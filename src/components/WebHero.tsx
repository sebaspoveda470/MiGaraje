import React, { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Sparkles, Plus } from 'lucide-react';
import { prefersReducedMotion } from '../utils/scrollReveal';

interface WebHeroProps {
  listingsCount: number | null;
  onExploreVehicles: () => void;
  onExploreProducts: () => void;
  onRegisterCar: () => void;
}

// Frosted-glass surface used by the floating cards
const glass = 'bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-xl';

const HIGHLIGHTS = [
  { value: 'MiGaraje', title: 'Productos propios', detail: 'Venta directa por WhatsApp' },
  { value: 'Directo', title: 'Trato con el vendedor', detail: 'Sin comisiones ni intermediarios', accent: true },
  { value: 'Clubes', title: 'Mi Comunidad', detail: 'Clubes por marca y consultas técnicas' },
];

export const WebHero: React.FC<WebHeroProps> = ({ listingsCount, onExploreVehicles, onExploreProducts, onRegisterCar }) => {
  const photoRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  // Parallax: while scrolling past the hero the photo moves slower than the page
  // and the headline drifts and fades, which gives the section depth.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      const y = Math.min(window.scrollY, 800);
      if (photoRef.current) photoRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 + y * 0.00012})`;
      if (headlineRef.current) {
        headlineRef.current.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
        headlineRef.current.style.opacity = String(Math.max(0, 1 - y / 420));
      }
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
    <section className="mb-8 space-y-3 sm:space-y-4">
      <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-[#161a17] lg:min-h-[640px] flex flex-col">
        {/* Photo. It is vertical, so phones and tablets stack headline → photo → card, while computers
            show it on the right with a soft left fade (taller than the frame so the parallax never shows an edge). */}
        <div className="relative order-2 -mt-20 sm:-mt-28 lg:mt-0 lg:absolute lg:right-0 lg:-top-[4%] lg:h-[128%] lg:w-[60%] hero-settle pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_24%,black_88%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]">
          <img
            ref={photoRef}
            src="/hero-fj.jpg"
            alt="Toyota Land Cruiser FJ40 clásico con placa colombiana en las montañas"
            className="w-full h-auto lg:h-full object-cover object-[50%_62%] select-none will-change-transform"
          />
        </div>
        {/* Soft shading so the white headline reads on the bright sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/45 lg:from-black/30 lg:via-transparent lg:to-black/30 pointer-events-none" />

        {/* Headline */}
        <div ref={headlineRef} className="relative z-10 order-1 px-6 pt-10 sm:pt-16 lg:pt-24 lg:px-14 text-center lg:text-left lg:max-w-[58%] will-change-transform">
          <h1 className="text-[34px] leading-[1.05] sm:text-6xl xl:text-7xl font-semibold text-white tracking-[-0.03em] drop-shadow-sm">
            <span data-reveal className="inline-block" style={{ '--reveal-delay': '250ms' } as React.CSSProperties}>
              Todo para tu carro,
            </span>
            <br />
            <span data-reveal className="inline-block text-white/75" style={{ '--reveal-delay': '450ms' } as React.CSSProperties}>
              en un solo lugar.
            </span>
          </h1>
        </div>

        {/* Floating cards */}
        <div className="relative z-10 order-3 -mt-16 sm:-mt-24 lg:mt-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 lg:px-14 lg:pb-12">
          <div
            data-reveal
            style={{ '--reveal-delay': '700ms' } as React.CSSProperties}
            className={`${glass} rounded-3xl p-4 sm:p-6 w-full sm:max-w-md lg:max-w-none lg:w-[500px] lg:shrink-0`}
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Encuentra o publica tu carro</h2>
            <p className="hidden sm:block mt-1 text-sm text-slate-600 leading-relaxed">
              Compra y vende directo entre propietarios en toda Colombia, con productos MiGaraje y clubes por marca.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={onExploreVehicles}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-5 py-3 rounded-full transition-all cursor-pointer group whitespace-nowrap"
              >
                Ver vehículos en venta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onExploreProducts}
                className="flex items-center justify-center gap-2 bg-white/80 hover:bg-white active:scale-[0.98] text-slate-900 font-semibold text-sm px-5 py-3 rounded-full border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                Nuestros productos
              </button>
            </div>
            <button
              onClick={onRegisterCar}
              className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar mi carro en Mi Garaje
            </button>
          </div>

          <button
            onClick={onExploreVehicles}
            data-reveal
            style={{ '--reveal-delay': '850ms' } as React.CSSProperties}
            className={`${glass} hidden lg:flex rounded-3xl p-5 sm:p-6 items-end justify-between gap-6 text-left lg:w-72 lg:shrink-0 cursor-pointer group hover:bg-white/80 transition-colors`}
          >
            <div>
              <div className="text-5xl font-display font-semibold text-slate-900 leading-none">{listingsCount ?? '…'}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">Vehículos en venta</div>
              <div className="text-xs text-slate-500">Publicados por propietarios</div>
            </div>
            <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <button data-reveal onClick={onExploreVehicles} className="lg:hidden text-left bg-white rounded-3xl p-4 sm:p-6 shadow-xs cursor-pointer">
          <div className="text-2xl font-display font-semibold text-slate-900">{listingsCount ?? '…'}</div>
          <div className="text-xs font-semibold text-slate-900 mt-1">Vehículos en venta</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Publicados por propietarios</div>
        </button>
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} data-reveal className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className={`text-2xl sm:text-3xl font-display font-semibold ${h.accent ? 'text-blue-600' : 'text-slate-900'}`}>{h.value}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">{h.title}</div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{h.detail}</div>
          </div>
        ))}
        <div data-reveal className="hidden lg:block bg-white rounded-3xl p-6 shadow-xs">
          <div className="text-3xl font-display font-semibold text-slate-900">Gratis</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">Publicar tu carro</div>
          <div className="text-xs text-slate-500 mt-0.5">Sin costo y en minutos</div>
        </div>
      </div>
    </section>
  );
};
