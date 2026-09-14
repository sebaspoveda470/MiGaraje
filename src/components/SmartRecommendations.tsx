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
  Edit3
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
          engine: activeVehicle.engine,
          type: activeVehicle.type,
          state: activeVehicle.notes,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiInsight(data.data);
      } else {
        const fallback = getClientVehicleInsights(activeVehicle);
        setAiInsight(fallback);
      }
    } catch (err: any) {
      console.warn('Backend unavailable, using client insights model:', err);
      const fallback = getClientVehicleInsights(activeVehicle);
      setAiInsight(fallback);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (activeVehicle) {
      fetchAiInsights();
    }
  }, [activeVehicle?.id]);

  if (!activeVehicle) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white backdrop-blur-md">
          <Car className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">No tienes ningún vehículo activo</h2>
        <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Registra tu carro en el Garaje para recibir el plan de mantenimiento a la medida de tu kilometraje, repuestos compatibles verificados y unirte al club oficial de tu marca.
        </p>
        <button
          onClick={onOpenAddVehicleModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
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
      
      {/* Active Vehicle Hero Card with Frosted Glass & Blur Orbs */}
      <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Internal ambient glowing orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Vehicle Image & Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
            <div className="w-full sm:w-48 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shrink-0 shadow-lg relative group">
              {activeVehicle.image ? (
                <img
                  src={activeVehicle.image}
                  alt={activeVehicle.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-12 h-12 text-blue-400" />
                </div>
              )}
              {activeVehicle.hasClassicPlates && (
                <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded shadow flex items-center gap-1 border border-amber-400">
                  <Crown className="w-3 h-3" /> Placa Antiguo
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                  {activeVehicle.brand}
                </span>
                <span className="bg-white/10 text-white text-xs px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md font-semibold">
                  Año {activeVehicle.year}
                </span>
                {activeVehicle.plate && (
                  <span className="bg-white text-slate-900 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-white shadow-xs">
                    {activeVehicle.plate}
                  </span>
                )}
                <span className="text-[11px] text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Vehículo Activo
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeVehicle.brand} {activeVehicle.model}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-white font-medium">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{activeVehicle.mileage.toLocaleString()} km</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <Fuel className="w-3.5 h-3.5 text-sky-400" />
                  {activeVehicle.fuelType} • {activeVehicle.transmission}
                </span>
                {activeVehicle.engine && (
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    {activeVehicle.engine}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: Re-analyze with AI & Add/Edit Car */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {onEditVehicle && (
              <button
                onClick={() => onEditVehicle(activeVehicle)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Modificar kilometraje, placas, motor o foto"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-300" />
                <span>Modificar Datos</span>
              </button>
            )}

            <button
              onClick={fetchAiInsights}
              disabled={loadingAi}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black px-3.5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'Analizando...' : 'Diagnóstico IA'}</span>
            </button>

            <button
              onClick={onOpenAddVehicleModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agregar Auto</span>
              <span className="sm:hidden">+ Auto</span>
            </button>
          </div>

        </div>

        {/* Quick Nav Shortcut to Brand Community */}
        <div className="bg-white/[0.02] backdrop-blur-xl border-t border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              Perteneces automáticamente a la <strong>Comunidad {activeVehicle.brand}</strong> & Foros Técnicos de {activeVehicle.model}.
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('comunidades')}
            className="text-white hover:text-blue-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Ver Hilos de Discusión & Soluciones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* AI Diagnóstico & Plan de Mantenimiento por Kilometraje */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recommended Maintenance & Known Issues */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Maintenance Checklist Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
                  <Wrench className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Mantenimiento Preventivo Recomendado</h2>
                  <p className="text-xs text-slate-400">
                    Ajustado a los <strong>{activeVehicle.mileage.toLocaleString()} km</strong> de tu {activeVehicle.brand} {activeVehicle.model} ({activeVehicle.year})
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-white/10 text-blue-300 border border-blue-400/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> IA Gemini 3.7
              </span>
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Analizando especificaciones de fabricante y base comunitaria...</p>
              </div>
            ) : aiInsight?.maintenanceChecklist && aiInsight.maintenanceChecklist.length > 0 ? (
              <div className="space-y-3">
                {aiInsight.maintenanceChecklist.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md border border-white/10 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                          task.priority.toLowerCase().includes('alta')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority.toLowerCase().includes('media')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          Prioridad {task.priority}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{task.item}</h3>
                      </div>
                      <p className="text-xs text-slate-300">{task.reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigateToTab('repuestos')}
                      className="shrink-0 flex items-center gap-1 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-md transition-colors cursor-pointer"
                    >
                      <span>Buscar Repuesto</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Fallback smart checklist
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30">Prioridad Alta</span>
                    <h3 className="text-sm font-semibold text-white mt-1">Inspección y Reemplazo de Pastillas & Líquido de Frenos</h3>
                    <p className="text-xs text-slate-400">Verificar espesor de material de fricción (mínimo 3mm) y purga con líquido DOT 4.</p>
                  </div>
                  <button onClick={() => onNavigateToTab('repuestos')} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl border border-white/10 cursor-pointer">Ver tiendas</button>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">Prioridad Media</span>
                    <h3 className="text-sm font-semibold text-white mt-1">Juego de Bujías de Iridio Láser (Calibradas a 1.1mm)</h3>
                    <p className="text-xs text-slate-400">Recomendado para evitar fallos de encendido y sobreconsumo en motores de alta compresión.</p>
                  </div>
                  <button onClick={() => onNavigateToTab('repuestos')} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl border border-white/10 cursor-pointer">Ver tiendas</button>
                </div>
              </div>
            )}

            {/* AI Summary note */}
            {aiInsight?.summary && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.05] border border-white/15 backdrop-blur-md flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-white">Diagnóstico General:</strong> {aiInsight.summary}
                </p>
              </div>
            )}
          </div>

          {/* Common Known Issues / Fallas Conocidas del Modelo */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-white/10 text-amber-400 border border-white/15 backdrop-blur-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Fallas Comunes Reportadas por la Comunidad</h2>
                <p className="text-xs text-slate-400">
                  Puntos críticos monitoreados en propietarios de <strong>{activeVehicle.brand} {activeVehicle.model}</strong>
                </p>
              </div>
            </div>

            {aiInsight?.commonKnownIssues && aiInsight.commonKnownIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {aiInsight.commonKnownIssues.map((issue, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <h4 className="text-xs font-bold text-white">{issue.issue}</h4>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong className="text-amber-400">Síntoma:</strong> {issue.symptom}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-emerald-400">Solución / Prevención:</strong> {issue.prevention}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-400 backdrop-blur-md">
                Cargando puntos de atención comunitaria para este modelo...
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Compatible Parts + Care Recommendations */}
        <div className="space-y-6">
          
          {/* Compatible Parts Ready for Intermediation */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Repuestos Compatibles en Stock</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('repuestos')}
                className="text-xs text-white hover:text-blue-300 font-bold cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {compatibleParts.slice(0, 3).map((part) => (
                <div
                  key={part.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 group shadow-sm"
                >
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => onOpenPartDetail(part)}
                      className="text-xs font-bold text-white truncate cursor-pointer hover:text-blue-300 transition-colors"
                    >
                      {part.name}
                    </h4>
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <span className="text-blue-300 font-bold">${part.price.toFixed(2)} USD</span>
                      <span>•</span>
                      <span className="truncate">{part.storeName.split('(')[0]}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Compatible con tu {activeVehicle.model}
                    </span>
                  </div>
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
                      warrantyMonths: part.warrantyMonths,
                    })}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30 font-bold transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                    title="Añadir al carrito"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => onNavigateToTab('repuestos')}
                className="w-full text-center text-xs font-semibold text-slate-300 hover:text-white py-1.5 transition-colors cursor-pointer"
              >
                Solicitar cotización con intermediación de tiendas aliadas →
              </button>
            </div>
          </div>

          {/* Recommended Detailing & Engine Care */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Cuidado Estético & Motor</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('cuidado')}
                className="text-xs text-white hover:text-purple-300 font-bold cursor-pointer"
              >
                Tienda Detailing
              </button>
            </div>

            <div className="space-y-3">
              {careProducts.slice(0, 2).map((care) => (
                <div
                  key={care.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center gap-3"
                >
                  <img
                    src={care.image}
                    alt={care.name}
                    className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2 py-0.2 rounded-full border border-purple-500/30">
                      {care.subcategory}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">{care.name}</h4>
                    <span className="text-[11px] text-blue-300 font-bold">${care.price.toFixed(2)} USD</span>
                  </div>
                  <button
                    onClick={() => onAddToCart({
                      type: 'cuidado',
                      id: care.id,
                      name: care.name,
                      brand: care.brand,
                      price: care.price,
                      quantity: 1,
                      image: care.image,
                    })}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 border border-blue-500/30 text-white font-bold transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>

            {aiInsight?.recommendedCareAndDetailing && (
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-300">Tips de estética para este modelo:</span>
                {aiInsight.recommendedCareAndDetailing.slice(0, 2).map((rec, i) => (
                  <div key={i} className="text-[11px] text-slate-300 bg-white/[0.03] backdrop-blur-md border border-white/5 p-2.5 rounded-xl">
                    <strong className="text-blue-300">{rec.area}:</strong> {rec.recommendation}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market valuation tip */}
          {aiInsight?.estimatedMarketRange && (
            <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 text-xs text-slate-300 shadow-xl">
              <span className="text-blue-300 font-bold block mb-1">💰 Valoración y Conservación:</span>
              <p>{aiInsight.estimatedMarketRange}</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
