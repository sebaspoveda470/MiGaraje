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
  ExternalLink
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
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner: Intermediación de Tiendas de Repuestos with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Intermediario de Repuestos & Autopartes
            </span>
            <span className="text-xs text-slate-300 font-medium">Red de Tiendas Verificadas</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Encuentra el repuesto exacto para tu vehículo con garantía de compatibilidad
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Conectamos con los distribuidores e importadores más confiables. Tu pago está retenido con garantía hasta que recibas y verifiques la pieza.
          </p>

          {/* Action buttons in banner */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>¿No encuentras tu repuesto? Pídelo aquí</span>
            </button>

            <button
              onClick={() => setShowStoreRegisterModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Inscribir mi Tienda de Repuestos</span>
            </button>

            {activeVehicle && (
              <div className="text-xs text-slate-200 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Filtro activo para: <strong className="text-white">{activeVehicle.brand} {activeVehicle.model} ({activeVehicle.year})</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch: Catálogo de Repuestos vs Directorio de Tiendas Aliadas */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setMarketplaceView('catalogo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              marketplaceView === 'catalogo'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Catálogo de Repuestos ({filteredParts.length})</span>
          </button>

          <button
            onClick={() => setMarketplaceView('tiendas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              marketplaceView === 'tiendas'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tiendas & Distribuidores Aliados ({partnerStores.length})</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Intermediación
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowStoreRegisterModal(true)}
          className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>¿Eres proveedor? Vende con nosotros</span>
        </button>
      </div>

      {/* View 1: Catalog */}
      {marketplaceView === 'catalogo' ? (
        <>
          {/* Filter & Search Bar with Frosted Glass */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            
            {/* Search input + Compatibility Toggle */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código OEM, marca (Brembo, KYB, Gates, etc.) o tienda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {activeVehicle && (
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl shrink-0 backdrop-blur-md">
                  <input
                    type="checkbox"
                    id="compatibleCheck"
                    checked={onlyCompatible}
                    onChange={(e) => setOnlyCompatible(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-white/20 bg-slate-900 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="compatibleCheck" className="text-xs text-slate-200 cursor-pointer select-none font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Solo compatibles con mi {activeVehicle.brand} {activeVehicle.model}</span>
                  </label>
                </div>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5 backdrop-blur-sm'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Parts Grid with Frosted Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredParts.length > 0 ? (
              filteredParts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-blue-400/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col group"
                >
                  {/* Part Image */}
                  <div 
                    onClick={() => setSelectedPart(part)}
                    className="h-44 bg-white/5 relative overflow-hidden cursor-pointer"
                  >
                    <img
                      src={part.image}
                      alt={part.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold bg-slate-950/70 backdrop-blur-md text-white px-2 py-0.5 rounded-lg border border-white/10">
                        {part.brand}
                      </span>
                      {part.isOem && (
                        <span className="text-[9px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-lg">
                          Calidad OEM
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Truck className="w-3 h-3 text-amber-400" />
                      <span>{part.shippingDays} días entrega</span>
                    </div>
                  </div>

                  {/* Part Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{part.partNumber}</span>
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" /> {part.storeRating}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedPart(part)}
                        className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {part.name}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2">
                        {part.description}
                      </p>
                    </div>

                    {/* Store & Warranty Pill */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 truncate max-w-[170px]">
                          <Store className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{part.storeName.split('(')[0]}</span>
                        </span>
                        <span className="text-emerald-400 font-semibold shrink-0">
                          {part.warrantyMonths}m garantía
                        </span>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <div className="text-base font-black text-white">
                            ${part.price.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
                          </div>
                          {part.originalPrice && (
                            <div className="text-[10px] text-slate-500 line-through">
                              ${part.originalPrice.toFixed(2)} USD
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
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
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
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
              <div className="col-span-full py-16 text-center bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto backdrop-blur-md border border-white/10">
                  <Wrench className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">No encontramos repuestos con los filtros seleccionados</h3>
                <p className="text-slate-300 text-xs max-w-md mx-auto">
                  Intenta quitar el filtro de solo compatibles o pide una cotización personalizada a nuestra red de tiendas aliadas.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('todos');
                      setSearchTerm('');
                      setOnlyCompatible(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20 font-semibold backdrop-blur-md border border-white/10 cursor-pointer"
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-xs text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/25 cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Directorio Oficial de Tiendas y Distribuidores de Autopartes</span>
              </h3>
              <p className="text-xs text-slate-300">
                Puedes contactar directamente a cada tienda o comprar a través de MiGaraje para contar con retención de fondos y garantía.
              </p>
            </div>

            <button
              onClick={() => setShowStoreRegisterModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribir mi Almacén</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerStores.map((store) => (
              <div
                key={store.id}
                className="bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logoUrl || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80'}
                        alt={store.commercialName}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/15 shadow-sm"
                      />
                      <div>
                        <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                          <span>{store.commercialName}</span>
                          {store.verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verificado por MiGaraje" />
                          )}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{store.city}</span>
                        </div>
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{store.rating}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  {/* Marcas */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Marcas que maneja:</span>
                    <div className="flex flex-wrap gap-1">
                      {store.brands.slice(0, 5).map((b, i) => (
                        <span key={i} className="text-[10px] bg-white/10 text-white font-medium px-2 py-0.5 rounded-md border border-white/5">
                          {b}
                        </span>
                      ))}
                      {store.brands.length > 5 && (
                        <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded-md">
                          +{store.brands.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
                    <div className="text-slate-400 font-semibold">Líneas destacadas:</div>
                    <div className="text-slate-300 font-mono text-[10px]">{store.specialties.join(' • ')}</div>
                  </div>
                </div>

                {/* Contact & Buy CTAs */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(store.commercialName)},%20te%20contacto%20desde%20MiGaraje%20para%20consultar%20un%20repuesto`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setSearchTerm(store.commercialName.split(' ')[0]);
                      setMarketplaceView('catalogo');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Ver Catálogo</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Registro de Tienda Aliada (Firestore) */}
      <PartnerStoreModal
        isOpen={showStoreRegisterModal}
        onClose={() => setShowStoreRegisterModal(false)}
        onStoreRegistered={(newStore) => {
          setPartnerStores((prev) => [newStore, ...prev]);
        }}
      />

      {/* Part Detail Modal with Frosted Glass */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            
            <div className="relative h-64 bg-slate-900">
              <img
                src={selectedPart.image}
                alt={selectedPart.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPart(null)}
                className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-xs text-white font-bold">
                {selectedPart.brand} • Código: {selectedPart.partNumber}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPart.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedPart.description}</p>
              </div>

              {/* Compatible Vehicles */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compatibilidad Verificada
                </h4>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-200">
                  {selectedPart.compatibleModels.map((m, idx) => (
                    <span key={idx} className="bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                      {m} ({selectedPart.compatibleYears[0]} - {selectedPart.compatibleYears[1]})
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200">Características Clave:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                  {selectedPart.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Store Guarantee Box */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">{selectedPart.storeName}</span>
                  <p className="text-[11px] text-slate-300">{selectedPart.storeLocation} • {selectedPart.warrantyMonths} meses de garantía</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white">${selectedPart.price.toFixed(2)} USD</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedPart(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
                >
                  Añadir al Carrito / Solicitar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* "Pide tu Repuesto" Quote Modal with Frosted Glass */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
                <HelpCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Solicitud de Repuesto Difícil de Conseguir</h3>
                <p className="text-xs text-slate-300">Intermediamos con más de 80 tiendas e importadores directos</p>
              </div>
            </div>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">¡Solicitud Enviada a la Red de Tiendas!</h4>
                <p className="text-xs text-slate-300">
                  Recibirás hasta 3 cotizaciones comparativas con garantía de intermediación en tu panel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSpecialQuoteSubmit} className="space-y-4 text-xs text-slate-300">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Nombre de la pieza o descripción del repuesto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mangueta delantera derecha con buje original"
                    value={quotePartName}
                    onChange={(e) => setQuotePartName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Número de Parte / OEM (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 48510-09V30"
                      value={quotePartNumber}
                      onChange={(e) => setQuotePartNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white uppercase backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-200 mb-1">Urgencia</label>
                    <select
                      value={quoteUrgency}
                      onChange={(e) => setQuoteUrgency(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-400/40"
                    >
                      <option value="Normal">Normal (3-5 días)</option>
                      <option value="Urgente">Urgente 24h</option>
                      <option value="Importacion">Importación Clásico/USA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Número de Chasis / VIN (Garantiza 100% de compatibilidad)</label>
                  <input
                    type="text"
                    placeholder="Ej: JM1BN1V79K..."
                    value={quoteChassisVin}
                    onChange={(e) => setQuoteChassisVin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white uppercase font-mono backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 cursor-pointer"
                  >
                    Cotizar con Tiendas Aliadas
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
