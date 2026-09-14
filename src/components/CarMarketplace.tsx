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
  Crown, 
  Phone, 
  MessageCircle, 
  X, 
  ChevronRight,
  Filter,
  Sparkles,
  Award,
  DollarSign
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
  const [selectedBrand, setSelectedBrand] = useState('todas');
  const [selectedCondition, setSelectedCondition] = useState('todos');
  const [maxPrice, setMaxPrice] = useState<number>(70000);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<VehicleListing | null>(null);

  // Form State for Publishing
  const [pubTitle, setPubTitle] = useState('');
  const [pubBrand, setPubBrand] = useState('Toyota');
  const [pubModel, setPubModel] = useState('');
  const [pubYear, setPubYear] = useState(2021);
  const [pubPrice, setPubPrice] = useState(24000);
  const [pubMileage, setPubMileage] = useState(45000);
  const [pubCondition, setPubCondition] = useState<'seminuevo' | 'usado' | 'clasico_antiguo' | 'para_restaurar'>('seminuevo');
  const [pubLocation, setPubLocation] = useState('Bogotá D.C.');
  const [pubEngine, setPubEngine] = useState('2.0L Turbo 4-cil');
  const [pubTransmission, setPubTransmission] = useState('Automática');
  const [pubDescription, setPubDescription] = useState('');
  const [pubImageUrl, setPubImageUrl] = useState('');

  // Extract unique brands for filter
  const brands = ['todas', ...Array.from(new Set(carListings.map((c) => c.brand)))];

  // Filter listings
  const filteredListings = carListings.filter((car) => {
    if (selectedBrand !== 'todas' && car.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
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
      
      {/* Header Banner: Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Compra & Venta Segura
            </span>
            <span className="text-xs text-slate-500 font-medium">Peritaje Técnico & Custodia Escrow</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Compra tu próximo vehículo sin sorpresas mecánicas ni estafas
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Cada auto publicado cuenta con revisión de historial en RUNT/SIMIT, peritaje de 120 puntos y custodia bancaria hasta que el traspaso quede radicado.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-lime-400" />
          <span>Publicar mi Vehículo</span>
        </button>
      </div>

      {/* Filter and Search Bar: Clean White Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Brand select */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === 'todas' ? 'Todas las Marcas' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Condition select */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="todos">Condición: Todas</option>
              <option value="seminuevo">Seminuevos Certificados</option>
              <option value="usado">Usados Verificados</option>
              <option value="clasico_antiguo">Clásicos con Placa Antiguo</option>
              <option value="para_restaurar">Proyectos para Restaurar</option>
            </select>
          </div>

          {/* Max price slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 whitespace-nowrap">Presupuesto:</span>
            <input
              type="range"
              min="5000"
              max="70000"
              step="2500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-950 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-900">${(maxPrice / 1000).toFixed(0)}k</span>
          </div>

        </div>
      </div>

      {/* Vehicle Grid: Clean White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((car) => (
          <div
            key={car.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            {/* Image & Badges */}
            <div 
              onClick={() => setSelectedCar(car)}
              className="h-52 bg-slate-100 relative overflow-hidden cursor-pointer"
            >
              <img
                src={car.images[0]}
                alt={car.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {car.isClassicPlate ? (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Placa Antiguo
                  </span>
                ) : (
                  <span className="bg-slate-950 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                    {car.condition.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-slate-950 font-black text-sm px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                ${car.price.toLocaleString()} {car.currency}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {car.location}
                  </span>
                  <span>{car.publishedAt}</span>
                </div>

                <h3 
                  onClick={() => setSelectedCar(car)}
                  className="text-base font-black text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                >
                  {car.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {car.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] text-slate-600">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{car.year}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" />
                    <span>{(car.mileage / 1000).toFixed(0)}k km</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-slate-400" />
                    <span className="capitalize">{car.specs.fuel}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedCar(car)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Ver Ficha
                </button>

                <button
                  onClick={() => onOpenIntermediationModal(car)}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Intermediación</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Car Details Modal: Clean White Card */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setSelectedCar(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 border border-slate-200 cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-16/9 bg-slate-100 relative">
              <img
                src={selectedCar.images[0]}
                alt={selectedCar.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded shadow-xs">
                  {selectedCar.brand} {selectedCar.model}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-slate-950">{selectedCar.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCar.location}</span>
                    <span>•</span>
                    <span>{selectedCar.mileage.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="text-2xl font-black text-slate-950">
                  ${selectedCar.price.toLocaleString()} {selectedCar.currency}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedCar.description}
              </p>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Motor</span>
                  <span className="font-bold text-slate-900">{selectedCar.specs.engine}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Transmisión</span>
                  <span className="font-bold text-slate-900">{selectedCar.specs.transmission}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Año</span>
                  <span className="font-bold text-slate-900">{selectedCar.year}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Vendedor</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedCar.sellerType}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Contacto directo o compra intermediada con custodia de fondos.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onOpenIntermediationModal(selectedCar);
                      setSelectedCar(null);
                    }}
                    className="flex-1 sm:flex-none bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-lime-400" />
                    <span>Iniciar Compra Segura</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Publish Vehicle Modal: Clean White Card */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-950 border border-slate-200">
                <Car className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Publicar Vehículo en MiGaraje</h3>
                <p className="text-xs text-slate-500">Compradores calificados en Colombia con verificación previa</p>
              </div>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={pubBrand}
                    onChange={(e) => setPubBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={pubModel}
                    onChange={(e) => setPubModel(e.target.value)}
                    placeholder="Ej: CX-5 Grand Touring"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Año</label>
                  <input
                    type="number"
                    value={pubYear}
                    onChange={(e) => setPubYear(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Precio (USD / COP)</label>
                  <input
                    type="number"
                    value={pubPrice}
                    onChange={(e) => setPubPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Kilometraje</label>
                  <input
                    type="number"
                    value={pubMileage}
                    onChange={(e) => setPubMileage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Condición</label>
                  <select
                    value={pubCondition}
                    onChange={(e: any) => setPubCondition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="seminuevo">Seminuevo Certificado</option>
                    <option value="usado">Usado en Buen Estado</option>
                    <option value="clasico_antiguo">Clásico con Placas Antiguo</option>
                    <option value="para_restaurar">Proyecto para Restaurar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Ubicación / Ciudad</label>
                  <input
                    type="text"
                    value={pubLocation}
                    onChange={(e) => setPubLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1">URL de la Foto Principal</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={pubImageUrl}
                  onChange={(e) => setPubImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1">Descripción del Vehículo</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre historial de revisiones, mantenimientos recientes, accesorios incluidos..."
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Publicar Vehículo
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
