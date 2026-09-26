import React, { useEffect, useState } from 'react';
import { X, MapPin, MessageCircle, CircleCheck, CircleX, RotateCcw, User } from 'lucide-react';
import { VehicleListing } from '../types';
import { PhotoGallery } from './PhotoPicker';
import { ShareButtons } from './ShareButtons';
import { getListingPhotos } from '../services/listingService';
import { timeAgo } from '../utils/media';

interface VehicleDetailModalProps {
  car: VehicleListing;
  isSold: boolean;
  canManage: boolean;
  whatsAppLink: string;
  onToggleSold: () => void;
  onClose: () => void;
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
  onToggleSold,
  onClose,
}) => {
  const [photos, setPhotos] = useState<string[]>(car.images);

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white sm:border sm:border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden relative max-h-[94dvh] sm:max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Photos: nothing on top of them except the counter */}
          <div className="p-3 sm:p-4 pb-0 sm:pb-0">
            <PhotoGallery key={car.id} images={photos} alt={car.title} aspectClass="aspect-4/3 sm:aspect-16/10" fit="contain" />
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            {/* Title, price and share */}
            <div className="space-y-3">
              {(isSold || plateLabel || car.isUniqueOwner) && (
                <div className="flex flex-wrap gap-1.5">
                  {isSold && <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full">VENDIDO</span>}
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

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">{car.title}</h2>

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
                <ShareButtons
                  type="vehiculo"
                  id={car.id}
                  text={`Mira este ${car.title} en venta por ${formatCOP(car.price)} en MiGaraje:`}
                  iconsOnly
                />
              </div>
            </div>

            {/* Description */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-slate-950">Descripción</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {car.description || 'El vendedor no agregó una descripción. Escríbele por WhatsApp para más detalles.'}
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {canManage && (
              <section className="p-4 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Este anuncio es tuyo.</span>{' '}
                  {isSold ? 'Está marcado como vendido.' : '¿Ya lo vendiste? Márcalo para que no te sigan escribiendo.'}
                </div>
                <button
                  onClick={onToggleSold}
                  className={`shrink-0 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSold ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSold ? <RotateCcw className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
                  {isSold ? 'Volver a publicar' : 'Marcar como vendido'}
                </button>
              </section>
            )}
          </div>
        </div>

        {/* Single call to action */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
          <div className="hidden sm:block min-w-0">
            <div className="text-lg font-black text-slate-950 truncate">{formatCOP(car.price)}</div>
            <div className="text-[11px] text-slate-500 truncate">{car.title}</div>
          </div>
          {isSold ? (
            <div className="flex-1 sm:flex-none sm:ml-auto text-center bg-slate-100 text-slate-500 font-bold text-sm px-6 py-3.5 rounded-2xl border border-slate-200">
              Vehículo vendido
            </div>
          ) : (
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none sm:ml-auto bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Escribir al vendedor
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
