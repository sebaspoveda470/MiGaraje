import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  ShieldCheck, 
  MapPin, 
  Fuel, 
  Gauge, 
  Sliders, 
  PlusCircle, 
  X, 
  Crown
} from 'lucide-react';
import { VehicleListing } from '../types';

interface CarMarketplaceProps {
  carListings: VehicleListing[];
  onPublishListing: (listing: VehicleListing) => void;
  onOpenIntermediationModal: (listing: VehicleListing) => void;
}

export const CarMarketplace: React.FC<CarMarketplaceProps> = ({
  carListings,
  onPublishListing,
  onOpenIntermediationModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedCondition, setSelectedCondition] = useState('todos');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [selectedCar, setSelectedCar] = useState<VehicleListing | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Form for publishing
  const [pubTitle, setPubTitle] = useState('');
  const [pubBrand, setPubBrand] = useState('Mazda');
  const [pubModel, setPubModel] = useState('');
  const [pubYear, setPubYear] = useState<number>(2020);
  const [pubPrice, setPubPrice] = useState<number>(25000);
  const [pubMileage, setPubMileage] = useState<number>(45000);
  const [pubCondition, setPubCondition] = useState<'usado' | 'seminuevo'>('seminuevo');
  const [pubLocation, setPubLocation] = useState('Bogotá');
  const [pubEngine, setPubEngine] = useState('2.0L Gasolina');
  const [pubTransmission, setPubTransmission] = useState('Automática');
  const [pubDescription, setPubDescription] = useState('');
  const [pubImageUrl, setPubImageUrl] = useState('');

  const brands = ['Todas', 'Mazda', 'Ford', 'Toyota', 'BMW', 'Volkswagen', 'Chevrolet'];

  // Filter listings
  const filteredListings = carListings.filter((car) => {
    if (selectedBrand !== 'Todas' && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    if (selectedCondition !== 'todos' && car.condition !== selectedCondition) {
      return false;
    }
    if (car.price > maxPrice) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = car.title.toLowerCase().includes(q);
      const matchBrand = car.brand.toLowerCase().includes(q);
      const matchModel = car.model.toLowerCase().includes(q);
      const matchLocation = car.location.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchModel && !matchLocation) {
        return false;
      }
    }
    return true;
  });

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: VehicleListing = {
      id: `car-${Date.now()}`,
      title: pubTitle || `${pubBrand} ${pubModel} ${pubYear}`,
      brand: pubBrand,
      model: pubModel,
      year: Number(pubYear),
      price: Number(pubPrice),
      currency: 'USD',
      mileage: Number(pubMileage),
      condition: pubCondition,
      location: pubLocation,
      sellerName: 'Tú (Vendedor Particular)',
      sellerType: 'particular',
      sellerPhone: '+57 300 000 0000',
      sellerVerified: true,
      images: [
        pubImageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: {
        engine: pubEngine,
        transmission: pubTransmission,
        fuel: 'Gasolina',
        horsepower: 180,
        color: 'Gris Grafito',
        doors: 5,
      },
      isClassicPlate: false,
      description: pubDescription || 'Vehículo verificado con historial de mantenimiento al día.',
      tags: ['Intermediación Segura', 'Historial Verificado'],
      intermediationProtected: true,
      publishedAt: 'Recién publicado',
    };

    onPublishListing(newListing);
    setShowPublishModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Marketplace con Intermediación Protegida
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Compra y Venta de Vehículos con Peritaje Certificado
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Protegemos el dinero del comprador y la entrega del vendedor mediante cuenta custodia y peritaje mecánico en talleres aliados.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all shrink-0 cursor-pointer relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar mi Vehículo en Venta</span>
        </button>
      </div>

      {/* Filters Bar with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar marca, modelo o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40"
            />
          </div>

          {/* Brand select */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400/40"
            >
              {brands.map((b) => (
                <option key={b} value={b}>Marca: {b}</option>
              ))}
            </select>
          </div>

          {/* Condition select */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400/40"
            >
              <option value="todos">Condición: Todas</option>
              <option value="seminuevo">Seminuevos Certificados</option>
              <option value="usado">Usados Verificados</option>
              <option value="clasico_antiguo">Clásicos con Placa Antiguo</option>
              <option value="para_restaurar">Proyectos para Restaurar</option>
            </select>
          </div>

          {/* Max price slider */}
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            <span className="text-[11px] text-slate-300 whitespace-nowrap">Máx:</span>
            <input
              type="range"
              min="5000"
              max="70000"
              step="2500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-white">${(maxPrice / 1000).toFixed(0)}k</span>
          </div>

        </div>
      </div>

      {/* Vehicle Grid with Frosted Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((car) => (
          <div
            key={car.id}
            className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-blue-400/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col group"
          >
            {/* Image & Badges */}
            <div 
              onClick={() => setSelectedCar(car)}
              className="h-52 bg-white/5 relative overflow-hidden cursor-pointer"
            >
              <img
                src={car.images[0]}
                alt={car.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {car.isClassicPlate ? (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Placa Antiguo
                  </span>
                ) : (
                  <span className="bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase">
                    {car.condition.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white font-black text-sm px-3 py-1 rounded-xl border border-white/15 shadow">
                ${car.price.toLocaleString()} {car.currency}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {car.location}
                  </span>
                  <span>{car.publishedAt}</span>
                </div>

                <h3 
                  onClick={() => setSelectedCar(car)}
                  className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 cursor-pointer"
                >
                  {car.title}
                </h3>

                {/* Specs pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-slate-300 text-[11px] pt-1">
                  <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Gauge className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                    <span>{car.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Sliders className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                    <span className="truncate block">{car.specs.transmission.split(' ')[0]}</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Fuel className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                    <span>Año {car.year}</span>
                  </div>
                </div>
              </div>

              {/* Footer with Intermediation CTA */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 truncate">
                  Vendedor: <strong className="text-white">{car.sellerName.split(' ')[0]}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCar(car)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                  >
                    Ver Ficha
                  </button>
                  <button
                    onClick={() => onOpenIntermediationModal(car)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Comprar Seguro</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Detail Modal with Frosted Glass */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
            
            <div className="relative h-72 bg-slate-900">
              <img
                src={selectedCar.images[0]}
                alt={selectedCar.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCar(null)}
                className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-3">
                <span className="text-xl font-black text-white">
                  ${selectedCar.price.toLocaleString()} {selectedCar.currency}
                </span>
                <span className="text-xs text-slate-300">Año {selectedCar.year} • {selectedCar.mileage.toLocaleString()} km</span>
              </div>
            </div>

            <div className="p-6 space-y-5 text-slate-200">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCar.title}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedCar.location} • Publicado por {selectedCar.sellerName}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px]">Motor / Potencia</span>
                  <span className="font-bold text-white">{selectedCar.specs.engine}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px]">Transmisión</span>
                  <span className="font-bold text-white">{selectedCar.specs.transmission}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px]">Color / Carrocería</span>
                  <span className="font-bold text-white">{selectedCar.specs.color}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 block text-[10px]">Estado Legal</span>
                  <span className="font-bold text-emerald-400">Listo para Traspaso</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-1">Descripción del Vendedor:</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10 backdrop-blur-md">
                  {selectedCar.description}
                </p>
              </div>

              {/* Intermediation Guarantee banner */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white">Compra Segura con Intermediación MiGaraje</span>
                    <p className="text-[11px] text-slate-300">Peritaje de 180 puntos incluido, revisión de antecedentes y custodia de pago.</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedCar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const car = selectedCar;
                    setSelectedCar(null);
                    onOpenIntermediationModal(car);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
                >
                  Solicitar Proceso de Compra e Intermediación
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Publish Car Modal with Frosted Glass */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-xl w-full shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
                <Car className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Publicar Vehículo en Venta</h3>
                <p className="text-xs text-slate-300">Llega a compradores verificados y asegura el traspaso</p>
              </div>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Título del Anuncio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mazda 3 Skyactiv Grand Touring 2020 impecable"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Marca</label>
                  <select
                    value={pubBrand}
                    onChange={(e) => setPubBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-400/40"
                  >
                    {brands.filter(b => b !== 'Todas').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mazda 3"
                    value={pubModel}
                    onChange={(e) => setPubModel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Año</label>
                  <input
                    type="number"
                    value={pubYear}
                    onChange={(e) => setPubYear(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Precio (USD)</label>
                  <input
                    type="number"
                    value={pubPrice}
                    onChange={(e) => setPubPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Kilometraje (km)</label>
                  <input
                    type="number"
                    value={pubMileage}
                    onChange={(e) => setPubMileage(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Ciudad / Ubicación</label>
                  <input
                    type="text"
                    value={pubLocation}
                    onChange={(e) => setPubLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">URL de Foto Principal</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={pubImageUrl}
                    onChange={(e) => setPubImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Descripción y Extras</label>
                <textarea
                  rows={3}
                  placeholder="Detalla historial de mantenimientos, estado de llantas, documentación al día..."
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 cursor-pointer"
                >
                  Publicar Anuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
