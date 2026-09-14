import React from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  Car, 
  Bot, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Search,
  Sparkles,
  ShoppingBag,
  Award
} from 'lucide-react';
import { Logo } from './Logo';

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
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950 to-blue-950/40 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-2xl">
      {/* Background Neon Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* Trust pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>El portal web automotriz con compra segura y tiendas verificadas</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
        </div>

        {/* Hero Central Branding Graphic */}
        <div className="py-2">
          <Logo size="2xl" showTagline={true} showBadge={false} />
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight">
          Compra repuestos originales, cotiza con tiendas aliadas y cuida tu vehículo con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">
            Inteligencia Artificial
          </span>
        </h1>

        {/* Value Proposition Description */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
          Acceso libre para propietarios, talleres y entusiastas. Encuentra autopartes con compatibilidad asegurada, garantía con retención de fondos y diagnóstico preventivo.
        </p>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full sm:w-auto">
          <button
            onClick={onExploreCatalog}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 border border-blue-400/40 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Explorar Catálogo de Repuestos</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreStores}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Directorio de Tiendas Aliadas</span>
          </button>

          <button
            onClick={onAskAi}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl border border-purple-400/30 backdrop-blur-md transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-sky-400" />
            <span>Consultar Mecánico IA</span>
          </button>
        </div>

        {/* Live Metrics / Features Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 w-full text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Store className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Almacenes Aliados</span>
            </div>
            <div className="text-lg font-black text-white">+{totalStoresCount} Tiendas</div>
            <div className="text-[11px] text-slate-400">Verificadas con NIT & garantía</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Pago en Custodia</span>
            </div>
            <div className="text-lg font-black text-white">100% Protegido</div>
            <div className="text-[11px] text-slate-400">Liberación tras recibir conforme</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Autos Clásicos</span>
            </div>
            <div className="text-lg font-black text-white">Placas Antiguo</div>
            <div className="text-[11px] text-slate-400">Restauración y peritaje</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold text-white">Asesor IA 24/7</span>
            </div>
            <div className="text-lg font-black text-white">Gemini 2.5</div>
            <div className="text-[11px] text-slate-400">Diagnóstico de fallas y códigos</div>
          </div>
        </div>

      </div>
    </section>
  );
};
