// sitemap.xml for Google: home plus every available car, product and community.
import { listDocuments } from './_lib/firestore';

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const [listings, products, communities] = await Promise.all([
    listDocuments('vehicleListings', ['status']),
    listDocuments('products', ['name']),
    listDocuments('communities', ['name']),
  ]);

  const urls = [
    `${origin}/`,
    ...listings.filter((l) => l.status !== 'vendido').map((l) => `${origin}/?vehiculo=${l.id}`),
    ...products.map((p) => `${origin}/?producto=${p.id}`),
    ...communities.map((c) => `${origin}/?comunidad=${c.id}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
