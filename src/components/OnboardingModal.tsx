import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Fuel, 
  Gauge, 
  Calendar, 
  Crown,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RefreshCcw
} from 'lucide-react';
import { UserProfile, Vehicle, VehicleCategory } from '../types';
import { Logo } from './Logo';
import { getVehicleReferenceImage, getVehicleImageOptions } from '../utils/vehicleImages';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete: (user: UserProfile, vehicle: Vehicle) => void;
  onLoginExisting?: (user: UserProfile) => void;
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

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onLoginExisting
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // User form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bogotá, Colombia');
  const [role, setRole] = useState<'propietario' | 'entusiasta' | 'coleccionista' | 'mecanico'>('propietario');
  const [userErrors, setUserErrors] = useState<{ fullName?: string; email?: string }>({});

  // Vehicle form state
  const [brand, setBrand] = useState('Mazda');
  const [model, setModel] = useState('Mazda 3');
  const [year, setYear] = useState<number>(2021);
  const [version, setVersion] = useState('');
  const [mileage, setMileage] = useState<number>(45000);
  const [plate, setPlate] = useState('');
  const [type, setType] = useState<VehicleCategory>('diario');
  const [transmission, setTransmission] = useState<'Manual' | 'Automática' | 'Secuencial'>('Automática');
  const [fuelType, setFuelType] = useState<'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico'>('Gasolina');
  const [hasClassicPlates, setHasClassicPlates] = useState<boolean>(false);
  
  // Custom uploaded photo (optional) vs Auto reference
  const [customUserPhoto, setCustomUserPhoto] = useState<string | null>(null);
  const [selectedVariantUrl, setSelectedVariantUrl] = useState<string>('');

  // Calculate matching reference images
  const referenceOptions = useMemo(() => {
    return getVehicleImageOptions(brand, model, type);
  }, [brand, model, type]);

  // Current active preview image:
  // 1. Custom uploaded photo by user (if provided)
  // 2. Selected reference variant (if user clicked a variant)
  // 3. Automatically generated model reference
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomUserPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomPhoto = () => {
    setCustomUserPhoto(null);
  };

  const validateUserStep = () => {
    const errors: { fullName?: string; email?: string } = {};
    if (!fullName.trim()) {
      errors.fullName = 'Por favor ingresa tu nombre completo';
    }
    if (!email.trim() || !email.includes('@')) {
      errors.email = 'Por favor ingresa un correo electrónico válido';
    }
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextToVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserStep()) {
      setStep(2);
    }
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim() || 'Propietario MiGaraje',
      email: email.trim() || 'usuario@migaraje.com',
      phone: phone.trim() || undefined,
      city: city.trim() || 'Ciudad',
      role,
      joinedDate: new Date().toISOString(),
    };

    const finalImage = activePreviewImage;

    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      brand,
      model,
      year: Number(year),
      version: version.trim() || undefined,
      mileage: Number(mileage) || 0,
      plate: plate.trim().toUpperCase() || undefined,
      type,
      transmission,
      fuelType,
      hasClassicPlates,
      image: finalImage,
      dateAdded: new Date().toISOString(),
    };

    onComplete(newUser, newVehicle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-2xl overflow-hidden animate-fade-in">
      
      {/* Main Modal Container with Enhanced White Surfaces and Crisp Aesthetics */}
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] bg-white text-slate-900 rounded-3xl shadow-2xl shadow-black/80 border border-slate-200 flex flex-col overflow-hidden my-auto">
        
        {/* Top Accent Header Bar - Fixed Shrink-0 */}
        <div className="shrink-0 bg-slate-950 text-white p-4 sm:p-6 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Cerrar y navegar como invitado"
              className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar y navegar la web"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="relative z-10">
            <div className="flex justify-center mb-2">
              <Logo size="md" showTagline={false} showBadge={false} />
            </div>
            
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {step === 1 ? 'Bienvenido a tu Garaje Digital' : 'Registra tu Vehículo Real'}
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-300 mt-0.5 max-w-md mx-auto leading-relaxed">
              {step === 1 
                ? 'Crea tu cuenta para acceder a recomendaciones de repuestos exactos, diagnóstico IA y clubes de marca.'
                : 'Ingresa los datos de tu auto. Puedes subir tu propia foto o usar nuestra imagen de referencia automática.'}
            </p>

            {/* Stepper with Crisp White Highlights */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
              <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                step === 1 
                  ? 'bg-white text-slate-950 shadow-md shadow-white/20' 
                  : 'bg-white/10 text-slate-400 border border-white/10'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                }`}>1</div>
                <span>1. Usuario</span>
              </div>

              <div className="w-4 sm:w-6 h-0.5 bg-white/20" />

              <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                step === 2 
                  ? 'bg-white text-slate-950 shadow-md shadow-white/20' 
                  : 'bg-white/10 text-slate-400 border border-white/10'
              }`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                }`}>2</div>
                <span>2. Vehículo & Foto</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-slate-50/70 overscroll-contain">
          
          {/* STEP 1: USER REGISTRATION */}
          {step === 1 && (
            <form onSubmit={handleNextToVehicle} className="space-y-4">
              
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 font-medium">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Tus datos y tus vehículos quedarán guardados de forma segura en tu dispositivo para ingresar de inmediato.</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Nombre Completo *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sebastián Poveda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                />
                {userErrors.fullName && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{userErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Correo Electrónico *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu.correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                />
                {userErrors.email && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{userErrors.email}</p>
                )}
              </div>

              {/* Phone & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>WhatsApp / Celular</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 310 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Ciudad</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Bogotá, Medellín, Cali..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Profile Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-blue-600" />
                  <span>Tipo de Perfil</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'propietario', label: 'Propietario' },
                    { id: 'entusiasta', label: 'Entusiasta' },
                    { id: 'coleccionista', label: 'Coleccionista' },
                    { id: 'mecanico', label: 'Mecánico / Taller' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        role === r.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Step 1 */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar al Registro de tu Vehículo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VEHICLE REGISTRATION + OPTIONAL PHOTO UPLOAD */}
          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-4">
              
              {/* VEHICLE PHOTO CARD (CUSTOM UPLOAD OR AUTOMATIC REFERENCE) */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Foto de tu Vehículo <span className="text-slate-400 font-normal">(Opcional)</span>
                    </span>
                  </div>

                  {customUserPhoto ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Foto Personal Subida
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Referencia Automática ({brand} {model})
                    </span>
                  )}
                </div>

                {/* Photo Preview Container */}
                <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner group">
                  <img
                    src={activePreviewImage}
                    alt={`${brand} ${model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Top-Right Action Controls */}
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

                  {/* Bottom Vehicle Legend */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-base font-black leading-tight drop-shadow-md">
                      {brand} {model} {year}
                    </div>
                    <div className="text-xs text-blue-200 font-medium capitalize">
                      {type.replace('_', ' ')} • {fuelType} • {transmission}
                    </div>
                  </div>
                </div>

                {/* Alternate Color Variants (only when using reference photo) */}
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

              {/* Popular Brand Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Marca del Vehículo *</span>
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">Selecciona o escribe abajo</span>
                </label>
                
                {/* Brand Visual Chips */}
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
                    placeholder="Ej. 45000"
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

              {/* Type / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Vehículo & Categoría
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

              {/* Navigation Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar e Ingresar a MiGaraje</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
