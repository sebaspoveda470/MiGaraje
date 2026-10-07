import React, { useEffect, useState } from 'react';
import { Star, ImageDown, Loader2 } from 'lucide-react';
import { X, MapPin, MessageCircle, CircleCheck, CircleX, RotateCcw, User, Heart, Pencil, Flag, Phone, Clock, ShieldCheck, FileCheck, UserCheck } from 'lucide-react';
import { VehicleListing } from '../types';
import { PhotoGallery } from './PhotoPicker';
import { ShareButtons } from './ShareButtons';
import { getListingPhotos } from '../services/listingService';
import { timeAgo, toWhatsAppNumber } from '../utils/media';
import { useReport } from './ReportDialog';
import { buildListingSocialImage, downloadBlob } from '../utils/socialImage';

interface VehicleDetailModalProps {
  car: VehicleListing;
  isSold: boolean;
  canManage: boolean;
  whatsAppLink: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onToggleSold: () => void;
  onClose: () => void;
  /** Admin tools: feature the listing and download its picture for social networks */
  isAdmin?: boolean;
  /** Millis until which the listing is featured (undefined = not featured) */
  featuredUntil?: number;
  onSetFeatured?: (days: number | null) => void;
  onNotify?: (message: string, isError?: boolean) => void;
}

const formatCOP = (value: number) => `$${value.toLocaleString('es-CO')}`;

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <dt className="text-slate-500">{label}</dt>
    <dd className="font-bold text-slate-900 text-right">{value}</dd>
  </div>
);

const DocCheck: React.FC<{ ok?: boolean; label: string }> = ({ ok, label }) => (
  <div className={`flex items-center gap-2 ${ok ? 'text-slate-900' : 'text-slate-400'}`}>
    {ok ? <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" /> : <CircleX className="w-4 h-4 shrink-0" />}
    <span className="font-semibold">{label}</span>
  </div>
);

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  car,
  isSold,
  canManage,
  whatsAppLink,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onToggleSold,
  onClose,
  isAdmin,
  featuredUntil,
  onSetFeatured,
  onNotify,
}) => {
  const [photos, setPhotos] = useState<string[]>(car.images);
  const [isBuildingImage, setIsBuildingImage] = useState(false);
  const isFeatured = !!featuredUntil && !isSold;

  const handleSocialImage = async () => {
    setIsBuildingImage(true);
    try {
      const blob = await buildListingSocialImage(car, photos[0] || car.images[0]);
      downloadBlob(blob, `MiGaraje - ${car.title.replace(/[^\w\sáéíóúñÁÉÍÓÚÑ-]/g, '').trim()}.jpg`);
      onNotify?.('Imagen descargada. Búscala en tu carpeta de Descargas.');
    } catch (err) {
      console.error(err);
      onNotify?.('No se pudo crear la imagen con esta foto. Intenta de nuevo.', true);
    } finally {
      setIsBuildingImage(false);
    }
  };
  const report = useReport();

  // Extra photos live in their own documents; load them when the listing opens
  useEffect(() => {
    let cancelled = false;
    setPhotos(car.images);
    getListingPhotos(car)
      .then((all) => !cancelled && setPhotos(all))
      .catch((err) => console.error('No se pudieron cargar todas las fotos', err));
    return () => {
      cancelled = true;
    };
  }, [car.id]);

  const plateLabel = car.plateEnding ? `Placa termina en ${car.plateEnding}${car.plateCity ? ` · ${car.plateCity}` : ''}` : null;

  // Calling uses the same number buyers write to on WhatsApp
  const callNumber = toWhatsAppNumber(car.sellerPhone || car.whatsappNumber);
  const callLink = callNumber ? `tel:+${callNumber}` : null;

  // "Este vehículo cuenta con": only what the seller declared
  const highlights = [
    car.isUniqueOwner && { icon: UserCheck, label: 'Único dueño' },
    car.soatValid && { icon: ShieldCheck, label: 'SOAT vigente' },
    car.tecnoValid && { icon: FileCheck, label: 'Tecnomecánica al día' },
  ].filter(Boolean) as { icon: typeof UserCheck; label: string }[];

  const contactButtons = (size: 'bar' | 'panel') =>
    isSold ? (
      <div className={`text-center bg-slate-100 text-slate-500 font-bold text-sm px-6 py-3.5 rounded-full border border-slate-200 ${size === 'bar' ? 'flex-1 sm:flex-none sm:ml-auto' : 'w-full'}`}>
        Vehículo vendido
      </div>
    ) : (
      <div className={`flex gap-2 ${size === 'bar' ? 'flex-1 sm:flex-none sm:ml-auto' : 'flex-col'}`}>
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm px-5 py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2 ${size === 'bar' ? 'flex-1 sm:flex-none' : 'w-full'}`}
        >
          <MessageCircle className="w-5 h-5" />
          {size === 'bar' ? 'WhatsApp' : 'Escribir por WhatsApp'}
        </a>
        {callLink && (
          <a
            href={callLink}
            className={`bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 border border-slate-300 font-black text-sm px-5 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 ${size === 'bar' ? 'flex-1 sm:flex-none' : 'w-full'}`}
          >
            <Phone className="w-4 h-4 text-blue-600" />
            {size === 'bar' ? 'Llamar' : 'Llamar al vendedor'}
          </a>
        )}
      </div>
    );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white sm:border sm:border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-3xl lg:max-w-6xl w-full shadow-2xl overflow-hidden relative max-h-[94dvh] sm:max-h-[92dvh] lg:h-[88dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phones and tablets: one scrolling column. Computers: photos on the left, details on the right. */}
        <div className="overflow-y-auto flex-1 min-h-0 lg:overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Photos: nothing on top of them except the counter */}
          <div className="p-3 sm:p-4 pb-0 sm:pb-0 lg:p-5 lg:overflow-y-auto lg:bg-slate-50">
            <PhotoGallery key={car.id} images={photos} alt={car.title} aspectClass="aspect-4/3 sm:aspect-16/10 lg:aspect-4/3" fit="contain" />
          </div>

          <div className="p-5 sm:p-7 lg:pt-14 space-y-6 lg:overflow-y-auto lg:border-l lg:border-slate-200">
            {/* Title, price and share */}
            <div className="space-y-3">
              {(isSold || isFeatured || plateLabel || car.isUniqueOwner) && (
                <div className="flex flex-wrap gap-1.5">
                  {isSold && <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full">VENDIDO</span>}
                  {isFeatured && (
                    <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-950" /> Destacado
                    </span>
                  )}
                  {plateLabel && (
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                      {plateLabel}
                    </span>
                  )}
                  {car.isUniqueOwner && (
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                      Único dueño
                    </span>
                  )}
                </div>
              )}

              <h2 className="font-sans text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight leading-tight">{car.title}</h2>
              <p className="hidden lg:block text-xs text-slate-500">
                Publicado por: <span className="font-bold text-blue-700">{car.sellerName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {car.city || car.location}
                </span>
                <span>•</span>
                <span>{car.year}</span>
                <span>•</span>
                <span>{car.mileage.toLocaleString('es-CO')} km</span>
              </div>

              <div className="flex items-end justify-between gap-3 pt-1">
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Precio</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                    {formatCOP(car.price)} <span className="text-xs text-slate-500 font-normal">COP</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-600 fill-rose-600' : 'text-slate-600'}`} />
                  </button>
                  <ShareButtons
                    type="vehiculo"
                    id={car.id}
                    text={`Mira este ${car.title} en venta por ${formatCOP(car.price)} en MiGaraje:`}
                    iconsOnly
                  />
                </div>
              </div>
            </div>

            {/* Computers: what it includes, when/where, phone and contact buttons right under the price */}
            <div className="hidden lg:block space-y-5">
              {highlights.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-200">Este vehículo cuenta con:</div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {highlights.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 text-center w-24">
                        <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Publicado {timeAgo(car.createdAt).toLowerCase()}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> {car.city || car.location}
                </div>
                {!isSold && car.sellerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Teléfono: <span className="font-bold text-slate-950">{car.sellerPhone}</span>
                  </div>
                )}
              </div>
              {contactButtons('panel')}
            </div>

            {/* Description */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-slate-950">Descripción</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {car.description || 'El vendedor no agregó una descripción. Escríbele por WhatsApp para más detalles.'}
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {/* Specs */}
              <section className="space-y-1">
                <h3 className="text-sm font-black text-slate-950">Ficha técnica</h3>
                <dl className="text-xs">
                  <Row label="Año" value={car.year} />
                  <Row label="Kilometraje" value={`${car.mileage.toLocaleString('es-CO')} km`} />
                  <Row label="Transmisión" value={car.specs?.transmission || 'No indicada'} />
                  <Row label="Combustible" value={car.specs?.fuel || 'No indicado'} />
                  {car.specs?.engine && <Row label="Motor" value={car.specs.engine} />}
                  {car.specs?.color && <Row label="Color" value={car.specs.color} />}
                  <Row label="Publicado" value={timeAgo(car.createdAt)} />
                  {!!car.views && <Row label="Visitas" value={car.views === 1 ? '1 vez' : `${car.views} veces`} />}
                </dl>
              </section>

              {/* Documents */}
              <section className="space-y-2">
                <div>
                  <h3 className="text-sm font-black text-slate-950">Documentos</h3>
                  <p className="text-[11px] text-slate-500">Según el vendedor. Verifícalos en el RUNT antes de comprar.</p>
                </div>
                <div className="space-y-2 text-xs">
                  <DocCheck ok={car.soatValid} label={car.soatValid ? 'SOAT vigente' : 'SOAT no declarado'} />
                  <DocCheck ok={car.tecnoValid} label={car.tecnoValid ? 'Revisión técnico-mecánica al día' : 'Revisión técnico-mecánica no declarada'} />
                  <DocCheck ok={car.isUniqueOwner} label={car.isUniqueOwner ? 'Único dueño' : 'No es único dueño'} />
                </div>
              </section>
            </div>

            {/* Seller */}
            <section className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-slate-950 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {car.sellerName ? car.sellerName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-950 truncate">{car.sellerName}</div>
                <div className="text-[11px] text-slate-500">Vendedor particular</div>
              </div>
            </section>

            {!canManage && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  🔒 Nunca envíes dinero ni anticipos antes de ver el vehículo en persona y verificarlo en el RUNT.
                </p>
                <button
                  onClick={() => report({ type: 'listing', id: car.id, title: car.title, ownerId: car.ownerId })}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" /> Reportar este anuncio
                </button>
              </div>
            )}

            {isAdmin && (
              <section className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-950">Herramientas de administrador</span> (solo tú las ves).{' '}
                  {isFeatured
                    ? `Destacado hasta el ${new Date(featuredUntil!).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`
                    : 'Un anuncio destacado aparece de primero y con su etiqueta.'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {onSetFeatured && !isSold && (
                    <button
                      onClick={() => onSetFeatured(isFeatured ? null : 30)}
                      className={`font-bold text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer ${
                        isFeatured ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      {isFeatured ? 'Quitar destacado' : 'Destacar 30 días'}
                    </button>
                  )}
                  <button
                    onClick={handleSocialImage}
                    disabled={isBuildingImage}
                    className="font-bold text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {isBuildingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />}
                    Imagen para redes
                  </button>
                </div>
              </section>
            )}

            {canManage && (
              <section className="p-4 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Este anuncio es tuyo.</span>{' '}
                  {isSold ? 'Está marcado como vendido.' : '¿Ya lo vendiste? Márcalo para que no te sigan escribiendo.'}
                </div>
                <div className="flex gap-2 shrink-0">
                <button
                  onClick={onEdit}
                  className="font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={onToggleSold}
                  className={`shrink-0 font-bold text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSold ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSold ? <RotateCcw className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
                  {isSold ? 'Volver a publicar' : 'Marcar como vendido'}
                </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Contact bar (phones and tablets; computers have the buttons in the right column) */}
        <div className="lg:hidden p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
          <div className="hidden sm:block min-w-0">
            <div className="text-lg font-black text-slate-950 truncate">{formatCOP(car.price)}</div>
            <div className="text-[11px] text-slate-500 truncate">{car.title}</div>
          </div>
          {contactButtons('bar')}
        </div>
      </div>
    </div>
  );
};
