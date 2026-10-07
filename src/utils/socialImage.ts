import { VehicleListing } from '../types';

// Instagram / Facebook portrait post
const W = 1080;
const H = 1350;
const M = 72;
const BLUE = '#0070e0';
const LOGO_BLUE = '#1E8BFB';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Needed to export the canvas when the photo comes from another site (reference photos)
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la foto'));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !line) line = trial;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[.,;:]?$/, '')}…`;
    return kept;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Builds the picture the admin posts on social networks for a listing: its main photo with the
 * MiGaraje logo, the vehicle's name, price, city, year and mileage. No phone number on it.
 */
export async function buildListingSocialImage(car: VehicleListing, photoSrc: string): Promise<Blob> {
  // The page's own fonts, so the picture matches the site
  await Promise.all([
    document.fonts.load('600 96px Fraunces'),
    document.fonts.load('700 64px "Plus Jakarta Sans"'),
    document.fonts.load('500 40px "Plus Jakarta Sans"'),
    document.fonts.load('700 52px Montserrat'),
  ]).catch(() => undefined);

  const [photo, icon] = await Promise.all([loadImage(photoSrc), loadImage('/icon-192.png')]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');

  // Background: a blurred, darkened copy fills the frame; the whole photo sits on top, uncropped,
  // so no part of the vehicle is cut whatever the photo's shape.
  const coverScale = Math.max(W / photo.width, H / photo.height);
  ctx.filter = 'blur(40px) brightness(0.55)';
  ctx.drawImage(photo, (W - photo.width * coverScale) / 2, (H - photo.height * coverScale) / 2, photo.width * coverScale, photo.height * coverScale);
  ctx.filter = 'none';

  // The photo fills a rounded frame. Tall photos are cropped a little above and below,
  // keeping the lower-middle part, which is where the vehicle usually is.
  const frame = { x: 36, y: 184, w: W - 72, h: 620 };
  const fill = Math.max(frame.w / photo.width, frame.h / photo.height);
  const pw = photo.width * fill;
  const ph = photo.height * fill;
  ctx.save();
  roundRect(ctx, frame.x, frame.y, frame.w, frame.h, 40);
  ctx.clip();
  ctx.drawImage(photo, frame.x + (frame.w - pw) / 2, frame.y + (frame.h - ph) * 0.62, pw, ph);
  ctx.restore();

  // Dark fades behind the logo and the text
  const top = ctx.createLinearGradient(0, 0, 0, 260);
  top.addColorStop(0, 'rgba(6,10,18,0.75)');
  top.addColorStop(1, 'rgba(6,10,18,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 260);
  const bottom = ctx.createLinearGradient(0, 820, 0, H);
  bottom.addColorStop(0, 'rgba(6,10,18,0)');
  bottom.addColorStop(0.35, 'rgba(6,10,18,0.82)');
  bottom.addColorStop(1, 'rgba(6,10,18,0.96)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 820, W, H - 820);

  // Logo
  const iconSize = 92;
  ctx.save();
  roundRect(ctx, M, 60, iconSize, iconSize, 23);
  ctx.clip();
  ctx.drawImage(icon, M, 60, iconSize, iconSize);
  ctx.restore();
  ctx.textBaseline = 'middle';
  ctx.font = '700 52px Montserrat, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Mi', M + iconSize + 22, 60 + iconSize / 2 + 2);
  ctx.fillStyle = LOGO_BLUE;
  ctx.fillText('Garaje', M + iconSize + 22 + ctx.measureText('Mi').width, 60 + iconSize / 2 + 2);

  // "En venta" tag, top right
  ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
  const tag = 'EN VENTA';
  const tagW = ctx.measureText(tag).width + 56;
  ctx.fillStyle = BLUE;
  roundRect(ctx, W - M - tagW, 74, tagW, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(tag, W - M - tagW + 28, 74 + 33);

  // Bottom block, built upwards: button, details, price, name
  ctx.textBaseline = 'alphabetic';
  const cta = 'Míralo en MiGaraje · enlace en el perfil';
  ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
  const pillW = ctx.measureText(cta).width + 88;
  const pillBottom = H - 76;
  ctx.fillStyle = BLUE;
  roundRect(ctx, M, pillBottom - 84, pillW, 84, 42);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(cta, M + 44, pillBottom - 41);
  ctx.textBaseline = 'alphabetic';

  let y = pillBottom - 84 - 46;
  const details = [car.city || car.location, String(car.year), `${car.mileage.toLocaleString('es-CO')} km`, car.specs?.transmission]
    .filter(Boolean)
    .join('  ·  ');
  ctx.font = '500 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(235,238,243,0.92)';
  ctx.fillText(details, M, y);

  y -= 70;
  const price = `$${car.price.toLocaleString('es-CO')}`;
  ctx.font = '600 118px Fraunces, Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(price, M, y);
  const priceW = ctx.measureText(price).width;
  ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#bedeff';
  ctx.fillText('COP', M + priceW + 16, y - 4);

  y -= 138;
  ctx.font = '700 60px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  const nameLines = wrapText(ctx, car.title, W - 2 * M, 2);
  for (let i = nameLines.length - 1; i >= 0; i--) {
    ctx.fillText(nameLines[i], M, y);
    y -= 72;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo crear la imagen'))), 'image/jpeg', 0.92);
  });
}

/** Saves a generated picture to the device's downloads. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
