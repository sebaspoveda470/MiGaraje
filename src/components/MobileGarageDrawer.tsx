import React from 'react';
import { 
  Car, 
  PlusCircle, 
  Crown, 
  Edit3, 
  Check, 
  X, 
  Gauge, 
  ShieldCheck 
} from 'lucide-react';
import { Vehicle } from '../types';

interface MobileGarageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenAddVehicle: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
}

export const MobileGarageDrawer: React.FC<MobileGarageDrawerProps> = ({
  isOpen,
  onClose,
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenAddVehicle,
  onEditVehicle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* Slide-up Bottom Sheet */}
      <div className="bg-white w-full rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl max-h-[85dvh] flex flex-col animate-in slide-in-from-bottom duration-250">
        
        {/* Top Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-950 tracking-tight flex items-center gap-2">
              <span>Mi Garaje Personal</span>
              <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {vehicles.length} {vehicles.length === 1 ? 'Auto' : 'Autos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona tu vehículo activo para filtrar repuestos y mantenimiento
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle List */}
        <div className="overflow-y-auto py-3 space-y-2.5 flex-1">
          {vehicles.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Car className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-900">Aún no has registrado ningún auto</div>
              <p className="text-xs text-slate-500 mt-1">
                Agrega tu vehículo para consultar repuestos y peritajes exactos.
              </p>
            </div>
          ) : (
            vehicles.map((veh) => {
              const isCurrent = activeVehicle?.id === veh.id;
              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    onSelectVehicle(veh);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-500/80 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200 relative">
                      {veh.image ? (
                        <img src={veh.image} alt={veh.model} className="w-full h-full object-cover" />
                      ) : (
                        <Car className="w-6 h-6 text-slate-500 m-auto mt-4" />
                      )}
                      {veh.hasClassicPlates && (
                        <div className="absolute top-1 left-1 bg-amber-400 text-slate-950 p-0.5 rounded shadow-xs" title="Placa Antiguo">
                          <Crown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-950 truncate">
                          {veh.brand} {veh.model}
                        </span>
                        {veh.plate && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold px-1.5 py-0.2 rounded">
                            {veh.plate}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Año {veh.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-slate-400" />
                          <span>{veh.mileage.toLocaleString()} km</span>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          <span>Vehículo activo actual</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onEditVehicle && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onEditVehicle(veh);
                        }}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-950 shadow-xs cursor-pointer"
                        title="Modificar vehículo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isCurrent ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                    }`}>
                      {isCurrent && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add vehicle CTA */}
        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenAddVehicle();
            }}
            className="w-full bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Registrar Nuevo Vehículo en mi Garaje</span>
          </button>
        </div>

      </div>

    </div>
  );
};
