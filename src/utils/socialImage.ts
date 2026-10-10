const LOGO_BLUE = '#1E8BFB';
// Instagram shows photos up to 1080 px wide: smaller ones are enlarged a little so they don't look soft
const TARGET_WIDTH = 1080;
const MAX_UPSCALE = 1.5;

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

/**
 * One listing photo ready for social networks: the photo exactly as it is (no cropping, no text)
 * with the MiGaraje logo in the top-left corner.
 */
export async function buildWatermarkedPhoto(photoSrc: string): Promise<Blob> {
  await document.fonts.load('700 52px Montserrat').catch(() => undefined);
  const [photo, icon] = await Promise.all([loadImage(photoSrc), loadImage('/icon-192.png')]);

  const scale = Math.min(MAX_UPSCALE, Math.max(1, TARGET_WIDTH / photo.width));
  const W = Math.round(photo.width * scale);
  const H = Math.round(photo.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(photo, 0, 0, W, H);

  // Logo sized from the photo's short side, so it looks the same on tall and wide photos
  const unit = Math.min(W, H);
  const iconSize = Math.round(unit * 0.085);
  const margin = Math.round(unit * 0.035);
  const pad = Math.round(iconSize * 0.22);
  const gap = Math.round(iconSize * 0.24);
  const fontSize = Math.round(iconSize * 0.56);
  ctx.font = `700 ${fontSize}px Montserrat, sans-serif`;
  const miWidth = ctx.measureText('Mi').width;
  const wordWidth = miWidth + ctx.measureText('Garaje').width;

  // Soft dark plate behind the logo: keeps the white "Mi" readable on bright skies or white vehicles
  const plateW = pad + iconSize + gap + wordWidth + pad * 1.6;
  const plateH = iconSize + pad * 2;
  ctx.fillStyle = 'rgba(6, 10, 18, 0.55)';
  ctx.beginPath();
  ctx.roundRect(margin, margin, plateW, plateH, plateH * 0.3);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin + pad, margin + pad, iconSize, iconSize, iconSize * 0.25);
  ctx.clip();
  ctx.drawImage(icon, margin + pad, margin + pad, iconSize, iconSize);
  ctx.restore();

  ctx.textBaseline = 'middle';
  const textX = margin + pad + iconSize + gap;
  const textY = margin + pad + iconSize / 2 + fontSize * 0.04;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Mi', textX, textY);
  ctx.fillStyle = LOGO_BLUE;
  ctx.fillText('Garaje', textX + miWidth, textY);

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
