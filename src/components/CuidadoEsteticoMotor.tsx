import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  Droplet, 
  Flame, 
  Layers, 
  Check, 
  BookOpen, 
  X, 
  ShieldCheck,
  Store,
  PlusCircle,
  PackageCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { CareProduct, CareCategory, CartItem } from '../types';
import { RegisterProductModal } from './RegisterProductModal';

interface CuidadoEsteticoMotorProps {
  careProducts: CareProduct[];
  onAddToCart: (item: CartItem) => void;
  onRegisterProduct?: (newProduct: CareProduct) => void;
}

export const CuidadoEsteticoMotor: React.FC<CuidadoEsteticoMotorProps> = ({
  careProducts,
  onAddToCart,
  onRegisterProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CareProduct | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showRegisterProductModal, setShowRegisterProductModal] = useState<boolean>(false);
  const [activeGuideType, setActiveGuideType] = useState<'exterior' | 'motor' | 'interior'>('exterior');

  const filteredProducts = careProducts.filter((p) => {
    if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSub = p.subcategory.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSub) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Editorial Banner: Clean White Card with Architectural Detail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Detailing Profesional & Tratamientos de Motor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            ESTÉTICA Y MOTOR.
            <br />
            <span className="text-slate-800">CUIDADO EN GRADO DE COLECCIÓN.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
            Fórmulas cerámicas SiO2, descontaminantes y aditivos alemanes de ultra-fricción para proteger la pintura, interiores y mecánica de tu auto.
          </p>
        </div>

        {/* Action buttons: Register product or view protocol */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setShowRegisterProductModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Inscribir Producto para Venta</span>
          </button>

          <button
            onClick={() => setShowGuideModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Protocolo de Detailing</span>
          </button>
        </div>
      </div>

      {/* Filter and Categories: Clean White Surface */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ceras, selladores cerámicos, aditivos de motor, limpiador de inyectores o cueros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-600 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Todos los Productos ({careProducts.length})
          </button>

          <button
            onClick={() => setSelectedCategory('exterior')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'exterior'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-sky-500" />
            <span>Estética Exterior (Ceras & SiO2)</span>
          </button>

          <button
            onClick={() => setSelectedCategory('motor_aditivos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'motor_aditivos'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Tratamientos de Motor & Inyectores</span>
          </button>

          <button
            onClick={() => setSelectedCategory('interior')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'interior'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Interiores & Cuero</span>
          </button>

          <button
            onClick={() => setSelectedCategory('herramientas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'herramientas'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-purple-600" />
            <span>Microfibras & Aplicadores</span>
          </button>
        </div>
      </div>

      {/* Product Grid: Clean White Cards with High-Contrast Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white border border-slate-200 hover:border-slate-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Top Media Thumbnail */}
            <div 
              onClick={() => setSelectedProduct(product)}
              className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
                {product.brand}
              </div>
              <div className="absolute bottom-3 right-3 bg-white text-slate-950 font-black text-sm px-3 py-1 rounded-lg shadow-sm border border-slate-200">
                ${product.price.toFixed(2)} USD
              </div>
            </div>

            {/* Product Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">{product.subcategory}</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviewsCount})
                  </span>
                </div>

                <h3 
                  onClick={() => setSelectedProduct(product)}
                  className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                >
                  {product.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="text-[11px] text-slate-600 font-mono">Presentación: {product.volume}</div>
              </div>

              {/* Benefits list */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] text-slate-600 space-y-1">
                  {product.benefits.slice(0, 2).map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      <Check className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="text-xs text-slate-600 hover:text-slate-950 font-semibold cursor-pointer"
                  >
                    Guía de aplicación →
                  </button>

                  <button
                    onClick={() => onAddToCart({
                      type: 'cuidado',
                      id: product.id,
                      name: product.name,
                      brand: product.brand,
                      price: product.price,
                      quantity: 1,
                      image: product.image,
                    })}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Comprar</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No encontramos productos con ese término</h3>
          <p className="text-xs text-slate-600 mt-1">Prueba con otra palabra o borra los filtros de categoría.</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative my-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 p-1.5 rounded-full shadow-sm border border-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-4/3 md:aspect-auto bg-slate-100 overflow-hidden relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-slate-950 text-white font-bold text-xs px-3 py-1 rounded-lg">
                  {selectedProduct.brand}
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {selectedProduct.subcategory}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950 leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="text-xl font-black text-slate-950">
                    ${selectedProduct.price.toFixed(2)} USD
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-900 mb-1">Guía Oficial de Aplicación:</h4>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                      {selectedProduct.applicationGuide.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Presentación: <span className="font-semibold text-slate-900">{selectedProduct.volume}</span>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart({
                        type: 'cuidado',
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        brand: selectedProduct.brand,
                        price: selectedProduct.price,
                        quantity: 1,
                        image: selectedProduct.image,
                      });
                      setSelectedProduct(null);
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailing Step-by-Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 relative my-8 text-xs text-slate-600 space-y-5">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                <BookOpen className="w-6 h-6 text-slate-800" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Manual Maestro de Detailing & Cuidado del Motor</h3>
                <p className="text-xs text-slate-600">Protocolos y secuencias probadas para resultados de exhibición</p>
              </div>
            </div>

            {/* Guide tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveGuideType('exterior')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeGuideType === 'exterior'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Sellado Cerámico Exterior
              </button>
              <button
                onClick={() => setActiveGuideType('motor')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeGuideType === 'motor'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Protección y Limpieza de Motor
              </button>
              <button
                onClick={() => setActiveGuideType('interior')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeGuideType === 'interior'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Restauración de Cuero
              </button>
            </div>

            {activeGuideType === 'exterior' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-950">Protocolo de 3 Fases para Acabado Espejo:</h4>
                <div className="space-y-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-950">Paso 1: Pre-Lavado Snow Foam</strong> - Rocía espuma densa con hidrolavadora para levantar polvo sin tocar la pintura.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-950">Paso 2: Descontaminado Férrico</strong> - Aplica Sonax Fall-Out Cleaner en rines y pintura. Deja que vire a color púrpura y enjuaga con abundante agua.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-950">Paso 3: Sellado Cerámico SiO2</strong> - Aplica Meguiar's Ceramic Liquid panel por panel, cura 3 min y retira con microfibra de 600 GSM.
                  </div>
                </div>
              </div>
            )}

            {activeGuideType === 'motor' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-950">Protección Antifricción y Sistema de Inyección:</h4>
                <div className="space-y-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-950">Aditivo Cerámico Cera Tec:</strong> Agrega al cárter con motor tibio. Las micropartículas cerámicas recubren camisas y pistones reduciendo el rozamiento y consumo de aceite.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-950">Limpiador de Inyectores Ultra:</strong> Vierte antes de repostar tanque lleno cada 10.000 km para disolver barnices en toberas.
                  </div>
                </div>
              </div>
            )}

            {activeGuideType === 'interior' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-950">Preservación de Tapicerías de Cuero y Plásticos:</h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  Usa cepillo de cerdas suaves de crin con Chemical Guys Leather Cleaner para abrir los microporos sin rayar. Luego aplica crema acondicionadora con filtro UV para evitar resequedad y cuarteaduras.
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Register Product Modal for Stores or Individuals */}
      <RegisterProductModal
        isOpen={showRegisterProductModal}
        onClose={() => setShowRegisterProductModal(false)}
        onProductRegistered={(newProduct) => {
          if (onRegisterProduct) {
            onRegisterProduct(newProduct);
          }
        }}
      />

    </div>
  );
};
