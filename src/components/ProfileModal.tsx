import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  X, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  LogOut, 
  Crown,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { UserProfile, Vehicle } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onOpenAddVehicle: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenAddVehicle,
  onEditVehicle,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xl overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88dvh] bg-white text-slate-900 rounded-3xl shadow-2xl shadow-black/80 border border-slate-200 flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header - Fixed Shrink-0 */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-blue-600/40 border border-blue-400/40 shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                {user?.fullName || 'Perfil de Usuario'}
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-300 font-bold capitalize flex items-center gap-1 mt-0.5">
                <Crown className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{user?.role || 'Propietario MiGaraje'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar perfil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/70 overscroll-contain">
          
          {/* User Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium min-w-0">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{user?.email || 'Sin correo'}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-slate-700 font-medium min-w-0">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
            {user?.city && (
              <div className="flex items-center gap-2 text-slate-700 font-medium min-w-0">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{user.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-emerald-700 font-bold min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cuenta Verificada</span>
            </div>
          </div>

          {/* Vehicles in Garage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>Mis Vehículos ({vehicles.length})</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddVehicle();
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Auto</span>
              </button>
            </div>

            <div className="space-y-2">
              {vehicles.length === 0 ? (
                <div className="text-center py-6 bg-white border border-dashed border-slate-300 rounded-2xl p-4">
                  <Car className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-600 font-bold">No tienes vehículos registrados</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddVehicle();
                    }}
                    className="mt-2 text-xs font-bold text-blue-600 underline cursor-pointer"
                  >
                    + Registrar mi primer vehículo
                  </button>
                </div>
              ) : (
                vehicles.map((v) => {
                  const isActive = v.id === activeVehicleId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => onSelectVehicle(v.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-300 shadow-xs">
                          {v.image ? (
                            <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{v.brand} {v.model}</span>
                            {v.hasClassicPlates && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-300 shrink-0">
                                Antiguo
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            Año {v.year} • {v.mileage.toLocaleString()} km
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2 flex items-center gap-1.5">
                        {onEditVehicle && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onEditVehicle(v);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                            title="Editar información de este vehículo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Editar</span>
                          </button>
                        )}

                        {isActive ? (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg">
                            Activar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Fixed Footer Actions - Always visible on mobile */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold px-2.5 sm:px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">Cerrar Sesión</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-950 hover:bg-slate-900 active:scale-95 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-slate-950/20"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
