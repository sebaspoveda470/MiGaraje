// Returns the main photo of a car, product or community as a real image file.
// Photos are stored as data: URLs inside Firestore, which WhatsApp/Facebook can't read.
import { getDocument, COLLECTION_FOR, ShareType, mainImage } from './_lib/firestore.js';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') as ShareType | null;
  const id = url.searchParams.get('id') || '';
  if (!type || !(type in COLLECTION_FOR) || !/^[\w-]{1,100}$/.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  const data = await getDocument(`${COLLECTION_FOR[type]}/${id}`);
  const image = data ? mainImage(type, data) : undefined;
  if (!image) return new Response('Not found', { status: 404 });

  if (/^https?:\/\//.test(image)) {
    return Response.redirect(image, 302);
  }

  const match = /^data:(image\/[\w.+-]+);base64,(.+)$/.exec(image);
  if (!match) return new Response('Not found', { status: 404 });

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
