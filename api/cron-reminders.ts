// Daily job (vercel.json → crons): emails SOAT / técnico-mecánica reminders.
//
// Needs three environment variables in Vercel (Settings → Environment Variables):
//   FIREBASE_SERVICE_ACCOUNT  JSON key of a Firebase service account (reads every user's garage)
//   GMAIL_USER                migaraje.co@gmail.com
//   GMAIL_APP_PASSWORD        16-letter "app password" of that Gmail account
// Vercel sends "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

type DocKind = 'soat' | 'tecno';

const LABELS: Record<DocKind, string> = { soat: 'SOAT', tecno: 'Revisión Técnico-Mecánica' };

/** Days before expiry when a reminder goes out (a missed day is caught up the next run). */
const THRESHOLDS = [30, 7, 0];


function daysUntil(isoDate: string, today: Date): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - today.getTime()) / 86400000);
}

function colombiaToday(): Date {
  // Colombia is UTC-5 all year
  const now = new Date(Date.now() - 5 * 3600 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function describe(days: number): string {
  if (days < 0) return `venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
  if (days === 0) return 'vence HOY';
  return `vence en ${days} ${days === 1 ? 'día' : 'días'}`;
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { FIREBASE_SERVICE_ACCOUNT, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT || !GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json({ ok: false, error: 'Faltan variables de entorno para enviar recordatorios' }, { status: 500 });
  }

  const app = getApps()[0] || initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
  const db = getFirestore(app);
  const mailer = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });

  const today = colombiaToday();
  let emailsSent = 0;
  const errors: string[] = [];

  const users = await db.collection('users').get();
  for (const userDoc of users.docs) {
    const user = userDoc.data();
    if (!user.email || user.emailReminders === false) continue;

    const vehicles = await userDoc.ref.collection('vehicles').get();
    const due: Array<{ vehicleName: string; label: string; days: number; expiry: string }> = [];
    const markSent: Array<() => Promise<unknown>> = [];

    for (const vehicleDoc of vehicles.docs) {
      const vehicle = vehicleDoc.data();
      // Reminder bookkeeping lives outside the vehicle document, which the app overwrites on edit
      const stateRef = userDoc.ref.collection('reminders').doc(vehicleDoc.id);
      const sent: Record<string, boolean> = (await stateRef.get()).data()?.sent || {};
      const newlySent: Record<string, boolean> = {};

      for (const kind of ['soat', 'tecno'] as DocKind[]) {
        const expiry: string | undefined = kind === 'soat' ? vehicle.soatExpiry : vehicle.tecnoExpiry;
        if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) continue;
        const days = daysUntil(expiry, today);
        const pending = THRESHOLDS.filter((t) => days <= t && !sent[`${kind}-${expiry}-${t}`]);
        if (pending.length === 0 || days < -7) continue; // stop nagging a week after expiry

        due.push({ vehicleName: `${vehicle.brand} ${vehicle.model}${vehicle.plate ? ` (${vehicle.plate})` : ''}`, label: LABELS[kind], days, expiry });
        pending.forEach((t) => (newlySent[`${kind}-${expiry}-${t}`] = true));
      }

      if (Object.keys(newlySent).length > 0) {
        markSent.push(() => stateRef.set({ sent: { ...sent, ...newlySent } }, { merge: true }));
      }
    }

    if (due.length === 0) continue;

    const firstName = String(user.fullName || '').split(' ')[0] || '';
    const lines = due.map((d) => `- ${d.label} de tu ${d.vehicleName}: ${describe(d.days)} (fecha: ${d.expiry})`);
    const subject =
      due.length === 1
        ? `Tu ${due[0].label} ${describe(due[0].days)} - MiGaraje`
        : `Tienes ${due.length} documentos por renovar - MiGaraje`;

    try {
      // Plain text and no links: automated emails with *.vercel.app links tend to be filtered by Gmail
      await mailer.sendMail({
        from: `MiGaraje <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to: user.email,
        subject,
        text: [
          `Hola${firstName ? ` ${firstName}` : ''},`,
          '',
          'Te escribimos de MiGaraje para recordarte:',
          '',
          ...lines,
          '',
          'Renueva a tiempo para evitar multas e inmovilización del vehículo.',
          'Puedes ver el detalle en Mi Garaje, dentro de tu cuenta de MiGaraje.',
          '',
          'Si no quieres recibir estos recordatorios, desactívalos en tu perfil (Editar perfil) o responde a este correo.',
          '',
          'Equipo MiGaraje',
        ].join('\n'),
      });
      await Promise.all(markSent.map((fn) => fn()));
      emailsSent++;
    } catch (err) {
      console.error(`No se pudo enviar el recordatorio a ${userDoc.id}`, err);
      errors.push(`${userDoc.id}: ${(err as Error).message}`);
    }
  }

  // Visible in Vercel → Logs
  console.log(`Recordatorios: ${emailsSent} correo(s) enviado(s), ${errors.length} error(es)`, errors);
  return Response.json({ ok: errors.length === 0, emailsSent, errors });
}
