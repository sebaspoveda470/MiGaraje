import React from 'react';
import { ShieldCheck, AlertTriangle, CalendarPlus, CalendarClock, ExternalLink } from 'lucide-react';
import { Vehicle } from '../types';
import { getVehicleDocs, describeDoc, formatExpiry, probablyExemptFromTecno, DocState } from '../utils/vehicleDocs';

const STATE_STYLES: Record<DocState, { box: string; text: string; badge: string; badgeLabel: string }> = {
  vencido: { box: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-600 text-white', badgeLabel: 'Vencido' },
  por_vencer: { box: 'bg-amber-50 border-amber-200', text: 'text-amber-800', badge: 'bg-amber-500 text-white', badgeLabel: 'Por vencer' },
  vigente: { box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-600 text-white', badgeLabel: 'Vigente' },
  sin_fecha: { box: 'bg-slate-50 border-slate-200 border-dashed', text: 'text-slate-500', badge: 'bg-slate-200 text-slate-600', badgeLabel: 'Sin fecha' },
};

/**
 * SOAT and technical inspection status with reminders for one vehicle.
 */
export const VehicleDocsCard: React.FC<{ vehicle: Vehicle; onEdit?: () => void }> = ({ vehicle, onEdit }) => {
  const docs = getVehicleDocs(vehicle);
  const needsAttention = docs.some((d) => d.state === 'vencido' || d.state === 'por_vencer');

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase mb-1">
            <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
            <span>Documentos del Vehículo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">SOAT y Revisión Técnico-Mecánica</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Te avisamos aquí cuando falten 30 días o menos para que venzan. Conducir sin ellos genera multas e inmovilización.
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="shrink-0 flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-blue-400" />
            Actualizar fechas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docs.map((doc) => {
          const style = STATE_STYLES[doc.state];
          const exemptHint = doc.kind === 'tecno' && doc.state === 'sin_fecha' && probablyExemptFromTecno(vehicle);
          return (
            <div key={doc.kind} className={`p-4 rounded-2xl border ${style.box} space-y-1.5`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  {doc.state === 'vencido' || doc.state === 'por_vencer' ? (
                    <AlertTriangle className={`w-4 h-4 ${style.text}`} />
                  ) : (
                    <ShieldCheck className={`w-4 h-4 ${style.text}`} />
                  )}
                  {doc.label}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${style.badge}`}>{style.badgeLabel}</span>
              </div>
              <div className={`text-base font-black ${style.text}`}>{describeDoc(doc)}</div>
              <div className="text-[11px] text-slate-500">
                {doc.expiry ? `Fecha de vencimiento: ${formatExpiry(doc.expiry)}` : 'Agrega la fecha para recibir el recordatorio.'}
              </div>
              {exemptHint && (
                <div className="text-[11px] text-slate-500">
                  Los carros particulares hacen su primera revisión 5 años después de matriculados; si es tu caso, aún no la necesitas.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>{needsAttention ? 'Renueva a tiempo para evitar multas.' : 'Verifica siempre tus fechas oficiales en el RUNT.'}</span>
        <a
          href="https://www.runt.gov.co/actores/ciudadano/consulta-de-vehiculos-por-placa"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          Consultar en el RUNT <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
