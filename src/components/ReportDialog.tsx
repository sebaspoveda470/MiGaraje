import React, { createContext, useCallback, useContext, useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { ReportReason } from '../types';
import { createReport, ReportTarget, AlreadyReportedError } from '../services/reportService';

export const REASONS: { id: ReportReason; label: string; hint: string }[] = [
  { id: 'estafa', label: 'Posible estafa', hint: 'Piden anticipos, precio irreal, vehículo que no existe' },
  { id: 'ofensivo', label: 'Contenido ofensivo', hint: 'Insultos, acoso o lenguaje inapropiado' },
  { id: 'spam', label: 'Spam o publicidad', hint: 'Publicidad que no tiene que ver con el tema' },
  { id: 'falso', label: 'Información falsa', hint: 'Datos engañosos o reseña falsa' },
  { id: 'otro', label: 'Otro motivo', hint: 'Cuéntanos qué pasa' },
];

type OpenReport = (target: ReportTarget) => void;

const ReportContext = createContext<OpenReport | null>(null);

/** Returns a function that opens the "Reportar" dialog for an item. */
export function useReport(): OpenReport {
  const fn = useContext(ReportContext);
  if (!fn) throw new Error('useReport must be used inside <ReportProvider>');
  return fn;
}

interface ReportProviderProps {
  currentUserId: string | null;
  requireAuth: () => boolean;
  onDone: (message: string, isError?: boolean) => void;
  children: React.ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ currentUserId, requireAuth, onDone, children }) => {
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [reason, setReason] = useState<ReportReason>('estafa');
  const [details, setDetails] = useState('');
  const [isSending, setIsSending] = useState(false);

  const open = useCallback<OpenReport>(
    (t) => {
      if (!requireAuth()) return;
      setTarget(t);
      setReason(t.type === 'listing' ? 'estafa' : t.type === 'review' ? 'falso' : 'ofensivo');
      setDetails('');
    },
    [requireAuth]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !currentUserId) return;
    setIsSending(true);
    try {
      await createReport(currentUserId, target, reason, details);
      onDone('Gracias por avisarnos. Revisaremos el reporte pronto.');
      setTarget(null);
    } catch (err) {
      if (err instanceof AlreadyReportedError) {
        onDone('Ya habías reportado esto. Lo estamos revisando.');
        setTarget(null);
      } else {
        console.error(err);
        onDone('No se pudo enviar el reporte. Inténtalo de nuevo.', true);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ReportContext.Provider value={open}>
      {children}
      {target && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setTarget(null)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Reportar contenido</h3>
                  <p className="text-slate-500 line-clamp-2">"{target.title}"</p>
                </div>
              </div>
              <button type="button" onClick={() => setTarget(null)} aria-label="Cerrar" className="text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900">¿Qué está pasando?</div>
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer ${
                    reason === r.id ? 'border-red-400 bg-red-50/60' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)} className="mt-0.5 accent-red-600" />
                  <span>
                    <span className="block font-bold text-slate-900">{r.label}</span>
                    <span className="block text-slate-500">{r.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Cuéntanos más (opcional)</label>
              <textarea
                rows={3}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ej: me pidió consignar un anticipo antes de ver el carro"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <p className="text-[11px] text-slate-500">Tu reporte es anónimo: la persona reportada no sabrá quién fue.</p>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setTarget(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                Enviar reporte
              </button>
            </div>
          </form>
        </div>
      )}
    </ReportContext.Provider>
  );
};
