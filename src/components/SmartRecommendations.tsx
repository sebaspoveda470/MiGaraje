import React from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Car, 
  ChevronRight, 
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
  ArrowRight,
  AlertTriangle,
  FileCheck,
  Droplet,
  Sparkles
} from 'lucide-react';
import { Vehicle, CareProduct } from '../types';
import { VehicleDocsCard } from './VehicleDocsCard';
import { getDocStatus, describeDoc } from '../utils/vehicleDocs';

interface SmartRecommendationsProps {
  activeVehicle: Vehicle | null;
  onOpenAddVehicleModal: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  careProducts: CareProduct[];
  onNavigateToTab: (tab: string) => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  activeVehicle,
  onOpenAddVehicleModal,
  onEditVehicle,
  careProducts,
  onNavigateToTab,
}) => {
  if (!activeVehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Car className="w-8 h-8 text-slate-700" />
        </div>
        <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">No tienes ningún vehículo activo</h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Registra tu carro en tu Garaje personal para generar el plan de mantenimiento según tu kilometraje, consultar Pico y Placa y unirte a tu club en Mi Comunidad.
        </p>
        <button
          onClick={onOpenAddVehicleModal}
          className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-xs sm:text-sm min-h-[46px]"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Registrar mi Primer Vehículo</span>
        </button>
      </div>
    );
  }

  // Next oil change calculation
  const nextOilChangeKm = (Math.floor(activeVehicle.mileage / 5000) + 1) * 5000;
  const kmToOilChange = nextOilChangeKm - activeVehicle.mileage;

  // Extract last digit of plate for Colombian Pico y Placa
  const plateMatch = activeVehicle.plate ? activeVehicle.plate.match(/\d+$/) : null;
  const lastDigit = plateMatch ? plateMatch[0].slice(-1) : (activeVehicle.plate ? activeVehicle.plate.slice(-1) : null);

  // Deterministic maintenance items based on mileage
  const getPreventiveChecklist = (mileage: number) => {
    const list = [
      'Inspección de nivel y estado de aceite de motor 5W-30 / 0W-20',
      'Revisión visual de pastillas y discos de freno',
      'Comprobación de presión y desgaste de llantas',
      'Inspección de nivel de refrigerante orgánico y líquido de frenos DOT4',
    ];

    if (mileage >= 20000) {
      list.push('Rotación de llantas, alineación y balanceo en las 4 ruedas');
      list.push('Reemplazo de filtro de aire de motor y filtro de cabina antipolen');
    }
    if (mileage >= 40000) {
      list.push('Limpieza del cuerpo de aceleración y descarbonización preventiva');
      list.push('Inspección de amortiguadores, axiales y terminales de dirección');
    }
    if (mileage >= 60000) {
      list.push('Cambio preventivo de bujías de Iridio / Platino');
      list.push('Revisión de correa de accesorios y soportes de motor hidráulicos');
    }
    if (mileage >= 80000) {
      list.push('Inspección profunda de kit de repartición (cadena o correa)');
      list.push('Cambio de fluido de transmisión (caja mecánica o automática)');
    }
    return list;
  };

  const maintenanceList = getPreventiveChecklist(activeVehicle.mileage);
  const tecnoStatus = getDocStatus(activeVehicle, 'tecno');
  const tecnoColor =
    tecnoStatus.state === 'vencido' ? 'text-red-600' : tecnoStatus.state === 'por_vencer' ? 'text-amber-600' : tecnoStatus.state === 'vigente' ? 'text-emerald-600' : 'text-slate-400';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Active Vehicle Hero Showcase */}
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
                <span className="text-[11px] text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Vehículo Registrado
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

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {onEditVehicle && (
              <button
                onClick={() => onEditVehicle(activeVehicle)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer min-h-[42px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modificar Kilometraje</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab('comunidades')}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver Club {activeVehicle.brand}</span>
            </button>
          </div>

        </div>

        {/* Colombian Quick Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/60 divide-x divide-slate-200 text-left">
          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Próximo Cambio de Aceite</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              {nextOilChangeKm.toLocaleString()} km
            </div>
            <div className="text-[11px] text-slate-500">Faltan aprox. {kmToOilChange.toLocaleString()} km</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Revisión Técnico-Mecánica</div>
            <div className={`text-base sm:text-lg font-black mt-0.5 ${tecnoColor}`}>
              {tecnoStatus.state === 'sin_fecha' ? 'Sin fecha' : tecnoStatus.state === 'vigente' ? 'Al Día' : tecnoStatus.state === 'vencido' ? 'Vencida' : 'Por vencer'}
            </div>
            <div className="text-[11px] text-slate-500">{describeDoc(tecnoStatus)}</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pico y Placa</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              {lastDigit ? `Terminada en ${lastDigit}` : 'Sin Placa'}
            </div>
            <div className="text-[11px] text-slate-500">
              {lastDigit ? (Number(lastDigit) % 2 === 0 ? 'Dígito Par' : 'Dígito Impar') : 'Registrar placa'}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Comunidad Oficial</div>
            <div className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
              Club {activeVehicle.brand}
            </div>
            <div 
              className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
              onClick={() => onNavigateToTab('comunidades')}
            >
              Ir a Mi Comunidad →
            </div>
          </div>
        </div>

      </div>

      <VehicleDocsCard vehicle={activeVehicle} onEdit={onEditVehicle ? () => onEditVehicle(activeVehicle) : undefined} />

      {/* Mileage Maintenance Plan: Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase mb-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Bitácora de Servicio Técnico</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Plan Preventivo Sugerido para los {activeVehicle.mileage.toLocaleString()} km
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Rutina de inspección técnica según especificaciones de fábrica y topografía de Colombia.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('productos')}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 min-h-[42px]"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Ver Productos de Cuidado</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Maintenance Items Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chequeos Recomendados en esta Etapa:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maintenanceList.map((item, index) => (
              <div 
                key={index}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors text-xs flex items-center gap-3 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MiGaraje Brand Care Showcase Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight">
              Productos Oficiales MiGaraje para tu Carro
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Cuidado estético y desengrasantes profesionales con compra directa por WhatsApp.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('productos')}
            className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todo el catálogo MiGaraje</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {careProducts.slice(0, 3).map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-16/10 bg-slate-100 rounded-xl overflow-hidden relative">
                  <img
                    src={prod.images?.[0] || prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    MiGaraje Oficial
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase">{prod.subcategory}</div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {prod.name}
                  </h3>
                  <div className="text-sm font-black text-slate-950 mt-1">
                    ${prod.price.toLocaleString()} COP
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{prod.volume}</span>
                <button
                  onClick={() => onNavigateToTab('productos')}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Ver Producto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
