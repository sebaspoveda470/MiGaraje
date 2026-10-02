// Emails the author of a community post when someone else answers it.
// Called by the app after it saves a comment. The post and the comment are re-read here with
// admin credentials, so this endpoint can't be used to send arbitrary mail, and each comment
// notifies at most once.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trim()}…` : text);

export async function POST(request: Request): Promise<Response> {
  const { FIREBASE_SERVICE_ACCOUNT, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT || !GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json({ ok: false, error: 'not configured' }, { status: 500 });
  }

  let postId = '';
  let commentId = '';
  try {
    const body = await request.json();
    postId = String(body?.postId || '');
    commentId = String(body?.commentId || '');
  } catch {
    // invalid body
  }
  if (!/^[\w-]{1,100}$/.test(postId) || !/^[\w-]{1,100}$/.test(commentId)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const app = getApps()[0] || initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
  const db = getFirestore(app);
  const postRef = db.collection('communityPosts').doc(postId);
  const commentRef = postRef.collection('comments').doc(commentId);
  const [postSnap, commentSnap] = await Promise.all([postRef.get(), commentRef.get()]);
  const post = postSnap.data();
  const comment = commentSnap.data();
  if (!post || !comment || comment.notified) return Response.json({ ok: true, skipped: true });

  // Mark first so a double call can't send twice
  await commentRef.update({ notified: true });

  // Nobody needs an email about their own answer
  if (comment.authorId === post.authorId) return Response.json({ ok: true, skipped: true });

  const author = (await db.collection('users').doc(String(post.authorId)).get()).data();
  // Same switch as the SOAT reminders: "Recordatorios y avisos por correo" in the profile
  if (!author?.email || author.emailReminders === false) return Response.json({ ok: true, skipped: true });

  const firstName = String(author.fullName || '').split(' ')[0] || 'Hola';
  const mailer = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  // Plain text and no links: mails with *.vercel.app links were silently filtered by Gmail
  await mailer.sendMail({
    from: `MiGaraje <${GMAIL_USER}>`,
    to: author.email,
    subject: `${comment.authorName} respondió tu publicación en MiGaraje`,
    text: [
      `${firstName}, ${comment.authorName} respondió tu publicación en Mi Comunidad:`,
      '',
      `Tu publicación: "${clip(String(post.title || ''), 120)}"`,
      '',
      `Respuesta de ${comment.authorName}${comment.authorCar ? ` (${comment.authorCar})` : ''}:`,
      `"${clip(String(comment.content || ''), 500)}"`,
      '',
      'Para leerla completa y contestar, entra a MiGaraje y abre la sección Mi Comunidad.',
      '',
      'Si no quieres recibir estos avisos, desactívalos en tu perfil de MiGaraje (Recordatorios y avisos por correo).',
    ].join('\n'),
  });

  return Response.json({ ok: true });
}
