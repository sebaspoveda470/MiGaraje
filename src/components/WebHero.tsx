import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Car,
  ShoppingBag,
  Users,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface WebHeroProps {
  listingsCount: number | null;
  onExploreVehicles: () => void;
  onExploreProducts: () => void;
  onRegisterCar: () => void;
}

export const WebHero: React.FC<WebHeroProps> = ({
  listingsCount,
  onExploreVehicles,
  onExploreProducts,
  onRegisterCar,
}) => {
  const handleExploreCars = onExploreVehicles;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 mb-8">
      
      {/* Top Architectural Banner */}
      <div className="relative flex flex-col justify-between p-5 sm:p-10 lg:p-14 overflow-hidden bg-slate-50 min-h-[420px] sm:min-h-[480px] lg:min-h-[500px]">
        
        {/* Subtle geometric grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Hero Background Vehicle Image */}
        <div className="absolute right-[-15%] bottom-[-5%] sm:right-[-5%] sm:bottom-[-2%] lg:right-[0%] lg:bottom-[0%] w-[85%] sm:w-[70%] lg:w-[58%] max-w-4xl pointer-events-none select-none z-0 opacity-40 sm:opacity-90 transition-opacity">
          <img 
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=85" 
            alt="Vehículo en estudio automotriz"
            className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Top Eyebrow Tag */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Plataforma Oficial MiGaraje</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
            COMPRA Y VENTA.
            <br />
            TU VEHÍCULO.
            <br />
            <span className="text-slate-800">TU GARAJE.</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-normal">
            La plataforma automotriz para comprar, vender y consentir tu vehículo con peritaje, productos oficiales MiGaraje y la comunidad de propietarios más activa.
          </p>
        </div>

        {/* CTA Button Group - Touch-first layout */}
        <div className="relative z-10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleExploreCars}
            className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer group min-h-[46px]"
          >
            <span>Ver Vehículos en Venta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onExploreProducts}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer min-h-[46px]"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Nuestros Productos</span>
          </button>

          <button
            onClick={onRegisterCar}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer min-h-[46px]"
          >
            <span>Registrar mi Carro</span>
          </button>
        </div>

      </div>

      {/* Metric Benchmarks Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-200 bg-white divide-x divide-y md:divide-y-0 divide-slate-100">
        
        <div className="p-3.5 sm:p-6 text-left">
          <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">{listingsCount ?? '…'}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Vehículos en Venta</div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">Publicados por propietarios en Colombia</div>
        </div>

        <div className="p-3.5 sm:p-6 text-left">
          <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">MiGaraje</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Productos Propios</div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">Venta directa por WhatsApp</div>
        </div>

        <div className="p-3.5 sm:p-6 text-left">
          <div className="text-xl sm:text-3xl font-black text-blue-600 tracking-tight">Directo</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Trato con el Vendedor</div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">Contacto por WhatsApp, sin comisiones</div>
        </div>

        <div className="p-3.5 sm:p-6 text-left">
          <div className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight">Clubes</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Mi Comunidad</div>
          <div className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">Clubes por marca y consultas técnicas</div>
        </div>

      </div>

    </section>
  );
};
