import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wrench, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Car, 
  ChevronRight, 
  RefreshCw, 
  Crown, 
  Fuel, 
  Gauge, 
  ShoppingBag, 
  Users, 
  Info,
  Plus,
  Edit3,
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Vehicle, SparePart, CareProduct, VehicleInsight, CartItem } from '../types';
import { getClientVehicleInsights } from '../services/geminiClientService';

interface SmartRecommendationsProps {
  activeVehicle: Vehicle | null;
  onOpenAddVehicleModal: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  spareParts: SparePart[];
  careProducts: CareProduct[];
  onAddToCart: (item: CartItem) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenPartDetail: (part: SparePart) => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  activeVehicle,
  onOpenAddVehicleModal,
  onEditVehicle,
  spareParts,
  careProducts,
  onAddToCart,
  onNavigateToTab,
  onOpenPartDetail,
}) => {
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<VehicleInsight | null>(null);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  // Fetch or generate AI recommendations when activeVehicle changes
  const fetchAiInsights = async () => {
    if (!activeVehicle) return;
    setLoadingAi(true);
    setErrorAi(null);

    try {
      const res = await fetch('/api/gemini/vehicle-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: activeVehicle.brand,
          model: activeVehicle.model,
          year: activeVehicle.year,
          mileage: activeVehicle.mileage,
          transmission: activeVehicle.transmission,
          fuelType: activeVehicle.fuelType,
          issues: activeVehicle.issues,
        }),
      });

      if (!res.ok) {
        throw new Error('Fallback to client insights');
      }

      const data = await res.json();
      setAiInsight(data);
    } catch {
      // Graceful client fallback
      const fallback = getClientVehicleInsights({
        brand: activeVehicle.brand,
        model: activeVehicle.model,
        year: activeVehicle.year,
        mileage: activeVehicle.mileage,
        transmission: activeVehicle.transmission,
        fuelType: activeVehicle.fuelType,
        issues: activeVehicle.issues,
      });
      setAiInsight(fallback);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (activeVehicle) {
      fetchAiInsights();
    } else {
      setAiInsight(null);
    }
  }, [activeVehicle?.id, activeVehicle?.mileage]);

  if (!activeVehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Car className="w-8 h-8 text-slate-700" />
        </div>
        <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">No tienes ningún vehículo activo</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Registra tu carro en tu Garaje personal para generar el plan de mantenimiento según tu kilometraje, repuestos compatibles verificados y unirte al club oficial de tu marca.
        </p>
        <button
          onClick={onOpenAddVehicleModal}
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar mi Primer Vehículo</span>
        </button>
      </div>
    );
  }

  // Filter compatible parts for this vehicle
  const compatibleParts = spareParts.filter((part) => {
    const matchBrand = part.compatibleBrands.some(
      (b) => b.toLowerCase() === activeVehicle.brand.toLowerCase()
    );
    const matchModel = part.compatibleModels.some(
      (m) => activeVehicle.model.toLowerCase().includes(m.toLowerCase())
    );
    const matchYear =
      activeVehicle.year >= part.compatibleYears[0] &&
      activeVehicle.year <= part.compatibleYears[1];

    return (matchBrand && matchModel) || (matchBrand && matchYear);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Active Vehicle Hero Showcase: Clean Architectural Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Vehicle Image & Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
            <div className="w-full sm:w-56 h-36 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs relative group">
              {activeVehicle.image ? (
                <img
                  src={activeVehicle.image}
                  alt={activeVehicle.model}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-12 h-12 text-slate-400" />
                </div>
              )}
              {activeVehicle.hasClassicPlates && (
                <div className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Placa Antiguo
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-950 text-white text-xs font-black px-3 py-0.5 rounded-full">
                  {activeVehicle.brand}
                </span>
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
                  Año {activeVehicle.year}
                </span>
                {activeVehicle.plate && (
                  <span className="bg-amber-100 text-amber-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    {activeVehicle.plate}
                  </span>
                )}
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Vehículo en Monitoreo
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                {activeVehicle.brand} {activeVehicle.model}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-slate-500" />
                  <span>{activeVehicle.mileage.toLocaleString()} km registrados</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-slate-500" />
                  <span className="capitalize">{activeVehicle.fuelType || 'Gasolina'}</span>
                </div>
                <span>•</span>
                <div className="capitalize">{activeVehicle.transmission || 'Automática'}</div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {onEditVehicle && (
              <button
                onClick={() => onEditVehicle(activeVehicle)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar Kilometraje</span>
              </button>
            )}

            <button
              onClick={fetchAiInsights}
              disabled={loadingAi}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>Actualizar Diagnóstico</span>
            </button>
          </div>

        </div>

        {/* Vehicle Quick Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/60 divide-x divide-slate-200 text-left">
          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Próximo Cambio de Aceite</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              {((Math.floor(activeVehicle.mileage / 5000) + 1) * 5000).toLocaleString()} km
            </div>
            <div className="text-[11px] text-slate-500">Faltan aprox. {((Math.floor(activeVehicle.mileage / 5000) + 1) * 5000 - activeVehicle.mileage).toLocaleString()} km</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Revisión Técnico-Mecánica</div>
            <div className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">Vigente</div>
            <div className="text-[11px] text-slate-500">RUNT Certificado</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Repuestos Compatibles</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              {compatibleParts.length} piezas
            </div>
            <div className="text-[11px] text-slate-500">Garantía por chasís</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Club de Marca</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              {activeVehicle.brand} Oficial
            </div>
            <div className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => onNavigateToTab('comunidades')}>
              Ver comunidad →
            </div>
          </div>
        </div>

      </div>

      {/* AI Diagnostic Plan for this Mileage: Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagnóstico Técnico Predictivo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Plan de Mantenimiento Sugerido para {activeVehicle.mileage.toLocaleString()} km
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Recomendaciones basadas en especificaciones del fabricante y condiciones de altura/topografía de Colombia.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('repuestos')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0"
          >
            <span>Ver Repuestos para mi Auto</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* AI Insight Content */}
        {loadingAi ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-900">Analizando telemetría y kilometraje...</div>
            <div className="text-xs text-slate-500">Consultando manuales de taller para {activeVehicle.brand} {activeVehicle.model}</div>
          </div>
        ) : aiInsight ? (
          <div className="pt-6 space-y-6">
            
            {/* Urgent / Priority Items */}
            {aiInsight.priorityActions && aiInsight.priorityActions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Puntos de Atención Inmediata</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsight.priorityActions.map((action, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{action}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">Revisar desgaste o fecha de último cambio en bitácora</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Mileage Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-950 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Estado y Ciclo de Vida del Vehículo</span>
              </div>
              {aiInsight.summary || `Tu ${activeVehicle.brand} ${activeVehicle.model} (${activeVehicle.year}) se encuentra en el rango de los ${activeVehicle.mileage.toLocaleString()} km. En esta etapa se recomienda inspeccionar sistema de refrigeración, bujías y suspensión.`}
            </div>

            {/* Maintenance checklist items */}
            {aiInsight.preventiveMaintenance && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chequeo Preventivo Recomendado:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiInsight.preventiveMaintenance.map((item, index) => (
                    <div key={index} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 transition-colors text-xs flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="pt-6 text-center text-xs text-slate-500">
            Haz clic en "Actualizar Diagnóstico" para cargar las recomendaciones técnicas.
          </div>
        )}

      </div>

      {/* Compatible Verified Parts Strip: Clean Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">
              Repuestos Verificados para tu {activeVehicle.brand} {activeVehicle.model}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Filtro automático según año {activeVehicle.year} y compatibilidad de motor.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('repuestos')}
            className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todo el catálogo ({spareParts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {compatibleParts.slice(0, 4).map((part) => (
            <div
              key={part.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-400 transition-all flex flex-col justify-between"
            >
              <div 
                onClick={() => onOpenPartDetail(part)}
                className="cursor-pointer space-y-3"
              >
                <div className="aspect-4/3 bg-slate-100 rounded-xl overflow-hidden relative">
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {part.brand}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-mono">{part.partNumber}</div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                    {part.name}
                  </h3>
                  <div className="text-sm font-black text-slate-950 mt-1">
                    ${part.price.toLocaleString()} COP
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  En Stock
                </span>

                <button
                  onClick={() => onAddToCart({
                    type: 'repuesto',
                    id: part.id,
                    name: part.name,
                    brand: part.brand,
                    price: part.price,
                    quantity: 1,
                    image: part.image,
                    storeName: part.storeName,
                  })}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
