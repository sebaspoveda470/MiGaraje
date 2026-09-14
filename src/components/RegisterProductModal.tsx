import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Store, 
  User, 
  Upload, 
  Check, 
  Phone, 
  DollarSign, 
  Tag, 
  Package, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CareProduct, CareCategory } from '../types';

interface RegisterProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductRegistered: (newProduct: CareProduct) => void;
}

const PRESET_IMAGES_BY_CATEGORY: Record<CareCategory, string[]> = {
  exterior: [
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  ],
  motor_aditivos: [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
  ],
  interior: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  ],
  herramientas: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  ],
};

export const RegisterProductModal: React.FC<RegisterProductModalProps> = ({
  isOpen,
  onClose,
  onProductRegistered,
}) => {
  const [sellerType, setSellerType] = useState<'tienda' | 'persona'>('tienda');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerCity, setSellerCity] = useState('Bogotá, Colombia');

  // Product Details
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<CareCategory>('exterior');
  const [subcategory, setSubcategory] = useState('Ceras & Selladores');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('500 ml');
  const [description, setDescription] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(
    PRESET_IMAGES_BY_CATEGORY['exterior'][0]
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (cat: CareCategory) => {
    setCategory(cat);
    const presets = PRESET_IMAGES_BY_CATEGORY[cat];
    if (presets && presets.length > 0) {
      setSelectedPresetImage(presets[0]);
    }
    if (cat === 'exterior') setSubcategory('Ceras & Selladores');
    else if (cat === 'motor_aditivos') setSubcategory('Tratamientos de Motor & Aditivos');
    else if (cat === 'interior') setSubcategory('Cuidado de Cuero & Plásticos');
    else setSubcategory('Herramientas & Microfibras');
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'El nombre del producto es obligatorio';
    if (!brand.trim()) newErrors.brand = 'La marca o fabricante es obligatoria';
    if (!sellerName.trim()) newErrors.sellerName = 'Ingresa el nombre del vendedor o tienda';
    if (!sellerPhone.trim()) newErrors.sellerPhone = 'El teléfono o WhatsApp es necesario para clientes';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) newErrors.price = 'Ingresa un precio válido en USD';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const finalImage = customImage || selectedPresetImage;

    const newProduct: CareProduct = {
      id: `prod-care-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      category,
      subcategory: subcategory.trim() || 'Estética Automotriz',
      price: parseFloat(price),
      rating: 5.0,
      reviewsCount: 1,
      description: description.trim() || `Producto garantizado por ${sellerName}. Envío coordinado desde ${sellerCity}.`,
      volume: volume.trim() || 'Unidad estándar',
      applicationGuide: [
        'Limpiar la superficie antes de aplicar.',
        'Usar aplicador de microfibra en movimientos circulares o uniformes.',
        'Dejar actuar y retirar con paño limpio.',
      ],
      benefits: [
        'Fórmula de alto rendimiento certificada',
        'Vendido por vendedor verificado MiGaraje',
        'Intermediación con retención de fondos segura',
      ],
      image: finalImage,
      inStock: true,
      idealFor: ['Pintura automotriz', 'Motores y compartimento', 'Todo tipo de vehículos'],
    };

    setTimeout(() => {
      onProductRegistered(newProduct);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Crisp and Clean */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Inscribir Producto para la Venta
              </h2>
              <p className="text-xs text-slate-300">
                Sección de Estética, Detailing y Tratamientos de Motor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          
          {/* Seller Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ¿Quién publica este producto?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSellerType('tienda')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  sellerType === 'tienda'
                    ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${sellerType === 'tienda' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Almacén / Tienda</div>
                  <div className="text-[11px] text-slate-500">Distribuidor o local</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSellerType('persona')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  sellerType === 'persona'
                    ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${sellerType === 'persona' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Particular / Detailer</div>
                  <div className="text-[11px] text-slate-500">Vendedor independiente</div>
                </div>
              </button>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Datos de Contacto del Vendedor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {sellerType === 'tienda' ? 'Nombre del Almacén o Tienda *' : 'Nombre Completo del Vendedor *'}
                </label>
                <input
                  type="text"
                  placeholder={sellerType === 'tienda' ? 'Ej. Detailers Colombia SAS' : 'Ej. Carlos Méndez'}
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
                {errors.sellerName && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.sellerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp o Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  placeholder="+57 310 000 0000"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
                {errors.sellerPhone && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.sellerPhone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ciudad o Ubicación de Envío
                </label>
                <input
                  type="text"
                  placeholder="Ej. Medellín, Envigado o Bogotá"
                  value={sellerCity}
                  onChange={(e) => setSellerCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Product Data */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              Información del Producto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cera Cerámica Hidrofóbica 500ml con Aplicador"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
                {errors.name && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Marca o Fabricante *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Meguiar's, Liqui Moly, Chemical Guys, Sonax"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
                {errors.brand && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
                {errors.price && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as CareCategory)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none transition-all"
                >
                  <option value="exterior">Carrocería & Exterior (Ceras, Shampoos, Cerámicos)</option>
                  <option value="motor_aditivos">Motor & Aditivos (Limpiadores, Cera Tec, Aceites)</option>
                  <option value="interior">Interior & Habitáculo (Cuero, Plásticos, Tapicería)</option>
                  <option value="herramientas">Herramientas & Microfibras (Pulidoras, Aplicadores)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contenido / Presentación
                </label>
                <input
                  type="text"
                  placeholder="Ej. 473 ml, 1 Galón, Kit 3 Piezas"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descripción o Beneficios Clave
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué hace especial este producto, cómo se aplica o para qué autos se recomienda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Photo Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Foto del Producto
              </label>

              {/* Upload Custom */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer border border-slate-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Subir foto desde tu dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {customImage && (
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Foto personalizada cargada
                  </span>
                )}
              </div>

              {/* Presets selector if no custom photo */}
              {!customImage && (
                <div>
                  <div className="text-[11px] text-slate-500 mb-1.5">O elige una foto sugerida del catálogo:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_IMAGES_BY_CATEGORY[category].map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPresetImage(imgUrl)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPresetImage === imgUrl ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Preset preview" className="w-full h-full object-cover" />
                        {selectedPresetImage === imgUrl && (
                          <div className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="leading-snug">
              Al publicar, tu producto queda cubierto con la intermediación y garantía MiGaraje. Los clientes pueden comprar directo o contactarte por WhatsApp.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Inscribiendo...' : 'Publicar Producto'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
