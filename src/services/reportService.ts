import { collection, doc, setDoc, onSnapshot, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ContentReport, ReportReason, ReportTargetType } from '../types';

const reportsRef = collection(db, 'reports');

export interface ReportTarget {
  type: ReportTargetType;
  id: string;
  parentId?: string;
  title: string;
  ownerId?: string;
}

/** Thrown when this user had already reported the same item (the rules reject the overwrite). */
export class AlreadyReportedError extends Error {}

export async function createReport(uid: string, target: ReportTarget, reason: ReportReason, details: string): Promise<void> {
  const reportId = `${target.type}_${target.id}_${uid}`;
  try {
    await setDoc(doc(reportsRef, reportId), {
      targetType: target.type,
      targetId: target.id,
      parentId: target.parentId,
      targetTitle: target.title.slice(0, 300) || 'Sin título',
      targetOwnerId: target.ownerId,
      reason,
      details: details.trim() ? details.trim().slice(0, 500) : undefined,
      reporterId: uid,
      status: 'pendiente',
      notified: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    if ((err as { code?: string })?.code === 'permission-denied') throw new AlreadyReportedError();
    throw err;
  }

  // Email the admin (server side, so nobody can abuse it to send mail). Failing here is not critical.
  fetch('/api/notify-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId }),
  }).catch(() => undefined);
}

/** Admin only: every report, newest first. */
export function subscribeToReports(
  onChange: (reports: ContentReport[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    reportsRef,
    (snapshot) => {
      const reports = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          ...(data as ContentReport),
          id: d.id,
          createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() || Date.now(),
        };
      });
      reports.sort((a, b) => b.createdAt - a.createdAt);
      onChange(reports);
    },
    onError
  );
}

export async function setReportsStatus(reportIds: string[], status: ContentReport['status']): Promise<void> {
  const batch = writeBatch(db);
  reportIds.forEach((id) => batch.update(doc(reportsRef, id), { status, reviewedAt: serverTimestamp() }));
  await batch.commit();
}
