// Serves index.html with item-specific <title> and Open Graph tags, so links shared on
// WhatsApp/Facebook show the car or product photo, and Google can index each item.
// vercel.json routes "/?vehiculo=…", "/?producto=…" and "/?comunidad=…" here.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument, COLLECTION_FOR, ShareType, mainImage } from './_lib/firestore.js';

/**
 * The built index.html (bundled with this function via vercel.json → includeFiles).
 * Falls back to the public production site, never to a protected preview URL.
 */
async function loadIndexHtml(origin: string): Promise<string> {
  try {
    return await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const res = await fetch(`${production ? `https://${production}` : origin}/index.html`);
    return res.text();
  }
}

const TYPES: ShareType[] = ['vehiculo', 'producto', 'comunidad'];

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cop = (value: number) => `$${Number(value || 0).toLocaleString('es-CO')}`;

function describe(type: ShareType, data: Record<string, any>): { title: string; description: string } {
  if (type === 'vehiculo') {
    const sold = data.status === 'vendido' ? ' (VENDIDO)' : '';
    const details = [data.city, data.year, data.mileage != null ? `${Number(data.mileage).toLocaleString('es-CO')} km` : null]
      .filter(Boolean)
      .join(' • ');
    return {
      title: `${data.title} - ${cop(data.price)}${sold} | MiGaraje`,
      description: `${details}. ${data.description || 'Vehículo en venta en MiGaraje. Contacta directo al vendedor por WhatsApp.'}`.slice(0, 200),
    };
  }
  if (type === 'producto') {
    return {
      title: `${data.name} - ${cop(data.price)} | MiGaraje`,
      description: (data.description || 'Producto oficial MiGaraje. Pídelo por WhatsApp.').slice(0, 200),
    };
  }
  return {
    title: `${data.name} | Mi Comunidad MiGaraje`,
    description: (data.description || 'Únete a esta comunidad de propietarios en MiGaraje.').slice(0, 200),
  };
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = url.origin;
  let html = await loadIndexHtml(origin);

  const type = TYPES.find((t) => url.searchParams.get(t));
  const id = type ? url.searchParams.get(type)! : null;
  const data = type && id && /^[\w-]{1,100}$/.test(id) ? await getDocument(`${COLLECTION_FOR[type]}/${id}`) : null;

  if (type && id && data) {
    const { title, description } = describe(type, data);
    const pageUrl = `${origin}/?${type}=${encodeURIComponent(id)}`;
    const image = mainImage(type, data) ? `${origin}/api/og-image?type=${type}&id=${encodeURIComponent(id)}` : null;

    const tags = [
      `<title>${escapeHtml(title)}</title>`,
      `<meta name="description" content="${escapeHtml(description)}" />`,
      `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`,
      `<meta property="og:type" content="${type === 'comunidad' ? 'website' : 'product'}" />`,
      `<meta property="og:site_name" content="MiGaraje" />`,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
      `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
      image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '',
      `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    ]
      .filter(Boolean)
      .join('\n    ');

    // Drop the generic tags and put the item's tags at the top of <head>
    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, '')
      .replace(/<meta\s+(name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gi, '')
      .replace(/<head>/i, `<head>\n    ${tags}`);
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
