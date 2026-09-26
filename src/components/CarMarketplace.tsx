import React, { useEffect, useRef, useState } from 'react';
import { 
  Car, 
  Search, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Check, 
  Plus, 
  Phone, 
  MessageCircle, 
  X, 
  ChevronRight,
  Filter,
  DollarSign,
  FileCheck,
  Calculator,
  ExternalLink,
  Sparkles,
  Shield,
  BadgeCheck,
  Camera,
  Trash2,
  Loader2,
  Clock,
  Images,
  CircleCheck,
  RotateCcw,
  Heart
} from 'lucide-react';
import { VehicleListing, UserProfile } from '../types';
import { timeAgo, toWhatsAppNumber } from '../utils/media';
import { PhotoPicker } from './PhotoPicker';
import { VehicleDetailModal } from './VehicleDetailModal';
import { useConfirm } from './ConfirmDialog';
import { syncDeepLink } from '../utils/shareLinks';
import { getVehicleReferenceImage } from '../utils/vehicleImages';

interface CarMarketplaceProps {
  carListings: VehicleListing[];
  isLoading: boolean;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  requireAuth: () => boolean;
  onPublishListing: (listing: Omit<VehicleListing, 'id'>, photos: string[]) => Promise<void>;
  onDeleteListing: (listingId: string) => void;
  onToggleSold: (listing: VehicleListing, sold: boolean) => void;
  initialListingId?: string | null;
  favoriteIds: string[];
  onToggleFavorite: (listingId: string) => void;
}

// The cover lives in the listing and each extra photo in its own document
const MAX_LISTING_PHOTOS = 10;

type SortKey = 'recientes' | 'precio_asc' | 'precio_desc' | 'km_asc' | 'anio_desc';

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'recientes', label: 'Más recientes' },
  { id: 'precio_asc', label: 'Menor precio' },
  { id: 'precio_desc', label: 'Mayor precio' },
  { id: 'km_asc', label: 'Menor kilometraje' },
  { id: 'anio_desc', label: 'Modelo más nuevo' },
];

const COMPARATORS: Record<SortKey, (a: VehicleListing, b: VehicleListing) => number> = {
  recientes: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  precio_asc: (a, b) => a.price - b.price,
  precio_desc: (a, b) => b.price - a.price,
  km_asc: (a, b) => a.mileage - b.mileage,
  anio_desc: (a, b) => b.year - a.year,
};

export const isSold = (car: VehicleListing) => car.status === 'vendido';

// The price slider's top position means "no limit".
const PRICE_CAP = 500000000;

const COLOMBIAN_CITIES = [
  'todas',
  'Bogotá D.C.',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Pereira',
  'Envigado',
  'Cartagena',
  'Manizales',
];

export const CarMarketplace: React.FC<CarMarketplaceProps> = ({
  carListings,
  isLoading,
  currentUserId,
  currentUser,
  isAdmin,
  requireAuth,
  onPublishListing,
  onDeleteListing,
  onToggleSold,
  initialListingId,
  favoriteIds,
  onToggleFavorite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedTransmission, setSelectedTransmission] = useState('todas');
  const [maxPrice, setMaxPrice] = useState<number>(PRICE_CAP);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<VehicleListing | null>(null);
  const confirmAction = useConfirm();

  // Open the listing from a shared link once the listings arrive
  const deepLinkHandled = useRef(!initialListingId);
  useEffect(() => {
    if (deepLinkHandled.current || isLoading) return;
    deepLinkHandled.current = true;
    const car = carListings.find((c) => c.id === initialListingId);
    if (car) setSelectedCar(car);
    else syncDeepLink(null);
  }, [isLoading, carListings, initialListingId]);

  // Keep the address bar pointing at the open listing
  useEffect(() => {
    if (!deepLinkHandled.current) return;
    syncDeepLink(selectedCar ? { type: 'vehiculo', id: selectedCar.id } : null);
  }, [selectedCar]);

  // Form State for "Vender mi Vehículo" Publishing Modal
  const [pubBrand, setPubBrand] = useState('Mazda');
  const [pubModel, setPubModel] = useState('');
  const [pubYear, setPubYear] = useState<number>(2022);
  const [pubPrice, setPubPrice] = useState<number>(75000000);
  const [pubMileage, setPubMileage] = useState<number>(35000);
  const [pubCity, setPubCity] = useState('Bogotá D.C.');
  const [pubPlateEnding, setPubPlateEnding] = useState('5');
  const [pubPlateCity, setPubPlateCity] = useState('Bogotá');
  const [pubTransmission, setPubTransmission] = useState('Automática');
  const [pubFuel, setPubFuel] = useState('Gasolina');
  const [pubSellerName, setPubSellerName] = useState('');
  const [pubSellerPhone, setPubSellerPhone] = useState('');
  const [pubDescription, setPubDescription] = useState('');
  const [pubImages, setPubImages] = useState<string[]>([]);
  const [showSold, setShowSold] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('recientes');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [pubIsUniqueOwner, setPubIsUniqueOwner] = useState(true);
  const [pubSoatValid, setPubSoatValid] = useState(true);
  const [pubTecnoValid, setPubTecnoValid] = useState(true);
  const [pubColor, setPubColor] = useState('');
  const [pubEngine, setPubEngine] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const canDelete = (car: VehicleListing) => isAdmin || (!!currentUserId && car.ownerId === currentUserId);

  const openPublishModal = () => {
    if (!requireAuth()) return;
    if (!pubSellerName && currentUser?.fullName) setPubSellerName(currentUser.fullName);
    if (!pubSellerPhone && currentUser?.phone) setPubSellerPhone(currentUser.phone);
    setPublishError(null);
    setShowPublishModal(true);
  };

  // Extract unique brands
  const brands = ['todas', ...Array.from(new Set(carListings.map((c) => c.brand)))];

  const handleToggleSold = async (car: VehicleListing) => {
    const sold = !isSold(car);
    const ok = sold
      ? await confirmAction(`"${car.title}" se mostrará como vendido y los compradores ya no podrán escribirte por este anuncio.`, {
          title: '¿Marcar como vendido?',
          confirmLabel: 'Sí, lo vendí',
        })
      : await confirmAction(`"${car.title}" volverá a aparecer como disponible.`, {
          title: '¿Volver a publicar?',
          confirmLabel: 'Sí, publicar',
        });
    if (ok) onToggleSold(car, sold);
  };

  const handleDeleteListing = async (car: VehicleListing) => {
    const ok = await confirmAction(`Se eliminará la publicación de "${car.title}". Esta acción no se puede deshacer.`, {
      title: '¿Eliminar publicación?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (ok) onDeleteListing(car.id);
  };

  // Filter listings (available first, sold at the end)
  const filteredListings = carListings.filter((car) => {
    if (onlyFavorites && !favoriteIds.includes(car.id)) {
      return false;
    }
    if (!showSold && isSold(car)) {
      return false;
    }
    if (selectedBrand !== 'todas' && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    if (selectedCity !== 'todas') {
      const carLoc = (car.city || car.location).toLowerCase();
      if (!carLoc.includes(selectedCity.toLowerCase())) {
        return false;
      }
    }
    if (selectedTransmission !== 'todas') {
      const carTrans = (car.specs?.transmission || '').toLowerCase();
      if (!carTrans.includes(selectedTransmission.toLowerCase())) {
        return false;
      }
    }
    if (maxPrice < PRICE_CAP && car.price > maxPrice) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = car.title.toLowerCase().includes(q);
      const matchBrand = car.brand.toLowerCase().includes(q);
      const matchModel = car.model.toLowerCase().includes(q);
      const matchLocation = (car.location || '').toLowerCase();
      const matchCity = (car.city || '').toLowerCase();
      if (!matchTitle && !matchBrand && !matchModel && !matchLocation && !matchCity) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => Number(isSold(a)) - Number(isSold(b)) || COMPARATORS[sortBy](a, b));

  const soldCount = carListings.filter(isSold).length;

  const getWhatsAppLink= (car: VehicleListing) => {
    const phoneWithCountry = toWhatsAppNumber(car.whatsappNumber || car.sellerPhone);
    const text = `Hola ${car.sellerName}! 👋 Vi tu vehículo publicado en MiGaraje: *${car.title}* por $${car.price.toLocaleString('es-CO')} COP en ${car.location}. ¿Aún está disponible para agendar una cita o peritaje?`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubModel.trim() || !pubPrice) return;
    if (!toWhatsAppNumber(pubSellerPhone)) {
      setPublishError('Ingresa un número de WhatsApp válido para que los compradores te contacten.');
      return;
    }

    const title = `${pubBrand} ${pubModel.trim()} ${pubYear}`;
    const tags = [pubIsUniqueOwner ? 'Único Dueño' : null, pubPlateEnding ? `Placa ${pubPlateEnding} ${pubPlateCity}` : null]
      .filter(Boolean) as string[];
    const newListing: Omit<VehicleListing, 'id'> = {
      title,
      brand: pubBrand,
      model: pubModel.trim(),
      year: Number(pubYear),
      price: Number(pubPrice),
      currency: 'COP',
      mileage: Number(pubMileage),
      condition: pubMileage < 30000 ? 'seminuevo' : 'usado',
      location: `${pubCity}, Colombia`,
      city: pubCity,
      plateEnding: pubPlateEnding,
      plateCity: pubPlateCity,
      isUniqueOwner: pubIsUniqueOwner,
      soatValid: pubSoatValid,
      tecnoValid: pubTecnoValid,
      sellerName: pubSellerName.trim(),
      sellerType: 'particular',
      sellerPhone: pubSellerPhone.trim(),
      whatsappNumber: toWhatsAppNumber(pubSellerPhone),
      sellerVerified: false,
      images: pubImages.length > 0 ? pubImages : [getVehicleReferenceImage(pubBrand, pubModel.trim(), Number(pubYear), 'diario')],
      status: 'disponible',
      specs: {
        engine: pubEngine.trim(),
        transmission: pubTransmission,
        fuel: pubFuel,
        horsepower: 0,
        color: pubColor.trim(),
        doors: 0,
      },
      isClassicPlate: false,
      description: pubDescription.trim(),
      tags,
      intermediationProtected: false,
      publishedAt: new Date().toISOString(),
    };

    setIsPublishing(true);
    setPublishError(null);
    try {
      await onPublishListing(newListing, pubImages);
      setShowPublishModal(false);
      // Reset form
      setPubModel('');
      setPubDescription('');
      setPubImages([]);
      setPubColor('');
      setPubEngine('');
    } catch (err) {
      console.error(err);
      setPublishError('No se pudo publicar el vehículo. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner: Compra & Venta de Vehículos */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Compra & Venta de Vehículos
            </span>
            <span className="text-xs text-slate-500 font-medium">Trato Directo y Seguro</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Compra y vende tu vehículo sin intermediarios abusivos ni estafas
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Encuentra vehículos publicados por sus propietarios en Bogotá, Medellín, Cali, Barranquilla y todo el país. Contacta directo con el vendedor por WhatsApp y, antes de pagar, consulta el RUNT y agenda un peritaje de tu confianza.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>Publicación gratuita</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Datos declarados por el vendedor</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Trato directo vía WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Action Button: Vender mi Vehículo */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={openPublishModal}
            className="bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-black text-xs sm:text-sm px-6 py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>¡Vender mi Vehículo Ahora!</span>
          </button>
          <span className="text-[11px] text-slate-500 text-center">Publicación rápida y gratuita</span>
        </div>
      </div>

      {/* Colombian Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar marca, modelo o versión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          {/* Brand select */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'todas' ? 'Todas las Marcas' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Colombian City Select */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              {COLOMBIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'todas' ? 'Toda Colombia (Ciudades)' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission Select */}
          <div>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="todas">Cualquier Transmisión</option>
              <option value="automática">Automática / Secuencial</option>
              <option value="manual">Mecánica / Manual</option>
            </select>
          </div>

        </div>

        {/* Price Slider Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Precio máximo:</span>
            <span className="font-mono font-black text-slate-950 text-sm">
              {maxPrice >= PRICE_CAP ? 'Sin límite' : `$${(maxPrice / 1000000).toFixed(0)} Millones COP`}
            </span>
          </div>

          <input
            type="range"
            min={20000000}
            max={PRICE_CAP}
            step={5000000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full sm:w-64 accent-slate-950 cursor-pointer"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 font-bold">
            Ordenar por:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-400"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>

          {soldCount > 0 && (
            <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showSold}
                onChange={(e) => setShowSold(e.target.checked)}
                className="w-4 h-4 accent-slate-950 cursor-pointer"
              />
              Mostrar vendidos ({soldCount})
            </label>
          )}

          <button
            onClick={() => setOnlyFavorites((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-colors ${
              onlyFavorites ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
            Mis favoritos ({carListings.filter((c) => favoriteIds.includes(c.id)).length})
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando vehículos...
        </div>
      )}

      {/* Vehicle Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((car) => {
          const monthlyEstimate = Math.round((car.price * 0.015) / 1000) * 1000;
          return (
            <div
              key={car.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Badges */}
                <div 
                  onClick={() => setSelectedCar(car)}
                  className="aspect-16/10 bg-slate-100 relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={car.images[0]}
                    alt={car.title}
                    className={`w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ${isSold(car) ? 'grayscale-[60%]' : ''}`}
                  />

                  {isSold(car) && (
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center pointer-events-none">
                      <span className="bg-red-600 text-white font-black text-sm tracking-widest px-5 py-1.5 rounded-lg -rotate-6 shadow-lg">
                        VENDIDO
                      </span>
                    </div>
                  )}

                  {(car.photoCount || car.images.length) > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Images className="w-3 h-3" /> {car.photoCount || car.images.length}
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {car.isUniqueOwner && (
                      <span className="bg-slate-950 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        Único Dueño
                      </span>
                    )}
                    {car.plateEnding && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Placa {car.plateEnding} {car.plateCity || ''}
                      </span>
                    )}
                  </div>

                  {/* Location Chip */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>{car.city || car.location}</span>
                  </div>

                  {canDelete(car) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSold(car);
                        }}
                        title={isSold(car) ? 'Volver a poner disponible' : 'Marcar como vendido'}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        {isSold(car) ? <RotateCcw className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteListing(car);
                        }}
                        title="Eliminar publicación"
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Listing Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                      Año {car.year}
                    </span>
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>{car.mileage.toLocaleString('es-CO')} km</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(car.createdAt)}</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedCar(car)}
                    className="text-base font-black text-slate-950 tracking-tight cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {car.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {car.description}
                  </p>

                  {/* Colombian Specs Mini Strip */}
                  <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-slate-400" />
                      <span>{car.specs?.fuel || 'Gasolina'}</span>
                    </div>
                    <span>•</span>
                    <div className="truncate">{car.specs?.transmission || 'Automática'}</div>
                  </div>
                </div>
              </div>

              {/* Price & Action Bottom Strip */}
              <div className="p-5 pt-3 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Precio de Venta</span>
                    <div className="text-xl font-black text-slate-950 tracking-tight">
                      ${car.price.toLocaleString('es-CO')} <span className="text-xs text-slate-500 font-normal">COP</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Cuota Estimada</span>
                    <div className="text-xs font-mono font-bold text-blue-600">
                      Desde ${monthlyEstimate.toLocaleString('es-CO')}/m
                    </div>
                  </div>
                </div>

                {/* Double Action: WhatsApp Direct + Ver Vehículo */}
                <div className="flex items-center gap-2 pt-1">
                  {isSold(car) ? (
                    <div className="flex-1 bg-slate-100 text-slate-500 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 min-h-[42px] border border-slate-200">
                      <CircleCheck className="w-4 h-4 shrink-0" />
                      <span>Vendido</span>
                    </div>
                  ) : (
                    <a
                      href={getWhatsAppLink(car)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[42px]"
                    >
                      <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedCar(car)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[42px]"
                  >
                    Ver Vehículo
                  </button>

                  <button
                    onClick={() => onToggleFavorite(car.id)}
                    aria-label={favoriteIds.includes(car.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    title={favoriteIds.includes(car.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    className="shrink-0 w-11 min-h-[42px] rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${favoriteIds.includes(car.id) ? 'text-rose-600 fill-rose-600' : 'text-slate-600'}`} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {!isLoading && carListings.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-950">Aún no hay vehículos publicados</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Sé el primero en publicar tu vehículo. Es gratis y los compradores te escriben directo a tu WhatsApp.
          </p>
          <button
            onClick={openPublishModal}
            className="bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
          >
            + Vender mi Vehículo
          </button>
        </div>
      )}

      {!isLoading && carListings.length > 0 && filteredListings.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-950">No hay vehículos con estos filtros</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Intenta ampliando el rango de precio o cambiando de ciudad.
          </p>
          <button
            onClick={() => {
              setSelectedBrand('todas');
              setSelectedCity('todas');
              setSelectedTransmission('todas');
              setSearchTerm('');
              setMaxPrice(PRICE_CAP);
            }}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedCar && (
        <VehicleDetailModal
          car={carListings.find((c) => c.id === selectedCar.id) || selectedCar}
          isSold={isSold(carListings.find((c) => c.id === selectedCar.id) || selectedCar)}
          canManage={canDelete(selectedCar)}
          whatsAppLink={getWhatsAppLink(selectedCar)}
          isFavorite={favoriteIds.includes(selectedCar.id)}
          onToggleFavorite={() => onToggleFavorite(selectedCar.id)}
          onToggleSold={() => {
            handleToggleSold(carListings.find((c) => c.id === selectedCar.id) || selectedCar);
          }}
          onClose={() => setSelectedCar(null)}
        />
      )}

      {/* "Vender mi Vehículo" Publishing Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl p-6 relative max-h-[92dvh] overflow-y-auto">
            
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Compra & Venta de Vehículos
              </span>
              <h3 className="text-xl font-black text-slate-950 tracking-tight mt-1">
                Publicar mi Vehículo para la Venta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Los compradores te escribirán directamente a tu WhatsApp personal.
              </p>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Marca *</label>
                  <select
                    value={pubBrand}
                    onChange={(e) => setPubBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="Mazda">Mazda</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Renault">Renault</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Kia">Kia</option>
                    <option value="Ford">Ford</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Suzuki">Suzuki</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Modelo y Versión *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CX-5 Grand Touring 2.5"
                    value={pubModel}
                    onChange={(e) => setPubModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Año *</label>
                  <input
                    type="number"
                    required
                    min={1940}
                    max={new Date().getFullYear() + 1}
                    value={pubYear}
                    onChange={(e) => setPubYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Precio en Pesos (COP) *</label>
                  <input
                    type="number"
                    required
                    step={500000}
                    min={5000000}
                    placeholder="75000000"
                    value={pubPrice}
                    onChange={(e) => setPubPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kilometraje (km) *</label>
                  <input
                    type="number"
                    required
                    step={1000}
                    min={0}
                    placeholder="35000"
                    value={pubMileage}
                    onChange={(e) => setPubMileage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ciudad Ubicación *</label>
                  <select
                    value={pubCity}
                    onChange={(e) => setPubCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    {COLOMBIAN_CITIES.filter((c) => c !== 'todas').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Último Dígito Placa</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    placeholder="Ej: 5"
                    value={pubPlateEnding}
                    onChange={(e) => setPubPlateEnding(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Transmisión</label>
                  <select
                    value={pubTransmission}
                    onChange={(e) => setPubTransmission(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="Automática">Automática / Secuencial</option>
                    <option value="Manual">Mecánica / Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Combustible</label>
                  <select
                    value={pubFuel}
                    onChange={(e) => setPubFuel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="Ej: Gris Titanio"
                    value={pubColor}
                    onChange={(e) => setPubColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Motor</label>
                  <input
                    type="text"
                    placeholder="Ej: 2.0L Skyactiv"
                    value={pubEngine}
                    onChange={(e) => setPubEngine(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tu Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sebastián Poveda"
                    value={pubSellerName}
                    onChange={(e) => setPubSellerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp de Contacto *</label>
                  <input
                    type="tel"
                    required
                    placeholder="310 987 6543"
                    value={pubSellerPhone}
                    onChange={(e) => setPubSellerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Descripción del Vehículo</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Único dueño, récord de mantenimientos en concesionario oficial, jamás chocado, asegurado con Sura..."
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white resize-none"
                />
              </div>

              <PhotoPicker
                label="Fotos del Vehículo"
                images={pubImages}
                onChange={setPubImages}
                max={MAX_LISTING_PHOTOS}
                onProcessingChange={setIsProcessingImage}
              />

              <div className="space-y-2 pt-1">
                {[
                  { id: 'uniqueOwner', label: 'Soy el único dueño del vehículo', checked: pubIsUniqueOwner, set: setPubIsUniqueOwner },
                  { id: 'soatValid', label: 'SOAT vigente', checked: pubSoatValid, set: setPubSoatValid },
                  { id: 'tecnoValid', label: 'Revisión técnico-mecánica al día', checked: pubTecnoValid, set: setPubTecnoValid },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={opt.id}
                      checked={opt.checked}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-950 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor={opt.id} className="font-bold text-slate-700 cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>

              {publishError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{publishError}</p>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPublishing || isProcessingImage}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-blue-400" />}
                  <span>Publicar mi Vehículo en Venta</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
