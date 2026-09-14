import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Hammer, 
  ShieldCheck, 
  Search, 
  Plus, 
  Award, 
  RefreshCw, 
  ChevronRight, 
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { VehicleListing, RestorationAnalysis } from '../types';
import { getClientRestorationAnalysis } from '../services/geminiClientService';

interface ClasicosRestauracionProps {
  carListings: VehicleListing[];
  onOpenIntermediationModal: (listing: VehicleListing) => void;
}

export const ClasicosRestauracion: React.FC<ClasicosRestauracionProps> = ({
  carListings,
  onOpenIntermediationModal,
}) => {
  const [subTab, setSubTab] = useState<'certificados' | 'proyectos' | 'evaluador_ia' | 'talleres'>('certificados');
  
  // Evaluador de Viabilidad State
  const [evalBrand, setEvalBrand] = useState('Toyota');
  const [evalModel, setEvalModel] = useState('Land Cruiser FJ40');
  const [evalYear, setEvalYear] = useState(1978);
  const [evalState, setEvalState] = useState('Regular - Requiere latonería, tapicería y puesta a punto de motor');
  const [evalHasClassicPlates, setEvalHasClassicPlates] = useState(true);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<RestorationAnalysis | null>(null);

  // Filter classic cars
  const classicCertifiedCars = carListings.filter((v) => v.isClassicPlate || v.condition === 'clasico_antiguo' || v.year <= 1990);
  const restorationProjectCars = carListings.filter((v) => v.condition === 'para_restaurar' || v.restorationPotential !== undefined);

  const handleEvaluateViability = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvalLoading(true);

    try {
      const res = await fetch('/api/gemini/evaluate-restoration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: evalBrand,
          model: evalModel,
          year: evalYear,
          currentStateDescription: evalState,
          aimsForClassicPlate: evalHasClassicPlates,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
      } else {
        throw new Error('API Error');
      }
    } catch {
      // Fallback
      const fallback = getClientRestorationAnalysis({
        brand: evalBrand,
        model: evalModel,
        year: evalYear,
      });
      setEvalResult(fallback);
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner Clásicos & Restauración: Clean Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 font-bold text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-300">
              <Crown className="w-4 h-4 text-amber-700" /> División Clásicos, Antiguos & Restauración
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Patrimonio Sobre Ruedas: Joyas con Placas de Antiguo & Proyectos Únicos
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Un espacio exclusivo para coleccionistas y restauradores en Colombia. Compra vehículos históricos certificados con placas de antiguo, descubre proyectos con alto potencial de plusvalía y evalúa la viabilidad con nuestro perito IA.
          </p>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-thin">
        
        <button
          onClick={() => setSubTab('certificados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'certificados'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Clásicos con Placa de Antiguo ({classicCertifiedCars.length})</span>
        </button>

        <button
          onClick={() => setSubTab('proyectos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'proyectos'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Hammer className="w-4 h-4 text-orange-500" />
          <span>Proyectos para Restaurar ({restorationProjectCars.length})</span>
        </button>

        <button
          onClick={() => setSubTab('evaluador_ia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'evaluador_ia'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Evaluador IA de Viabilidad de Restauración</span>
        </button>

        <button
          onClick={() => setSubTab('talleres')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'talleres'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-blue-500" />
          <span>Talleres Especialistas & Certificadores</span>
        </button>
      </div>

      {/* SubTab 1: Clásicos Certificados con Placa de Antiguo */}
      {subTab === 'certificados' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 shadow-xs">
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Vehículos con más de 35 años y certificación oficial de originalidad (mínimo 85% partes originales según regulación de Colombia).</span>
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
              Exentos de Pico y Placa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classicCertifiedCars.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Placa de Antiguo
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-black px-2.5 py-1 rounded shadow-xs">
                    ${car.price.toLocaleString()} {car.currency}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800">{car.brand} {car.model}</span>
                      <span>Año {car.year}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                      {car.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {car.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-50 p-2 rounded-xl border border-slate-200 truncate">
                        Motor: {car.specs.engine}
                      </span>
                      <span className="bg-slate-50 p-2 rounded-xl border border-slate-200 truncate">
                        Caja: {car.specs.transmission}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenIntermediationModal(car)}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Ver Ficha & Solicitar Intermediación</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Proyectos con Potencial de Restauración */}
      {subTab === 'proyectos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-600 shadow-xs">
            <span className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-orange-500" />
              <span>Autos con alta demanda de coleccionistas listos para ser revividos. Incluyen diagnóstico y estimación de inversión.</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restorationProjectCars.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className="w-full sm:w-44 h-36 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700">{car.brand} {car.year}</span>
                      <span className="text-base font-black text-slate-950">${car.price.toLocaleString()} {car.currency}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-950">{car.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{car.description}</p>
                  </div>
                </div>

                {/* Restoration Potential Data */}
                {car.restorationPotential && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">Nivel de Dificultad:</span>
                      <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {car.restorationPotential.difficulty}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Índice de Completitud:</span>
                        <span className="font-bold text-slate-900">{car.restorationPotential.completeness}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${car.restorationPotential.completeness}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-900">Estado de Carrocería: </span>
                      <span>{car.restorationPotential.bodyworkStatus}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Inversión estimada: <strong className="text-slate-900 font-bold">{car.restorationPotential?.estimatedCost || 'A cotizar'}</strong>
                  </div>

                  <button
                    onClick={() => onOpenIntermediationModal(car)}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Ver Proyecto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Evaluador IA de Viabilidad de Restauración */}
      {subTab === 'evaluador_ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          
          {/* Form Column */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-900">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Peritaje IA de Restauración</h3>
                <p className="text-xs text-slate-500">Calcula horas de taller, costo de repuestos y valor futuro</p>
              </div>
            </div>

            <form onSubmit={handleEvaluateViability} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-900 mb-1">Marca del Vehículo</label>
                <input
                  type="text"
                  required
                  value={evalBrand}
                  onChange={(e) => setEvalBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Modelo / Serie</label>
                  <input
                    type="text"
                    required
                    value={evalModel}
                    onChange={(e) => setEvalModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Año</label>
                  <input
                    type="number"
                    required
                    min={1920}
                    max={1995}
                    value={evalYear}
                    onChange={(e) => setEvalYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1">Estado Actual del Proyecto</label>
                <textarea
                  rows={3}
                  required
                  value={evalState}
                  onChange={(e) => setEvalState(e.target.value)}
                  placeholder="Describe qué piezas tiene, qué le falta, estado de chasis, óxido o funcionamiento de motor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="classicPlateGoal"
                  checked={evalHasClassicPlates}
                  onChange={(e) => setEvalHasClassicPlates(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 cursor-pointer accent-slate-900"
                />
                <label htmlFor="classicPlateGoal" className="font-semibold text-slate-700 cursor-pointer">
                  El objetivo es certificarlo con Placa de Antiguo (85%+ original)
                </label>
              </div>

              <button
                type="submit"
                disabled={evalLoading}
                className="w-full mt-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${evalLoading ? 'animate-spin' : ''}`} />
                <span>{evalLoading ? 'Calculando Presupuesto & Viabilidad...' : 'Generar Dictamen de Restauración'}</span>
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {evalLoading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                <RefreshCw className="w-10 h-10 text-slate-900 animate-spin mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Analizando bases históricas de repuestos y cotizaciones de talleres...</h4>
                <p className="text-xs text-slate-500">Calculando viabilidad de inversión, horas hombre y valor de mercado.</p>
              </div>
            ) : evalResult ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 animate-in fade-in">
                
                {/* Viability & Value metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-semibold">Viabilidad</span>
                    <span className="text-2xl font-black text-blue-700">{evalResult.restorationViabilityScore} / 100</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Dificultad: {evalResult.difficultyLevel}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-semibold">Presupuesto Estimado</span>
                    <span className="text-base font-black text-amber-700">{evalResult.estimatedBudgetRangeUSD}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Mano de obra + piezas</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-semibold">Valor Restaurado</span>
                    <span className="text-base font-black text-blue-700">{evalResult.estimatedValueAfterRestorationUSD}</span>
                    <span className="text-[10px] text-blue-700 block mt-0.5 font-bold">Plusvalía Proyectada</span>
                  </div>
                </div>

                {/* Classic Plate Eligibility */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="text-xs font-bold text-amber-900 block mb-1">
                    👑 Elegibilidad para Placa de Antiguo:
                  </span>
                  <p className="text-xs text-slate-700">{evalResult.potentialClassicPlateEligibility}</p>
                </div>

                {/* Phases */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Fases Recomendadas de Trabajo:</h4>
                  <div className="space-y-2">
                    {evalResult.recommendedPhases.map((p, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex justify-between font-bold text-slate-900 mb-1">
                          <span>{p.phase}</span>
                          <span className="text-slate-600 font-normal">{p.difficulty}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{p.keyTasks}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {evalResult.expertTips && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Consejos de Especialistas:</span>
                    </span>
                    <div className="space-y-1">
                      {evalResult.expertTips.map((tip, idx) => (
                        <p key={idx} className="text-[11px] text-slate-600">
                          • {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
                <Crown className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Evalúa cualquier clásico antes de comprarlo</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Completa los datos del vehículo en el formulario de la izquierda para obtener un dictamen pericial con cotizaciones de piezas y viabilidad para placa de antiguo.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SubTab 4: Talleres Especialistas & Certificadores */}
      {subTab === 'talleres' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Red de Talleres de Restauración y Peritos Autorizados en Colombia</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Especialistas en latonería artesanal inglesa/alemana, reconstrucción de motores clásicos y tramitología de placas de antiguo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Restauraciones Época Vintage</span>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">Bogotá</span>
              </div>
              <p className="text-xs text-slate-600">
                Especialistas en pintura poliéster y reconstrucción de chasís para Mercedes-Benz W114, BMW E30 y Toyota FJ.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Más de 40 autos con placa de antiguo certificados.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-950">Medellín Classic Coachworks</span>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">Medellín</span>
              </div>
              <p className="text-xs text-slate-600">
                Tapicería en cuero legítimo de época, cromado electrolítico y puesta a punto de carburadores dobles Weber/Solex.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Garantía escrita de 24 meses en restauración integral.
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-950">Autoclásica Eje Cafetero</span>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">Pereira</span>
              </div>
              <p className="text-xs text-slate-600">
                Restauración de 4x4 icónicos (Willys MB, Land Rover Serie II/III, Nissan Patrol G60).
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Banco de pruebas de tracción y cajas transfer originales.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
