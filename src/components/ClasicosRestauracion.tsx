import React, { useState } from 'react';
import { 
  Award, 
  Crown, 
  Sparkles, 
  FileText, 
  Hammer, 
  Check, 
  ShieldCheck, 
  RefreshCw
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
  const [subTab, setSubTab] = useState<'certificados' | 'proyectos' | 'evaluador_ia' | 'guia_placas'>('certificados');

  // AI Restoration Evaluator State
  const [evalBrand, setEvalBrand] = useState('Ford');
  const [evalModel, setEvalModel] = useState('Mustang Fastback 1967');
  const [evalYear, setEvalYear] = useState<number>(1967);
  const [evalBodyCondition, setEvalBodyCondition] = useState('Óxido superficial moderado, líneas rectas');
  const [evalEngineCondition, setEvalEngineCondition] = useState('Motor original gira pero requiere reconstrucción completa');
  const [evalInteriorCondition, setEvalInteriorCondition] = useState('Tapicería deteriorada, tablero 80% completo');
  const [evalOriginalParts] = useState('75% piezas originales presentes');
  const [evalHasClassicPlates, setEvalHasClassicPlates] = useState<boolean>(false);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<RestorationAnalysis | null>(null);

  // Filter cars
  const classicCertifiedCars = carListings.filter((c) => c.isClassicPlate || c.condition === 'clasico_antiguo');
  const restorationProjectCars = carListings.filter((c) => c.condition === 'para_restaurar' || c.restorationPotential);

  const handleRunRestorationEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvalLoading(true);

    try {
      const res = await fetch('/api/gemini/restoration-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: evalBrand,
          model: evalModel,
          year: evalYear,
          bodyCondition: evalBodyCondition,
          engineCondition: evalEngineCondition,
          interiorCondition: evalInteriorCondition,
          hasOriginalParts: evalOriginalParts,
          hasClassicPlates: evalHasClassicPlates,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setEvalResult(data.data);
      } else {
        const fallback = getClientRestorationAnalysis({ brand: evalBrand, model: evalModel, year: evalYear });
        setEvalResult(fallback);
      }
    } catch (err: any) {
      console.warn('Backend unavailable, using client restoration perito:', err);
      const fallback = getClientRestorationAnalysis({ brand: evalBrand, model: evalModel, year: evalYear });
      setEvalResult(fallback);
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner Clásicos & Restauración with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-full shadow flex items-center gap-1.5 border border-amber-400">
              <Crown className="w-4 h-4" /> División Clásicos, Antiguos & Restauración
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Patrimonio Sobre Ruedas: Joyas con Placas de Antiguo & Proyectos Únicos
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Un espacio exclusivo para coleccionistas y restauradores. Compra vehículos históricos certificados, descubre proyectos con alto potencial de plusvalía y evalúa la viabilidad con nuestro perito IA.
          </p>
        </div>
      </div>

      {/* Sub Navigation Tabs with Frosted Glass */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-thin">
        
        <button
          onClick={() => setSubTab('certificados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'certificados'
              ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40 shadow-lg shadow-blue-600/20'
              : 'text-slate-300 hover:text-white bg-white/5 border border-white/5 backdrop-blur-sm'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Clásicos con Placa de Antiguo ({classicCertifiedCars.length})</span>
        </button>

        <button
          onClick={() => setSubTab('proyectos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'proyectos'
              ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40 shadow-lg shadow-blue-600/20'
              : 'text-slate-300 hover:text-white bg-white/5 border border-white/5 backdrop-blur-sm'
          }`}
        >
          <Hammer className="w-4 h-4 text-orange-400" />
          <span>Proyectos para Restaurar ({restorationProjectCars.length})</span>
        </button>

        <button
          onClick={() => setSubTab('evaluador_ia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'evaluador_ia'
              ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40 shadow-lg shadow-blue-600/20'
              : 'text-slate-300 hover:text-white bg-white/5 border border-white/5 backdrop-blur-sm'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Evaluador IA de Viabilidad de Restauración</span>
        </button>

        <button
          onClick={() => setSubTab('guia_placas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            subTab === 'guia_placas'
              ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40 shadow-lg shadow-blue-600/20'
              : 'text-slate-300 hover:text-white bg-white/5 border border-white/5 backdrop-blur-sm'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Guía & Trámites Placa de Antiguo</span>
        </button>

      </div>

      {/* SubTab 1: Clásicos Certificados con Placa de Antiguo */}
      {subTab === 'certificados' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vehículos con dictamen pericial aprobado por clubes federados (mínimo 85% a 95% de originalidad).</span>
            </span>
            <span className="text-amber-300 font-bold hidden sm:inline">Exentos de Pico y Placa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classicCertifiedCars.map((car) => (
              <div
                key={car.id}
                className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col group"
              >
                <div className="h-56 bg-white/5 relative overflow-hidden">
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" /> Placa de Antiguo Vigente
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white font-black text-base px-3.5 py-1 rounded-xl border border-white/15">
                    ${car.price.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-amber-300 font-bold">{car.brand} • Año {car.year}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{car.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">{car.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <span className="bg-white/5 p-2 rounded-xl border border-white/10 truncate backdrop-blur-sm">
                        Motor: {car.specs.engine}
                      </span>
                      <span className="bg-white/5 p-2 rounded-xl border border-white/10 truncate backdrop-blur-sm">
                        Caja: {car.specs.transmission}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenIntermediationModal(car)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-blue-600/25 border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
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
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-amber-400" />
              <span>Autos con alta demanda de coleccionistas listos para ser revividos. Incluyen diagnóstico de piezas faltantes y dificultad.</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restorationProjectCars.map((car) => (
              <div
                key={car.id}
                className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden shadow-xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className="w-full sm:w-44 h-36 rounded-2xl object-cover bg-white/5 shrink-0 border border-white/10"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{car.brand} {car.year}</span>
                      <span className="text-base font-black text-white">${car.price.toLocaleString()} USD</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{car.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{car.description}</p>
                  </div>
                </div>

                {/* Restoration Potential Data */}
                {car.restorationPotential && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-300 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">Nivel de Dificultad:</span>
                      <span className="font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                        {car.restorationPotential.difficulty}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span>Completitud de piezas originales:</span>
                        <strong className="text-emerald-400">{car.restorationPotential.completeness}%</strong>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${car.restorationPotential.completeness}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block font-semibold">Carrocería:</span>
                        <span>{car.restorationPotential.bodyworkStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Motor / Mecánica:</span>
                        <span>{car.restorationPotential.engineStatus}</span>
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-amber-300 font-medium">
                      Presupuesto estimado de terminación: <strong>{car.restorationPotential.estimatedCost}</strong>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onOpenIntermediationModal(car)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
                  >
                    Contactar & Ver Expediente Técnico
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Evaluador IA de Viabilidad de Restauración */}
      {subTab === 'evaluador_ia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          
          {/* Form Column */}
          <div className="lg:col-span-5 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-white/10 text-blue-400 border border-white/15 backdrop-blur-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simulador de Restauración con IA</h3>
                <p className="text-xs text-slate-400">Ingresa los datos del auto para evaluar costo vs. valor de mercado</p>
              </div>
            </div>

            <form onSubmit={handleRunRestorationEvaluation} className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-200">Marca</label>
                  <input
                    type="text"
                    value={evalBrand}
                    onChange={(e) => setEvalBrand(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-200">Año</label>
                  <input
                    type="number"
                    value={evalYear}
                    onChange={(e) => setEvalYear(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-200">Modelo Exacto & Carrocería</label>
                <input
                  type="text"
                  value={evalModel}
                  onChange={(e) => setEvalModel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-200">Estado de Chapería y Óxido</label>
                <input
                  type="text"
                  value={evalBodyCondition}
                  onChange={(e) => setEvalBodyCondition(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-200">Estado Mecánico del Motor</label>
                <input
                  type="text"
                  value={evalEngineCondition}
                  onChange={(e) => setEvalEngineCondition(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-200">Estado de Interior / Tapicería</label>
                <input
                  type="text"
                  value={evalInteriorCondition}
                  onChange={(e) => setEvalInteriorCondition(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="classicPlateGoal"
                  checked={evalHasClassicPlates}
                  onChange={(e) => setEvalHasClassicPlates(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-white/20 cursor-pointer accent-blue-600"
                />
                <label htmlFor="classicPlateGoal" className="font-semibold text-slate-200 cursor-pointer">
                  El objetivo es certificarlo con Placa de Antiguo (85%+ original)
                </label>
              </div>

              <button
                type="submit"
                disabled={evalLoading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${evalLoading ? 'animate-spin' : ''}`} />
                <span>{evalLoading ? 'Calculando Presupuesto & Viabilidad...' : 'Generar Dictamen de Restauración'}</span>
              </button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {evalLoading ? (
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center space-y-3">
                <RefreshCw className="w-10 h-10 text-white animate-spin mx-auto" />
                <h4 className="text-base font-bold text-white">Analizando bases históricas de repuestos y cotizaciones de talleres...</h4>
                <p className="text-xs text-slate-400">Calculando viabilidad de inversión, horas hombre y valor de subasta.</p>
              </div>
            ) : evalResult ? (
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in">
                
                {/* Viability & Value metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[11px] text-slate-400 block font-semibold">Viabilidad</span>
                    <span className="text-2xl font-black text-emerald-400">{evalResult.restorationViabilityScore} / 100</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Dificultad: {evalResult.difficultyLevel}</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[11px] text-slate-400 block font-semibold">Presupuesto Estimado</span>
                    <span className="text-base font-black text-amber-400">{evalResult.estimatedBudgetRangeUSD}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Mano de obra + piezas</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[11px] text-slate-400 block font-semibold">Valor Restaurado</span>
                    <span className="text-base font-black text-blue-400">{evalResult.estimatedValueAfterRestorationUSD}</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">Retorno Positivo</span>
                  </div>
                </div>

                {/* Classic Plate Eligibility */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-xs font-bold text-amber-300 block mb-1">
                    👑 Elegibilidad para Placa de Antiguo:
                  </span>
                  <p className="text-xs text-slate-300">{evalResult.potentialClassicPlateEligibility}</p>
                </div>

                {/* Phases */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2">Fases Recomendadas de Trabajo:</h4>
                  <div className="space-y-2">
                    {evalResult.recommendedPhases.map((p, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs backdrop-blur-sm">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{idx + 1}. {p.phase}</span>
                          {p.difficulty && <span className="text-[10px] text-amber-400 font-normal">{p.difficulty}</span>}
                        </div>
                        <p className="text-slate-300 mt-1 text-[11px]">{p.keyTasks}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expert Tips */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-1.5">Consejos Clave del Restaurador:</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evalResult.expertTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center space-y-3">
                <Crown className="w-12 h-12 text-white/50 mx-auto" />
                <h4 className="text-base font-bold text-white">Simula tu proyecto de restauración</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Completa los datos del vehículo y obtén un dictamen técnico con rango presupuestal, fases sugeridas y probabilidad de certificar placa de antiguo.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SubTab 4: Guía Oficial de Trámite de Placa de Antiguo */}
      {subTab === 'guia_placas' && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 text-xs text-slate-300 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Manual y Requisitos para Certificación de Placas de Antiguo</h2>
              <p className="text-xs text-slate-400">Procedimiento avalado por la Federación de Clubes y Autoridades de Tránsito</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> 1. Requisitos Fundamentales
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Antigüedad mínima:</strong> El vehículo debe haber cumplido al menos 30 a 35 años desde su fecha de fabricación original.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Originalidad certificada:</strong> Debe conservar un mínimo del 85% al 90% de sus especificaciones de fábrica de la época.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Mecánica fidedigna:</strong> Motor, transmisión y suspensión correspondientes a la serie o catálogo del año del vehículo.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> 2. Beneficios de la Placa de Antiguo
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Exención de restricciones de movilidad:</strong> Libre circulación sin pico y placa en las principales ciudades.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Revisión técnico-mecánica especial:</strong> Examen ajustado a los estándares de emisiones y tecnología de su época.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Plusvalía e inversión:</strong> Incremento inmediato de la cotización internacional y cotización en pólizas de colección.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">¿Tienes un vehículo listo para peritaje de antiguo?</h4>
              <p className="text-xs text-slate-300">Nuestros peritos aliados de la Asociación de Clásicos realizan la pre-evaluación digital.</p>
            </div>
            <button
              onClick={() => setSubTab('evaluador_ia')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 shrink-0 cursor-pointer"
            >
              Iniciar Pre-Evaluación IA
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
