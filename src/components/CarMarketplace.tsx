import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { VehicleListing } from '../types';
import { compressImageFile } from '../services/realDataService';

interface CarMarketplaceProps {
  carListings: VehicleListing[];
  onPublishListing: (listing: VehicleListing) => void;
  onOpenIntermediationModal: (listing: VehicleListing) => void;
  onDeleteListing?: (listingId: string) => void;
}

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
  onPublishListing,
  onOpenIntermediationModal,
  onDeleteListing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedTransmission, setSelectedTransmission] = useState('todas');
  const [maxPrice, setMaxPrice] = useState<number>(300000000);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<VehicleListing | null>(null);

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
  const [pubImageUrl, setPubImageUrl] = useState('');
  const [pubIsUniqueOwner, setPubIsUniqueOwner] = useState(true);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImage(true);
      const dataUrl = await compressImageFile(file, 1000, 0.85);
      setPubImageUrl(dataUrl);
    } catch (err) {
      console.error('Error procesando foto', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Extract unique brands
  const brands = ['todas', ...Array.from(new Set(carListings.map((c) => c.brand)))];

  // Filter listings
  const filteredListings = carListings.filter((car) => {
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
    if (car.price > maxPrice) {
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
  });

  const getWhatsAppLink = (car: VehicleListing) => {
    const rawPhone = car.whatsappNumber || car.sellerPhone || '573108924410';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    const text = `Hola ${car.sellerName}! 👋 Vi tu vehículo publicado en MiGaraje: *${car.title}* por $${car.price.toLocaleString()} COP en ${car.location}. ¿Aún está disponible para agendar una cita o peritaje?`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubModel.trim() || !pubPrice) return;

    const title = `${pubBrand} ${pubModel.trim()} ${pubYear}`;
    const newListing: VehicleListing = {
      id: `car-${Date.now()}`,
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
      isInsurable: true,
      soatValid: true,
      tecnoValid: true,
      sellerName: pubSellerName.trim() || 'Vendedor Particular',
      sellerType: 'particular',
      sellerPhone: pubSellerPhone.trim() || '+57 310 000 0000',
      whatsappNumber: pubSellerPhone.trim().replace(/\D/g, '') || '573100000000',
      sellerVerified: true,
      images: [
        pubImageUrl.trim() || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: {
        engine: 'Motor original de fábrica',
        transmission: pubTransmission,
        fuel: pubFuel,
        horsepower: 150,
        color: 'Original',
        doors: 5,
      },
      isClassicPlate: false,
      description: pubDescription.trim() || 'Excelente vehículo familiar, papeles al día, listo para traspaso inmediato.',
      tags: [pubIsUniqueOwner ? 'Único Dueño' : 'Excelente Estado', `Placa ${pubPlateEnding} ${pubPlateCity}`, '100% Asegurable'],
      intermediationProtected: true,
      publishedAt: 'Recién publicado',
    };

    onPublishListing(newListing);
    setShowPublishModal(false);

    // Reset form
    setPubModel('');
    setPubDescription('');
    setPubImageUrl('');
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
            Encuentra vehículos verificados en Bogotá, Medellín, Cali, Barranquilla y todo el país. Contacta directo con el vendedor por WhatsApp, revisa el estado del RUNT y agenda peritaje técnico de confianza.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>Vehículos 100% Asegurables</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Revisión de RUNT y Traspaso</span>
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
            onClick={() => setShowPublishModal(true)}
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
              ${(maxPrice / 1000000).toFixed(0)} Millones COP
            </span>
          </div>

          <input
            type="range"
            min={20000000}
            max={300000000}
            step={5000000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full sm:w-64 accent-slate-950 cursor-pointer"
          />
        </div>
      </div>

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
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />

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

                  {onDeleteListing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la publicación de "${car.title}"?`)) {
                          onDeleteListing(car.id);
                        }
                      }}
                      title="Eliminar publicación"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                      <span>{car.mileage.toLocaleString()} km</span>
                    </div>
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
                      ${car.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Cuota Estimada</span>
                    <div className="text-xs font-mono font-bold text-blue-600">
                      Desde ${monthlyEstimate.toLocaleString()}/m
                    </div>
                  </div>
                </div>

                {/* Double Action: WhatsApp Direct + Ver Vehículo */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getWhatsAppLink(car)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[42px]"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setSelectedCar(car)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[42px]"
                  >
                    Ver Vehículo
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
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
              setMaxPrice(300000000);
            }}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden relative max-h-[92dvh] flex flex-col">
            
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 border border-slate-200 cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto flex-1">
              
              {/* Photo Showcase */}
              <div className="aspect-16/9 bg-slate-100 relative">
                <img
                  src={selectedCar.images[0]}
                  alt={selectedCar.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-md">
                    {selectedCar.brand} {selectedCar.model}
                  </span>
                  {selectedCar.plateEnding && (
                    <span className="bg-blue-600 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                      Placa terminada en {selectedCar.plateEnding} ({selectedCar.plateCity || selectedCar.city})
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Title & Price Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                      {selectedCar.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedCar.location}</span>
                      <span>•</span>
                      <span>Año {selectedCar.year}</span>
                      <span>•</span>
                      <span>{selectedCar.mileage.toLocaleString()} km</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 uppercase font-bold">Precio de Contado</span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950">
                      ${selectedCar.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
                    </div>
                  </div>
                </div>

                {/* Colombian Legal & Document Status */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Verificación de Documentos & Historial RUNT</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">SOAT</div>
                      <div className="font-bold text-blue-700 mt-0.5">Vigente</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Tecno-Mecánica</div>
                      <div className="font-bold text-blue-700 mt-0.5">Al Día</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Asegurabilidad</div>
                      <div className="font-bold text-blue-700 mt-0.5">100% Asegurable</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Pico y Placa</div>
                      <div className="font-bold text-slate-900 mt-0.5">Dígito {selectedCar.plateEnding || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Detalles y Comentarios del Vendedor
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {selectedCar.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Ficha Técnica
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Motor</div>
                      <div className="font-bold text-slate-900">{selectedCar.specs?.engine || '2.0L'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Transmisión</div>
                      <div className="font-bold text-slate-900">{selectedCar.specs?.transmission || 'Automática'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Combustible</div>
                      <div className="font-bold text-slate-900">{selectedCar.specs?.fuel || 'Gasolina'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Color</div>
                      <div className="font-bold text-slate-900">{selectedCar.specs?.color || 'Gris'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Puertas</div>
                      <div className="font-bold text-slate-900">{selectedCar.specs?.doors || 5} Puertas</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Traspaso</div>
                      <div className="font-bold text-blue-700">Inmediato / Sin Prendas</div>
                    </div>
                  </div>
                </div>

                {/* Seller Profile Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-950 text-white font-bold text-sm flex items-center justify-center">
                      {selectedCar.sellerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-950">{selectedCar.sellerName}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{selectedCar.sellerType} • Vendedor Verificado</div>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppLink(selectedCar)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-950 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total</span>
                <div className="text-xl sm:text-2xl font-black text-slate-950">
                  ${selectedCar.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppLink(selectedCar)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Contactar por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </div>
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
                    min={1960}
                    max={2026}
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
                    maxLength={1}
                    placeholder="Ej: 5"
                    value={pubPlateEnding}
                    onChange={(e) => setPubPlateEnding(e.target.value)}
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

              {/* Photo Upload: File from Device/Camera OR URL */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60">
                <label className="block font-bold text-slate-800">Foto del Vehículo</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{isProcessingImage ? 'Procesando...' : 'Tomar Foto o Subir Archivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>

                  <span className="text-slate-400 text-xs">o ingresa una URL:</span>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={pubImageUrl.startsWith('data:') ? '' : pubImageUrl}
                    onChange={(e) => setPubImageUrl(e.target.value)}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                {pubImageUrl && (
                  <div className="mt-2 relative w-24 h-16 rounded-xl overflow-hidden border border-slate-300">
                    <img src={pubImageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPubImageUrl('')}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 text-[9px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="uniqueOwner"
                  checked={pubIsUniqueOwner}
                  onChange={(e) => setPubIsUniqueOwner(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="uniqueOwner" className="font-bold text-slate-700 cursor-pointer">
                  Soy el único dueño del vehículo
                </label>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
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
