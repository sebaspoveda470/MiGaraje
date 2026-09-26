// Emails the business inbox when a user reports content.
// Called by the app after it saves a report; the report is re-read here with admin
// credentials so this endpoint can't be used to send arbitrary mail.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const TYPE_LABELS: Record<string, string> = {
  listing: 'Anuncio de vehículo',
  post: 'Publicación en Mi Comunidad',
  comment: 'Comentario en Mi Comunidad',
  review: 'Reseña de producto',
};

const REASON_LABELS: Record<string, string> = {
  estafa: 'Posible estafa',
  ofensivo: 'Contenido ofensivo',
  spam: 'Spam o publicidad',
  falso: 'Información falsa',
  otro: 'Otro motivo',
};

export async function POST(request: Request): Promise<Response> {
  const { FIREBASE_SERVICE_ACCOUNT, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT || !GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json({ ok: false, error: 'not configured' }, { status: 500 });
  }

  let reportId = '';
  try {
    reportId = String((await request.json())?.reportId || '');
  } catch {
    // invalid body
  }
  if (!/^[\w-]{1,300}$/.test(reportId)) return Response.json({ ok: false }, { status: 400 });

  const app = getApps()[0] || initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
  const ref = getFirestore(app).collection('reports').doc(reportId);
  const snap = await ref.get();
  const report = snap.data();
  if (!snap.exists || !report || report.notified) return Response.json({ ok: true, skipped: true });

  // Mark first so a double call can't send twice
  await ref.update({ notified: true });

  const mailer = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  await mailer.sendMail({
    from: `MiGaraje <${GMAIL_USER}>`,
    to: GMAIL_USER,
    subject: `Nuevo reporte: ${REASON_LABELS[report.reason] || report.reason} - ${TYPE_LABELS[report.targetType] || report.targetType}`,
    text: [
      'Un usuario reportó contenido en MiGaraje.',
      '',
      `Tipo: ${TYPE_LABELS[report.targetType] || report.targetType}`,
      `Contenido: ${report.targetTitle}`,
      `Motivo: ${REASON_LABELS[report.reason] || report.reason}`,
      report.details ? `Comentario del usuario: ${report.details}` : '',
      '',
      'Revísalo en la página: entra con tu cuenta de administrador y abre el panel de Reportes (bandera en la parte de arriba).',
    ]
      .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
      .join('\n'),
  });

  return Response.json({ ok: true });
}
