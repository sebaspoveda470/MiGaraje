import { Vehicle } from '../types';

export type DocKind = 'soat' | 'tecno';

export type DocState = 'sin_fecha' | 'vencido' | 'por_vencer' | 'vigente';

export interface DocStatus {
  kind: DocKind;
  label: string;
  state: DocState;
  /** Days until expiry; negative when already expired */
  daysLeft: number | null;
  expiry?: string;
}

/** Warn this many days before a document expires */
export const WARNING_DAYS = 30;

const LABELS: Record<DocKind, string> = { soat: 'SOAT', tecno: 'Revisión Técnico-Mecánica' };

function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  const expiry = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / 86400000);
}

export function getDocStatus(vehicle: Vehicle, kind: DocKind): DocStatus {
  const expiry = kind === 'soat' ? vehicle.soatExpiry : vehicle.tecnoExpiry;
  if (!expiry) return { kind, label: LABELS[kind], state: 'sin_fecha', daysLeft: null };
  const daysLeft = daysUntil(expiry);
  const state: DocState = daysLeft < 0 ? 'vencido' : daysLeft <= WARNING_DAYS ? 'por_vencer' : 'vigente';
  return { kind, label: LABELS[kind], state, daysLeft, expiry };
}

export function getVehicleDocs(vehicle: Vehicle): DocStatus[] {
  return [getDocStatus(vehicle, 'soat'), getDocStatus(vehicle, 'tecno')];
}

/** Documents that need attention (expired or expiring soon) across all vehicles */
export function getDocAlerts(vehicles: Vehicle[]): Array<{ vehicle: Vehicle; doc: DocStatus }> {
  return vehicles.flatMap((vehicle) =>
    getVehicleDocs(vehicle)
      .filter((doc) => doc.state === 'vencido' || doc.state === 'por_vencer')
      .map((doc) => ({ vehicle, doc }))
  );
}

export function formatExpiry(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function describeDoc(doc: DocStatus): string {
  if (doc.state === 'sin_fecha' || doc.daysLeft === null) return 'Sin fecha registrada';
  if (doc.daysLeft < 0) {
    const days = Math.abs(doc.daysLeft);
    return `Vencido hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
  if (doc.daysLeft === 0) return 'Vence hoy';
  return `Vence en ${doc.daysLeft} ${doc.daysLeft === 1 ? 'día' : 'días'}`;
}

/**
 * Private vehicles in Colombia take their first technical inspection 5 years after registration.
 * We only know the model year, so this is an approximation shown as a hint.
 */
export function probablyExemptFromTecno(vehicle: Vehicle): boolean {
  return new Date().getFullYear() - vehicle.year < 5;
}
