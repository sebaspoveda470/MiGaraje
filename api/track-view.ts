// Counts one view of a vehicle listing ("Visto N veces").
// Runs with admin credentials so visitors don't need permission to change listings;
// it can only add 1 to the `views` field of an existing listing.
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request): Promise<Response> {
  const { FIREBASE_SERVICE_ACCOUNT } = process.env;
  if (!FIREBASE_SERVICE_ACCOUNT) return Response.json({ ok: false, error: 'not configured' }, { status: 500 });

  let listingId = '';
  try {
    listingId = String((await request.json())?.listingId || '');
  } catch {
    // invalid body
  }
  if (!/^[\w-]{1,100}$/.test(listingId)) return Response.json({ ok: false }, { status: 400 });

  const app = getApps()[0] || initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
  const ref = getFirestore(app).collection('vehicleListings').doc(listingId);
  try {
    // update() fails when the listing doesn't exist, so this never creates documents
    await ref.update({ views: FieldValue.increment(1) });
  } catch {
    return Response.json({ ok: true, skipped: true });
  }
  return Response.json({ ok: true });
}
