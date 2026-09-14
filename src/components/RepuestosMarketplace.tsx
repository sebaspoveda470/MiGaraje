import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  ShieldCheck, 
  Star, 
  Truck, 
  Check, 
  Sparkles, 
  X, 
  Store, 
  HelpCircle,
  Plus,
  Phone,
  MessageCircle,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  ArrowRight
} from 'lucide-react';
import { SparePart, PartCategory, Vehicle, CartItem, PartnerStore } from '../types';
import { getPartnerStores } from '../services/storeService';
import { PartnerStoreModal } from './PartnerStoreModal';

interface RepuestosMarketplaceProps {
  spareParts: SparePart[];
  activeVehicle: Vehicle | null;
  onAddToCart: (item: CartItem) => void;
  onRequestSpecialQuote: (partDetails: any) => void;
}

const CATEGORIES: { id: PartCategory; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todas las Categorías', icon: '📦' },
  { id: 'frenos', label: 'Frenos & Discos', icon: '🛑' },
  { id: 'motor', label: 'Motor & Distribución', icon: '⚙️' },
  { id: 'suspension', label: 'Suspensión & Dirección', icon: '🔩' },
  { id: 'filtracion', label: 'Filtros & Admisión', icon: '💨' },
  { id: 'electrico', label: 'Bujías & Eléctrico', icon: '⚡' },
  { id: 'transmision', label: 'Embrague & Transmisión', icon: '🔄' },
];

export const RepuestosMarketplace: React.FC<RepuestosMarketplaceProps> = ({
  spareParts,
  activeVehicle,
  onAddToCart,
  onRequestSpecialQuote,
}) => {
  const [marketplaceView, setMarketplaceView] = useState<'catalogo' | 'tiendas'>('catalogo');
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [showStoreRegisterModal, setShowStoreRegisterModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<PartCategory>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(true);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [quotePartName, setQuotePartName] = useState('');
  const [quotePartNumber, setQuotePartNumber] = useState('');
  const [quoteChassisVin, setQuoteChassisVin] = useState('');
  const [quoteUrgency, setQuoteUrgency] = useState('Normal');
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  useEffect(() => {
    getPartnerStores().then((stores) => {
      setPartnerStores(stores);
    });
  }, []);

  // Filter parts
  const filteredParts = spareParts.filter((part) => {
    // Category filter
    if (selectedCategory !== 'todos' && part.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = part.name.toLowerCase().includes(q);
      const matchPartNumber = part.partNumber.toLowerCase().includes(q);
      const matchBrand = part.brand.toLowerCase().includes(q);
      const matchStore = part.storeName.toLowerCase().includes(q);
      if (!matchName && !matchPartNumber && !matchBrand && !matchStore) {
        return false;
      }
    }

    // Active vehicle compatibility filter
    if (onlyCompatible && activeVehicle) {
      const matchBrand = part.compatibleBrands.some(
        (b) => b.toLowerCase() === activeVehicle.brand.toLowerCase()
      );
      const matchModel = part.compatibleModels.some(
        (m) => activeVehicle.model.toLowerCase().includes(m.toLowerCase())
      );
      const matchYear =
        activeVehicle.year >= part.compatibleYears[0] &&
        activeVehicle.year <= part.compatibleYears[1];

      return (matchBrand && matchModel) || (matchBrand && matchYear);
    }

    return true;
  });

  const handleSpecialQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestSpecialQuote({
      partName: quotePartName,
      partNumber: quotePartNumber,
      chassisVin: quoteChassisVin,
      urgency: quoteUrgency,
      vehicle: activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year}` : 'No especificado',
    });
    setQuoteSuccess(true);
    setTimeout(() => {
      setQuoteSuccess(false);
      setShowQuoteModal(false);
      setQuotePartName('');
      setQuotePartNumber('');
      setQuoteChassisVin('');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner: Clean Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Red de Tiendas & Autopartes
            </span>
            <span className="text-xs text-slate-500 font-medium">Distribuidores Verificados con NIT en Colombia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Repuestos garantizados para tu vehículo con compra protegida
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
            Encuentra piezas originales y de equipo original (OEM). Tu dinero queda en custodia en MiGaraje y solo se libera a la tienda cuando recibas e instales la pieza correctamente.
          </p>

          {/* Action buttons in banner */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>¿No encuentras tu repuesto? Pídelo aquí</span>
            </button>

            <button
              onClick={() => setShowStoreRegisterModal(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Inscribir mi Almacén de Repuestos</span>
            </button>

            {activeVehicle && (
              <div className="text-xs text-slate-700 bg-blue-50 border border-blue-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Filtro activo: <strong>{activeVehicle.brand} {activeVehicle.model} ({activeVehicle.year})</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch: Catálogo de Repuestos vs Directorio de Tiendas Aliadas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMarketplaceView('catalogo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              marketplaceView === 'catalogo'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Catálogo de Repuestos ({filteredParts.length})</span>
          </button>

          <button
            onClick={() => setMarketplaceView('tiendas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              marketplaceView === 'tiendas'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Tiendas & Almacenes ({partnerStores.length})</span>
            <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.2 rounded-full font-bold">
              Verificadas
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowStoreRegisterModal(true)}
          className="text-xs text-slate-700 hover:text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>¿Vendes repuestos? Publica tu inventario</span>
        </button>
      </div>

      {marketplaceView === 'catalogo' ? (
        <>
          {/* Search and Category Filters: Clean White Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código de parte (OEM), marca (Bosch, Denso, etc.) o almacén..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Compatible filter checkbox */}
              {activeVehicle && (
                <button
                  onClick={() => setOnlyCompatible(!onlyCompatible)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    onlyCompatible
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${onlyCompatible ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>Solo para mi {activeVehicle.brand} {activeVehicle.model}</span>
                </button>
              )}
            </div>

            {/* Category horizontal badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredParts.length > 0 ? (
              filteredParts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  {/* Image and badges */}
                  <div
                    onClick={() => setSelectedPart(part)}
                    className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={part.image}
                      alt={part.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold bg-slate-950 text-white px-2 py-0.5 rounded shadow-xs">
                        {part.brand}
                      </span>
                      {part.isOem && (
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded">
                          Calidad OEM
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-200 shadow-xs">
                      <Truck className="w-3 h-3 text-slate-600" />
                      <span>{part.shippingDays} días entrega</span>
                    </div>
                  </div>

                  {/* Part Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{part.partNumber}</span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {part.storeRating}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedPart(part)}
                        className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer pt-1"
                      >
                        {part.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 font-normal leading-relaxed">
                        {part.description}
                      </p>
                    </div>

                    {/* Store & Warranty Pill */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 truncate max-w-[170px]">
                          <Store className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{part.storeName.split('(')[0]}</span>
                        </span>
                        <span className="text-blue-700 font-semibold shrink-0">
                          {part.warrantyMonths}m garantía
                        </span>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <div className="text-sm sm:text-base font-black text-slate-950">
                            ${part.price.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">COP</span>
                          </div>
                          {part.originalPrice && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ${part.originalPrice.toLocaleString()} COP
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                          >
                            Detalle
                          </button>
                          <button
                            onClick={() => onAddToCart({
                              type: 'repuesto',
                              id: part.id,
                              name: part.name,
                              brand: part.brand,
                              price: part.price,
                              quantity: 1,
                              image: part.image,
                              storeName: part.storeName,
                              warrantyMonths: part.warrantyMonths,
                            })}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Comprar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
                  <Wrench className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No encontramos repuestos con los filtros seleccionados</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Intenta quitar el filtro de solo compatibles o pide una cotización personalizada a nuestra red de tiendas aliadas.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('todos');
                      setSearchTerm('');
                      setOnlyCompatible(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs text-slate-800 hover:bg-slate-200 font-semibold border border-slate-200 cursor-pointer"
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-xs text-white font-bold hover:bg-slate-800 shadow-xs cursor-pointer"
                  >
                    Solicitar Cotización Express
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* View 2: Red de Tiendas Aliadas */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Directorio Oficial de Tiendas y Distribuidores de Autopartes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacenes verificados con NIT en Colombia. Tus compras cuentan con sistema de retención de fondos y garantía.
              </p>
            </div>

            <button
              onClick={() => setShowStoreRegisterModal(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribir mi Almacén</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerStores.map((store) => (
              <div
                key={store.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logoUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80'}
                        alt={store.commercialName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-950 leading-tight flex items-center gap-1.5">
                          <span>{store.commercialName}</span>
                          {store.verified && (
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" title="Verificado por MiGaraje" />
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{store.city}</span>
                        </div>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{store.rating}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {store.description}
                  </p>

                  {/* Marcas */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Marcas que maneja:</span>
                    <div className="flex flex-wrap gap-1">
                      {store.brands.slice(0, 5).map((b, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                          {b}
                        </span>
                      ))}
                      {store.brands.length > 5 && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200">
                          +{store.brands.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="text-slate-400 font-semibold">Líneas destacadas:</div>
                    <div className="text-slate-700 font-mono text-[10px]">{store.specialties.join(' • ')}</div>
                  </div>
                </div>

                {/* Contact & Buy CTAs */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(store.commercialName)},%20te%20contacto%20desde%20MiGaraje%20para%20consultar%20un%20repuesto`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setSearchTerm(store.commercialName.split(' ')[0]);
                      setMarketplaceView('catalogo');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Ver Catálogo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part Details Modal: Clean White Card */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setSelectedPart(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 border border-slate-200 cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-16/9 bg-slate-100 relative">
              <img
                src={selectedPart.image}
                alt={selectedPart.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-md">
                  {selectedPart.brand}
                </span>
                {selectedPart.isOem && (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    Calidad OEM
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                  <span>Parte: {selectedPart.partNumber}</span>
                  <span>•</span>
                  <span className="capitalize">Línea: {selectedPart.category}</span>
                </div>
                <h3 className="text-xl font-black text-slate-950">{selectedPart.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedPart.description}
                </p>
              </div>

              {/* Compatibility Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Compatibilidad Comprobada</span>
                </div>
                <div className="text-slate-600">
                  Marcas compatibles: <strong className="text-slate-900">{selectedPart.compatibleBrands.join(', ')}</strong>
                </div>
                <div className="text-slate-600">
                  Modelos: <strong className="text-slate-900">{selectedPart.compatibleModels.join(', ')}</strong>
                </div>
                <div className="text-slate-600">
                  Rango de años: <strong className="text-slate-900">{selectedPart.compatibleYears[0]} - {selectedPart.compatibleYears[1]}</strong>
                </div>
              </div>

              {/* Price and Add button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-950">
                    ${selectedPart.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedPart.warrantyMonths} meses de garantía oficial</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddToCart({
                      type: 'repuesto',
                      id: selectedPart.id,
                      name: selectedPart.name,
                      brand: selectedPart.brand,
                      price: selectedPart.price,
                      quantity: 1,
                      image: selectedPart.image,
                      storeName: selectedPart.storeName,
                      warrantyMonths: selectedPart.warrantyMonths,
                    });
                    setSelectedPart(null);
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* "Pide tu Repuesto" Quote Modal: Clean White Card */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Solicitud de Repuesto Difícil de Conseguir</h3>
                <p className="text-xs text-slate-500">Intermediamos con más de 80 almacenes e importadores directos</p>
              </div>
            </div>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-950">¡Solicitud Enviada a la Red de Tiendas!</h4>
                <p className="text-xs text-slate-600">
                  Recibirás hasta 3 cotizaciones comparativas con garantía de intermediación en tu panel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSpecialQuoteSubmit} className="space-y-4 text-xs text-slate-700">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Nombre de la pieza o descripción del repuesto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mangueta delantera derecha con buje original"
                    value={quotePartName}
                    onChange={(e) => setQuotePartName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">Número de Parte / OEM (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 48510-09V30"
                      value={quotePartNumber}
                      onChange={(e) => setQuotePartNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">Urgencia</label>
                    <select
                      value={quoteUrgency}
                      onChange={(e) => setQuoteUrgency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    >
                      <option value="Normal">Normal (3-5 días)</option>
                      <option value="Urgente">Urgente 24h</option>
                      <option value="Importacion">Importación Clásico/USA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Número de Chasis / VIN (Garantiza 100% de compatibilidad)</label>
                  <input
                    type="text"
                    placeholder="Ej: JM1BN1V79K..."
                    value={quoteChassisVin}
                    onChange={(e) => setQuoteChassisVin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    Cotizar con Tiendas Aliadas
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Partner Store Modal Integration */}
      <PartnerStoreModal
        isOpen={showStoreRegisterModal}
        onClose={() => setShowStoreRegisterModal(false)}
        onRegisterSuccess={() => {
          setShowStoreRegisterModal(false);
          getPartnerStores().then(setPartnerStores);
        }}
      />

    </div>
  );
};
