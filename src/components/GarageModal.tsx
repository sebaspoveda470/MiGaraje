import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Fuel, 
  Gauge, 
  Calendar,
  Upload,
  Camera,
  CheckCircle2,
  SlidersHorizontal,
  Edit3,
  Trash2
} from 'lucide-react';
import { Vehicle, VehicleCategory } from '../types';
import { getVehicleReferenceImage, getVehicleImageOptions } from '../utils/vehicleImages';
import { compressImageFile } from '../utils/media';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Vehicle) => void;
  onUpdateVehicle?: (updatedVehicle: Vehicle) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
  vehicleToEdit?: Vehicle | null;
}

const POPULAR_BRANDS = [
  'Toyota', 'Mazda', 'Chevrolet', 'Ford', 'BMW', 'Volkswagen', 
  'Mercedes-Benz', 'Nissan', 'Renault', 'Honda', 'Audi', 'Jeep', 'Porsche', 'Subaru'
];

const POPULAR_MODELS_BY_BRAND: Record<string, string[]> = {
  Toyota: ['Corolla', 'Hilux', 'Land Cruiser FJ40', 'Fortuner', 'Prado', 'RAV4', 'Yaris', 'Supra GR'],
  Mazda: ['Mazda 3', 'CX-30', 'MX-5 Miata', 'CX-5', 'Mazda 2', 'Mazda 6', '323 Allegro'],
  Chevrolet: ['Tracker', 'Camaro SS', 'Onix', 'Cruze', 'Silverado', 'D-Max', 'Sail', 'Captiva'],
  Ford: ['Mustang GT 5.0', 'Ranger Raptor', 'Bronco', 'Fiesta ST', 'Focus', 'Explorer', 'F-150'],
  BMW: ['Serie 3 (G20)', 'M3 Competition', 'Serie 3 (E46)', 'Serie 3 (E30)', 'Serie 1', 'X3', 'X5'],
  Volkswagen: ['Golf GTI', 'Jetta', 'Beetle / Escarabajo', 'Polo', 'Gol', 'Tiguan', 'Amarok'],
  'Mercedes-Benz': ['Clase C 200', 'Clase G (G63)', 'Clase A', 'Clase E', 'GLC', 'W123 Clásico'],
  Nissan: ['370Z / 350Z', 'Frontier', 'GT-R', 'Sentra', 'Versa', 'Kicks', 'Patrol / Samurai'],
  Renault: ['Duster 4x4', 'Sandero Stepway', 'Clio RS', 'Logan', 'Kwid', 'Renault 4 Plus'],
  Honda: ['Civic VTEC', 'Civic Type R', 'CR-V', 'City', 'Fit', 'Accord'],
  Audi: ['A3 Sedán', 'A4 Quattro', 'RS3', 'Q3', 'Q5', 'Q7'],
  Jeep: ['Wrangler Rubicon', 'Grand Cherokee', 'Gladiator', 'Renegade', 'Cherokee XJ'],
  Porsche: ['911 Carrera S', '718 Cayman', 'Cayenne', 'Macan', 'Taycan'],
  Subaru: ['WRX STI', 'Forester', 'Impreza', 'Outback', 'XV'],
};

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  vehicleToEdit = null,
}) => {
  const isEditing = Boolean(vehicleToEdit);

  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('Corolla');
  const [year, setYear] = useState<number>(2022);
  const [version, setVersion] = useState('XEI 2.0L');
  const [engine, setEngine] = useState('');
  const [mileage, setMileage] = useState<number>(35000);
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [type, setType] = useState<VehicleCategory>('diario');
  const [transmission, setTransmission] = useState<'Manual' | 'Automática' | 'Secuencial'>('Automática');
  const [fuelType, setFuelType] = useState<'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico'>('Gasolina');
  const [hasClassicPlates, setHasClassicPlates] = useState<boolean>(false);
  const [customUserPhoto, setCustomUserPhoto] = useState<string | null>(null);
  const [selectedVariantUrl, setSelectedVariantUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [soatExpiry, setSoatExpiry] = useState('');
  const [tecnoExpiry, setTecnoExpiry] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync states whenever vehicleToEdit changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        setBrand(vehicleToEdit.brand || 'Toyota');
        setModel(vehicleToEdit.model || 'Corolla');
        setYear(vehicleToEdit.year || 2022);
        setVersion(vehicleToEdit.version || '');
        setEngine(vehicleToEdit.engine || '');
        setMileage(vehicleToEdit.mileage || 0);
        setPlate(vehicleToEdit.plate || '');
        setVin(vehicleToEdit.vin || '');
        setType(vehicleToEdit.type || 'diario');
        setTransmission(vehicleToEdit.transmission || 'Automática');
        setFuelType(vehicleToEdit.fuelType || 'Gasolina');
        setHasClassicPlates(Boolean(vehicleToEdit.hasClassicPlates));
        setCustomUserPhoto(vehicleToEdit.image || null);
        setSelectedVariantUrl('');
        setNotes(vehicleToEdit.notes || '');
        setSoatExpiry(vehicleToEdit.soatExpiry || '');
        setTecnoExpiry(vehicleToEdit.tecnoExpiry || '');
        setShowDeleteConfirm(false);
      } else {
        setBrand('Toyota');
        setModel('Corolla');
        setYear(2022);
        setVersion('XEI 2.0L');
        setEngine('');
        setMileage(35000);
        setPlate('');
        setVin('');
        setType('diario');
        setTransmission('Automática');
        setFuelType('Gasolina');
        setHasClassicPlates(false);
        setCustomUserPhoto(null);
        setSelectedVariantUrl('');
        setNotes('');
        setSoatExpiry('');
        setTecnoExpiry('');
        setShowDeleteConfirm(false);
      }
    }
  }, [isOpen, vehicleToEdit]);

  // Image calculations
  const referenceOptions = useMemo(() => {
    return getVehicleImageOptions(brand, model, type);
  }, [brand, model, type]);

  const activePreviewImage = useMemo(() => {
    if (customUserPhoto) return customUserPhoto;
    if (selectedVariantUrl) return selectedVariantUrl;
    return getVehicleReferenceImage(brand, model, year, type);
  }, [customUserPhoto, selectedVariantUrl, brand, model, year, type]);

  if (!isOpen) return null;

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const models = POPULAR_MODELS_BY_BRAND[newBrand] || ['Modelo'];
    setModel(models[0]);
    setSelectedVariantUrl('');
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setSelectedVariantUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCustomUserPhoto(await compressImageFile(file));
    } catch (err) {
      console.error('Error procesando foto', err);
    }
  };

  const handleRemoveCustomPhoto = () => {
    setCustomUserPhoto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    if (isEditing && vehicleToEdit) {
      const updatedVehicle: Vehicle = {
        ...vehicleToEdit,
        brand,
        model,
        year: Number(year),
        version: version.trim() || undefined,
        engine: engine.trim() || undefined,
        mileage: Number(mileage) || 0,
        plate: plate.trim().toUpperCase() || undefined,
        vin: vin.trim().toUpperCase() || undefined,
        type,
        transmission,
        fuelType,
        hasClassicPlates,
        image: activePreviewImage,
        notes: notes.trim() || undefined,
        soatExpiry: soatExpiry || undefined,
        tecnoExpiry: tecnoExpiry || undefined,
      };

      if (onUpdateVehicle) {
        onUpdateVehicle(updatedVehicle);
      }
    } else {
      const newVehicle: Vehicle = {
        id: `veh_${Date.now()}`,
        brand,
        model,
        year: Number(year),
        version: version.trim() || undefined,
        engine: engine.trim() || undefined,
        mileage: Number(mileage) || 0,
        plate: plate.trim().toUpperCase() || undefined,
        vin: vin.trim().toUpperCase() || undefined,
        type,
        transmission,
        fuelType,
        hasClassicPlates,
        image: activePreviewImage,
        notes: notes.trim() || undefined,
        soatExpiry: soatExpiry || undefined,
        tecnoExpiry: tecnoExpiry || undefined,
        dateAdded: new Date().toISOString(),
      };

      onAddVehicle(newVehicle);
    }

    onClose();
  };

  const handleDelete = () => {
    if (vehicleToEdit && onDeleteVehicle) {
      onDeleteVehicle(vehicleToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-2xl overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] bg-white text-slate-900 rounded-3xl shadow-2xl shadow-black/80 border border-slate-200 flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header - Fixed */}
        <div className="shrink-0 bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Car className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {isEditing ? `Modificar Datos de ${vehicleToEdit?.brand} ${vehicleToEdit?.model}` : 'Registrar Nuevo Vehículo'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                {isEditing 
                  ? 'Actualiza kilometraje, placas, motor, foto o especificaciones' 
                  : 'Plan de mantenimiento y recordatorios de SOAT y tecnomecánica'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 bg-slate-50/70 overscroll-contain">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* OPTIONAL VEHICLE PHOTO CARD */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Foto del Vehículo <span className="text-slate-400 font-normal">(Opcional)</span>
                  </span>
                </div>

                {customUserPhoto ? (
                  <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    Foto Personal Subida
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Referencia Automática ({brand} {model})
                  </span>
                )}
              </div>

              {/* Photo Preview Box */}
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner group">
                <img
                  src={activePreviewImage}
                  alt={`${brand} ${model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                {/* Top Actions */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  {customUserPhoto && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomPhoto}
                      className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-all cursor-pointer"
                      title="Eliminar foto subida y volver a la referencia automática"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <label className="bg-white hover:bg-slate-100 text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{customUserPhoto ? 'Cambiar Foto' : 'Subir Foto de mi Auto (Opcional)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Bottom Legend */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <div className="text-base font-black leading-tight drop-shadow-md">
                    {brand} {model} {year}
                  </div>
                  <div className="text-xs text-blue-200 font-medium capitalize">
                    {type.replace('_', ' ')} • {fuelType} • {transmission}
                  </div>
                </div>
              </div>

              {/* Alternate Color Variants */}
              {!customUserPhoto && referenceOptions.length > 1 && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-slate-600 shrink-0 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                    Variantes:
                  </span>
                  {referenceOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantUrl(opt.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${
                        activePreviewImage === opt.url
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label} ({opt.tag})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Brands Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Marca del Vehículo *</span>
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">Selecciona o escribe abajo</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 pb-1 mb-2">
                {POPULAR_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandChange(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      brand === b
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                placeholder="O escribe otra marca..."
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>

            {/* Model & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Línea / Modelo *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corolla, Mazda 3, Mustang, Golf..."
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
                {POPULAR_MODELS_BY_BRAND[brand] && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {POPULAR_MODELS_BY_BRAND[brand].slice(0, 4).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleModelChange(m)}
                        className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600 cursor-pointer font-medium"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Año de Fabricación *</span>
                </label>
                <input
                  type="number"
                  required
                  min={1940}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none shadow-xs font-bold"
                />
              </div>
            </div>

            {/* Version & Engine */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Versión / Trim
                </label>
                <input
                  type="text"
                  placeholder="Ej. Touring, GT, Limited, Sport"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motor / Cilindrada
                </label>
                <input
                  type="text"
                  placeholder="Ej. 2.0L SkyActiv, 1.4 TSI, V6 3.6L"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Mileage & Plate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span>Kilometraje Actual (km) *</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none shadow-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Placa / Matrícula (Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. ABC-123"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none uppercase font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Document expiry dates for reminders */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-slate-800">Recordatorios de documentos (opcional)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vencimiento del SOAT</label>
                  <input
                    type="date"
                    value={soatExpiry}
                    onChange={(e) => setSoatExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vencimiento de la Revisión Técnico-Mecánica</label>
                  <input
                    type="date"
                    value={tecnoExpiry}
                    onChange={(e) => setTecnoExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none shadow-xs"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Las encuentras en tu póliza del SOAT, en el certificado de la revisión o en el RUNT.</p>
            </div>

            {/* Type / Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoría del Vehículo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'diario', label: 'Uso Diario / Urbano' },
                  { id: 'deportivo', label: 'Deportivo / Performance' },
                  { id: 'camioneta', label: 'Camioneta / SUV / 4x4' },
                  { id: 'clasico_placas', label: 'Clásico de Colección' },
                  { id: 'proyecto_restauracion', label: 'Proyecto Restauración' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      type === t.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel & Transmission */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span>Combustible</span>
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none shadow-xs"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Transmisión
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none shadow-xs"
                >
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                  <option value="Secuencial">Secuencial</option>
                </select>
              </div>
            </div>

            {/* Submit & Actions */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios del Vehículo' : 'Agregar Vehículo a mi Garaje'}</span>
                </button>
              </div>

              {isEditing && onDeleteVehicle && (
                <div className="pt-2 border-t border-slate-200">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar este vehículo de mi garaje</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                      <span className="text-xs text-red-700 font-medium">¿Estás seguro de eliminar este auto?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
                        >
                          Sí, Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
