import React from 'react';
import { ArrowRight, ArrowUpRight, Sparkles, Plus } from 'lucide-react';

interface WebHeroProps {
  listingsCount: number | null;
  onExploreVehicles: () => void;
  onExploreProducts: () => void;
  onRegisterCar: () => void;
}

// Frosted-glass surface used by the floating cards
const glass = 'bg-white/80 backdrop-blur-2xlbackdrop-saturate-150 border border-white/60 shadow-xl';

const HIGHLIGHTS = [
  { value: 'MiGaraje', title: 'Productos propios', detail: 'Venta directa por WhatsApp' },
  { value: 'Directo', title: 'Trato con el vendedor', detail: 'Sin comisiones ni intermediarios', accent: true },
  { value: 'Clubes', title: 'Mi Comunidad', detail: 'Clubes por marca y consultas técnicas' },
];

export const WebHero: React.FC<WebHeroProps> = ({ listingsCount, onExploreVehicles, onExploreProducts, onRegisterCar }) => {
  return (
    <section className="mb-8 space-y-3 sm:space-y-4">
      <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-slate-900 min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] flex flex-col">
        {/* Photo */}
        <img
          src="/hero-garaje.jpg"
          alt="Carro con placa colombiana estacionado dentro de un garaje"
          className="absolute inset-0 w-full h-full object-cover object-[50%_70%] select-none pointer-events-none"
        />
        {/* Soft shading so the white headline reads on the bright wall */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/45 pointer-events-none" />

        {/* Headline */}
        <div className="relative z-10 px-6 pt-10 sm:pt-16 lg:pt-20 text-center">
          <h1 className="text-[34px] leading-[1.05] sm:text-6xl lg:text-7xl font-semibold text-white tracking-[-0.03em] drop-shadow-sm">
            Todo para tu carro,
            <br />
            <span className="text-white/75">en un solo lugar.</span>
          </h1>
</div>

        {/* Floating cards */}
        <div className="relative z-10 mt-auto p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row-reverse items-stretch lg:items-end justify-between gap-3">
          <div className={`${glass} rounded-3xl p-4 sm:p-6 w-full sm:max-w-md lg:max-w-none lg:w-[500px] lg:shrink-0`}>
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
            className={`${glass} hidden lg:flex rounded-3xl p-5 sm:p-6 items-end justify-between gap-6 text-left lg:w-72 lg:shrink-0 cursor-pointer group hover:bg-white/80 transition-colors`}
          >
            <div>
              <div className="text-5xl font-semibold text-slate-900 tracking-tight leading-none">{listingsCount ?? '…'}</div>
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
        <button onClick={onExploreVehicles} className="lg:hidden text-left bg-white rounded-3xl p-4 sm:p-6 shadow-xs cursor-pointer">
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">{listingsCount ?? '…'}</div>
          <div className="text-xs font-semibold text-slate-900 mt-1">Vehículos en venta</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Publicados por propietarios</div>
        </button>
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className={`text-2xl sm:text-3xl font-semibold tracking-tight ${h.accent ? 'text-blue-600' : 'text-slate-900'}`}>{h.value}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">{h.title}</div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{h.detail}</div>
          </div>
        ))}
        <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-xs">
          <div className="text-3xl font-semibold tracking-tight text-slate-900">Gratis</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">Publicar tu carro</div>
          <div className="text-xs text-slate-500 mt-0.5">Sin costo y en minutos</div>
        </div>
      </div>
    </section>
  );
};
