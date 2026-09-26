import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Wrench, X } from 'lucide-react';
import { ServiceCategory, ServiceRecord, Vehicle } from '../types';
import { subscribeToServices, saveService, deleteService } from '../services/userService';
import { useConfirm } from './ConfirmDialog';

interface MaintenanceLogProps {
  uid: string;
  vehicle: Vehicle;
  /** Called when a service reports more km than the vehicle has */
  onMileageUpdate: (mileage: number) => void;
  onError: (message: string, err: unknown) => void;
}

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  aceite: 'Cambio de aceite',
  frenos: 'Frenos',
  llantas: 'Llantas / alineación',
  suspension: 'Suspensión',
  bateria: 'Batería / eléctrico',
  revision: 'Revisión general',
  lavado: 'Lavado / estética',
  reparacion: 'Reparación',
  otro: 'Otro',
};

const formatCOP = (value: number) => `$${value.toLocaleString('es-CO')}`;
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none shadow-xs';

export const MaintenanceLog: React.FC<MaintenanceLogProps> = ({ uid, vehicle, onMileageUpdate, onError }) => {
  const confirmAction = useConfirm();
  const [services, setServices] = useState<ServiceRecord[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [date, setDate] = useState(todayISO());
  const [mileage, setMileage] = useState<number>(vehicle.mileage);
  const [category, setCategory] = useState<ServiceCategory>('aceite');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [workshop, setWorkshop] = useState('');

  useEffect(() => {
    setServices(null);
    setShowForm(false);
    return subscribeToServices(uid, vehicle.id, setServices, (err) => onError('No se pudo cargar la bitácora.', err));
  }, [uid, vehicle.id]);

  const openForm = () => {
    setDate(todayISO());
    setMileage(vehicle.mileage);
    setCategory('aceite');
    setDescription('');
    setCost(0);
    setWorkshop('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveService(uid, vehicle.id, {
        id: `srv_${Date.now()}`,
        date,
        mileage: Number(mileage) || 0,
        category,
        description: description.trim() || undefined,
        cost: Number(cost) || 0,
        workshop: workshop.trim() || undefined,
      });
      if (Number(mileage) > vehicle.mileage) onMileageUpdate(Number(mileage));
      setShowForm(false);
    } catch (err) {
      onError('No se pudo guardar el registro.', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (service: ServiceRecord) => {
    const ok = await confirmAction(`Se eliminará "${SERVICE_CATEGORIES[service.category]}" del ${formatDate(service.date)}.`, {
      title: '¿Eliminar registro?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    deleteService(uid, vehicle.id, service.id).catch((err) => onError('No se pudo eliminar el registro.', err));
  };

  const year = new Date().getFullYear();
  const spentThisYear = (services || []).filter((s) => s.date.startsWith(String(year))).reduce((acc, s) => acc + s.cost, 0);
  const spentTotal = (services || []).reduce((acc, s) => acc + s.cost, 0);
  const visible = showAll ? services || [] : (services || []).slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Bitácora de Mantenimiento</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Historial de tu {vehicle.brand} {vehicle.model}</h2>
          <p className="text-xs text-slate-600 mt-0.5">Registra cada servicio: te ayuda a controlar gastos y a vender mejor tu carro.</p>
        </div>
        {!showForm && (
          <button
            onClick={openForm}
            className="shrink-0 flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            Registrar servicio
          </button>
        )}
      </div>

      {services && services.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Gastado en {year}</div>
            <div className="text-sm sm:text-lg font-black text-slate-950 mt-0.5">{formatCOP(spentThisYear)}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Total histórico</div>
            <div className="text-sm sm:text-lg font-black text-slate-950 mt-0.5">{formatCOP(spentTotal)}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Servicios</div>
            <div className="text-sm sm:text-lg font-black text-slate-950 mt-0.5">{services.length}</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 text-sm">Nuevo registro</span>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Cerrar" className="text-slate-400 hover:text-slate-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de servicio *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)} className={inputClass}>
                {Object.entries(SERVICE_CATEGORIES).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha *</label>
              <input type="date" required max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kilometraje *</label>
              <input type="number" required min={0} value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Costo (COP)</label>
              <input type="number" min={0} step={1000} value={cost} onChange={(e) => setCost(Number(e.target.value))} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Taller (opcional)</label>
              <input value={workshop} onChange={(e) => setWorkshop(e.target.value)} placeholder="Ej: Taller Mazda Autonorte" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Detalle (opcional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Aceite 0W-20 sintético + filtro" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Guardar registro
            </button>
          </div>
        </form>
      )}

      {services === null ? (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando bitácora...
        </div>
      ) : services.length === 0 ? (
        !showForm && (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-500">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Aún no hay servicios registrados. Empieza con el último cambio de aceite.
          </div>
        )
      ) : (
        <div className="space-y-2">
          {visible.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-slate-950">{SERVICE_CATEGORIES[s.category]}</div>
                <div className="text-slate-500">
                  {formatDate(s.date)} • {s.mileage.toLocaleString('es-CO')} km{s.workshop ? ` • ${s.workshop}` : ''}
                </div>
                {s.description && <div className="text-slate-700">{s.description}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-slate-950">{s.cost > 0 ? formatCOP(s.cost) : '—'}</span>
                <button
                  onClick={() => handleDelete(s)}
                  aria-label="Eliminar registro"
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {services.length > 5 && (
            <button onClick={() => setShowAll((v) => !v)} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
              {showAll ? 'Ver menos' : `Ver todo el historial (${services.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
