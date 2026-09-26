// Minimal read-only Firestore access for Vercel functions, through the public REST API.
// Only collections that firestore.rules marks as publicly readable work here.
import firebaseConfig from '../../firebase-applet-config.json';

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

type FirestoreValue = Record<string, any>;

function parseValue(value: FirestoreValue): any {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(parseValue);
  if ('mapValue' in value) return parseFields(value.mapValue.fields || {});
  return null;
}

function parseFields(fields: Record<string, FirestoreValue>): Record<string, any> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, parseValue(value)]));
}

/** Reads one document, or returns null when it doesn't exist / isn't public. */
export async function getDocument(path: string): Promise<Record<string, any> | null> {
  const res = await fetch(`${BASE}/${path}?key=${firebaseConfig.apiKey}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.fields ? parseFields(json.fields) : null;
}

/** Lists the ids (plus the requested small fields) of a collection, following pagination. */
export async function listDocuments(collection: string, fields: string[]): Promise<Array<{ id: string } & Record<string, any>>> {
  const out: Array<{ id: string } & Record<string, any>> = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({ key: firebaseConfig.apiKey, pageSize: '300' });
    fields.forEach((f) => params.append('mask.fieldPaths', f));
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${BASE}/${collection}?${params}`);
    if (!res.ok) break;
    const json = await res.json();
    for (const doc of json.documents || []) {
      out.push({ id: doc.name.split('/').pop(), ...parseFields(doc.fields || {}) });
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return out;
}

export type ShareType = 'vehiculo' | 'producto' | 'comunidad';

export const COLLECTION_FOR: Record<ShareType, string> = {
  vehiculo: 'vehicleListings',
  producto: 'products',
  comunidad: 'communities',
};

/** The main image of an item (may be a data: URL or a normal URL). */
export function mainImage(type: ShareType, data: Record<string, any>): string | undefined {
  if (type === 'vehiculo') return data.images?.[0];
  if (type === 'producto') return data.images?.[0] || data.image;
  return data.logo;
}
