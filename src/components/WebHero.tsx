import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  Store, 
  ArrowRight, 
  Sparkles,
  Award,
  ChevronRight,
  Sparkle
} from 'lucide-react';

interface WebHeroProps {
  onExploreCatalog: () => void;
  onExploreStores: () => void;
  onAskAi: () => void;
  onRegisterCar: () => void;
  totalStoresCount?: number;
  totalPartsCount?: number;
}

export const WebHero: React.FC<WebHeroProps> = ({
  onExploreCatalog,
  onExploreStores,
  onAskAi,
  onRegisterCar,
  totalStoresCount = 24,
  totalPartsCount = 1200
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 mb-8">
      
      {/* Top Architectural Banner Inspired by Editorial Luxury Automotive Showcase */}
      <div className="relative min-h-[480px] lg:min-h-[520px] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-slate-50">
        
        {/* Subtle geometric grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Hero Background Studio Vehicle Image */}
        <div className="absolute right-[-8%] bottom-[-2%] lg:right-[0%] lg:bottom-[0%] w-[90%] sm:w-[70%] lg:w-[58%] max-w-4xl pointer-events-none select-none z-0">
          <img 
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85" 
            alt="Vehículo de alto rendimiento en estudio"
            className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Top Eyebrow Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Plataforma Oficial MiGaraje • Colombia</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-xl">
            PRECISIÓN.
            <br />
            GARANTÍA.
            <br />
            <span className="text-slate-800">TU GARAJE.</span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-normal">
            El ecosistema automotriz que conecta propietarios, almacenes certificados y peritaje técnico con garantía de entrega asegurada.
          </p>
        </div>

        {/* CTA Button Group - High Contrast Minimalist */}
        <div className="relative z-10 pt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onExploreCatalog}
            className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer group"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onExploreStores}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-slate-700" />
            <span>Almacenes Aliados</span>
          </button>

          <button
            onClick={onRegisterCar}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Registrar mi Auto</span>
          </button>
        </div>

      </div>

      {/* Metric Benchmarks Strip - Clean White High-Density Grid (Like Zenith spec strip) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-200 bg-white divide-x divide-slate-100">
        
        <div className="p-5 sm:p-6 text-left">
          <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">+{totalStoresCount}</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Almacenes Verificados</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Bogotá, Medellín, Cali & nacional</div>
        </div>

        <div className="p-5 sm:p-6 text-left">
          <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">+{totalPartsCount}</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Repuestos & Partes</div>
          <div className="text-[11px] text-slate-600 mt-0.5">OEM y marcas líderes europeas y asiáticas</div>
        </div>

        <div className="p-5 sm:p-6 text-left">
          <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">100%</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Garantía Protegida</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Retención de fondos hasta verificar tu pieza</div>
        </div>

        <div className="p-5 sm:p-6 text-left">
          <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">IA 24/7</div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Peritaje Digital</div>
          <div className="text-[11px] text-slate-600 mt-0.5">Compatibilidad de chasís & mantenimiento</div>
        </div>

      </div>

    </section>
  );
};
