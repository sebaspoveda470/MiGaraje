import React, { useMemo, useState } from 'react';
import { X, Flag, Trash2, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { ContentReport } from '../types';
import { setReportsStatus } from '../services/reportService';
import { deleteListing } from '../services/listingService';
import { deletePost, deleteComment } from '../services/communityService';
import { deleteReview } from '../services/reviewService';
import { REASONS } from './ReportDialog';
import { useConfirm } from './ConfirmDialog';
import { timeAgo } from '../utils/media';

interface ReportsPanelProps {
  isOpen: boolean;
  reports: ContentReport[];
  onClose: () => void;
  onNotify: (message: string) => void;
  onError: (message: string, err: unknown) => void;
}

const TYPE_LABELS: Record<ContentReport['targetType'], string> = {
  listing: 'Anuncio de vehículo',
  post: 'Publicación',
  comment: 'Comentario',
  review: 'Reseña',
};

interface ReportGroup {
  key: string;
  targetType: ContentReport['targetType'];
  targetId: string;
  parentId?: string;
  title: string;
  reports: ContentReport[];
  latest: number;
}

function viewLink(group: ReportGroup): string | null {
  if (group.targetType === 'listing') return `/?vehiculo=${group.targetId}`;
  if (group.targetType === 'post' && group.parentId) return `/?comunidad=${group.parentId}`;
  if (group.targetType === 'review' && group.parentId) return `/?producto=${group.parentId}`;
  return null;
}

async function deleteTarget(group: ReportGroup): Promise<void> {
  if (group.targetType === 'listing') return deleteListing(group.targetId);
  if (group.targetType === 'post') return deletePost(group.targetId);
  if (group.targetType === 'comment' && group.parentId) return deleteComment(group.parentId, group.targetId);
  if (group.targetType === 'review') return deleteReview(group.targetId);
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ isOpen, reports, onClose, onNotify, onError }) => {
  const confirmAction = useConfirm();
  const [showClosed, setShowClosed] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // Several people can report the same item: show it once, with every reason
  const groups = useMemo(() => {
    const byTarget = new Map<string, ReportGroup>();
    reports
      .filter((r) => (showClosed ? r.status !== 'pendiente' : r.status === 'pendiente'))
      .forEach((r) => {
        const key = `${r.targetType}_${r.targetId}`;
        const group = byTarget.get(key) || {
          key,
          targetType: r.targetType,
          targetId: r.targetId,
          parentId: r.parentId,
          title: r.targetTitle,
          reports: [],
          latest: 0,
        };
        group.reports.push(r);
        group.latest = Math.max(group.latest, r.createdAt);
        byTarget.set(key, group);
      });
    return [...byTarget.values()].sort((a, b) => b.reports.length - a.reports.length || b.latest - a.latest);
  }, [reports, showClosed]);

  if (!isOpen) return null;

  const pendingCount = reports.filter((r) => r.status === 'pendiente').length;

  const handleDelete = async (group: ReportGroup) => {
    const ok = await confirmAction(`Se eliminará este ${TYPE_LABELS[group.targetType].toLowerCase()}: "${group.title}".`, {
      title: '¿Eliminar el contenido reportado?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setBusyKey(group.key);
    try {
      await deleteTarget(group);
      await setReportsStatus(group.reports.map((r) => r.id), 'resuelto');
      onNotify('Contenido eliminado y reporte resuelto');
    } catch (err) {
      onError('No se pudo eliminar el contenido (puede que ya no exista).', err);
    } finally {
      setBusyKey(null);
    }
  };

  const handleDismiss = async (group: ReportGroup) => {
    setBusyKey(group.key);
    try {
      await setReportsStatus(group.reports.map((r) => r.id), 'descartado');
      onNotify('Reporte descartado');
    } catch (err) {
      onError('No se pudo actualizar el reporte.', err);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full sm:max-w-xl h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Reportes</h3>
              <p className="text-[11px] text-slate-500">{pendingCount} pendientes • solo tú ves esta sección</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar reportes"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-b border-slate-200 flex gap-1.5">
          {[false, true].map((closed) => (
            <button
              key={String(closed)}
              onClick={() => setShowClosed(closed)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                showClosed === closed ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {closed ? 'Revisados' : `Pendientes (${pendingCount})`}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
          {groups.length === 0 && (
            <div className="text-center py-16 text-xs text-slate-500">
              {showClosed ? 'Aún no has revisado reportes.' : '🎉 No hay reportes pendientes.'}
            </div>
          )}

          {groups.map((group) => {
            const link = viewLink(group);
            const busy = busyKey === group.key;
            return (
              <div key={group.key} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{TYPE_LABELS[group.targetType]}</div>
                    <div className="font-bold text-slate-950 text-sm break-words">"{group.title}"</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Último reporte {timeAgo(group.latest)}</div>
                  </div>
                  <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                    {group.reports.length} {group.reports.length === 1 ? 'reporte' : 'reportes'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.reports.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900">{REASONS.find((x) => x.id === r.reason)?.label || r.reason}</span>
                      {r.details && <span className="text-slate-600">: {r.details}</span>}
                    </div>
                  ))}
                </div>

                {!showClosed && (
                  <div className="flex flex-wrap items-center gap-2">
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver
                      </a>
                    )}
                    <button
                      onClick={() => handleDismiss(group)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Está bien, descartar
                    </button>
                    <button
                      onClick={() => handleDelete(group)}
                      disabled={busy}
                      className="ml-auto px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Eliminar contenido
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
