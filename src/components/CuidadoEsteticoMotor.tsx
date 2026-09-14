import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Star, 
  Droplet, 
  Flame, 
  Layers, 
  Check, 
  BookOpen, 
  Plus, 
  X, 
  ShieldCheck
} from 'lucide-react';
import { CareProduct, CareCategory, CartItem } from '../types';

interface CuidadoEsteticoMotorProps {
  careProducts: CareProduct[];
  onAddToCart: (item: CartItem) => void;
}

export const CuidadoEsteticoMotor: React.FC<CuidadoEsteticoMotorProps> = ({
  careProducts,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CareProduct | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
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
      
      {/* Hero Banner with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-purple-400" /> Detailing Premium & Tratamientos de Motor
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Conserva el Brillo, Protege la Pintura y Alarga la Vida Útil del Motor
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Productos profesionales de nivel show-car y aditivos alemanes de alta tecnología para mantener tu vehículo en estado de colección.
          </p>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all shrink-0 cursor-pointer relative z-10"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver Protocolo de Detailing Maestro</span>
        </button>
      </div>

      {/* Filter and Categories with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ceras, selladores, limpiador de inyectores, acondicionador de cuero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5 backdrop-blur-sm'
            }`}
          >
            Todos los Productos ({careProducts.length})
          </button>

          <button
            onClick={() => setSelectedCategory('exterior')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'exterior'
                ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5 backdrop-blur-sm'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Estética Exterior (Ceras & SiO2)</span>
          </button>

          <button
            onClick={() => setSelectedCategory('motor_aditivos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'motor_aditivos'
                ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5 backdrop-blur-sm'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Tratamientos & Aditivos de Motor</span>
          </button>

          <button
            onClick={() => setSelectedCategory('interior')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'interior'
                ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5 backdrop-blur-sm'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cuidado Interior & Cueros</span>
          </button>

          <button
            onClick={() => setSelectedCategory('herramientas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'herramientas'
                ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-600/25'
                : 'bg-white/5 text-slate-300 hover:text-white border border-white/5 backdrop-blur-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Herramientas & Cañones de Espuma</span>
          </button>

        </div>

      </div>

      {/* Product Grid with Frosted Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-blue-400/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
          >
            {/* Product Image */}
            <div 
              onClick={() => setSelectedProduct(product)}
              className="h-48 bg-white/5 relative overflow-hidden cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/10 text-[10px] font-bold text-blue-300">
                {product.brand}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white font-black text-sm px-3 py-1 rounded-xl border border-white/15">
                ${product.price.toFixed(2)} USD
              </div>
            </div>

            {/* Product Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-blue-300 font-semibold">{product.subcategory}</span>
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" /> {product.rating} ({product.reviewsCount})
                  </span>
                </div>

                <h3 
                  onClick={() => setSelectedProduct(product)}
                  className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer"
                >
                  {product.name}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2">{product.description}</p>
                <div className="text-[11px] text-slate-400 font-mono">Presentación: {product.volume}</div>
              </div>

              {/* Benefits list */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="text-[11px] text-slate-300 space-y-1">
                  {product.benefits.slice(0, 2).map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-300 truncate">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="text-xs text-slate-300 hover:text-white font-semibold cursor-pointer"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Product Detail / Application Modal with Frosted Glass */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            
            <div className="relative h-60 bg-slate-900">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-xs text-white font-bold">
                {selectedProduct.brand} • {selectedProduct.subcategory}
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedProduct.description}</p>
              </div>

              {/* Application Guide */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Modo de Aplicación Recomendado:
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-slate-200 text-[11px]">
                  {selectedProduct.applicationGuide.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Ideal for vehicles */}
              <div>
                <span className="font-bold text-white block mb-1">Ideal para:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.idealFor.map((item, idx) => (
                    <span key={idx} className="bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="text-xl font-black text-white">
                  ${selectedProduct.price.toFixed(2)} USD
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 cursor-pointer"
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Detailing Step-by-Step Guide Modal with Frosted Glass */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl p-6 relative my-8 text-xs text-slate-300 space-y-4">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manual Maestro de Detailing & Cuidado del Motor</h3>
                <p className="text-xs text-slate-400">Técnicas profesionales paso a paso para resultados de exhibición</p>
              </div>
            </div>

            {/* Guide tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveGuideType('exterior')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${activeGuideType === 'exterior' ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                1. Tratamiento Cerámico Exterior
              </button>
              <button
                onClick={() => setActiveGuideType('motor')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${activeGuideType === 'motor' ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                2. Descarbonización de Motor & Inyectores
              </button>
              <button
                onClick={() => setActiveGuideType('interior')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${activeGuideType === 'interior' ? 'bg-blue-600/30 text-white backdrop-blur-md border border-blue-400/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                3. Restauración de Cueros
              </button>
            </div>

            {activeGuideType === 'exterior' && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Protocolo de 4 Fases para Pintura Espejo:</h4>
                <div className="space-y-2">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <strong className="text-blue-300">Paso 1: Pre-Lavado Snow Foam</strong> - Rocía espuma densa con hidrolavadora para levantar polvo sin tocar la pintura.
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <strong className="text-blue-300">Paso 2: Descontaminado Férrico</strong> - Aplica Sonax Fall-Out Cleaner en rines y pintura. Deja que vire a color púrpura y enjuaga.
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <strong className="text-blue-300">Paso 3: Sellado Cerámico SiO2</strong> - Aplica Meguiar's Ceramic Liquid panel por panel, cura 3 min y retira con microfibra.
                  </div>
                </div>
              </div>
            )}

            {activeGuideType === 'motor' && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Protección Antifricción y Sistema de Combustible:</h4>
                <div className="space-y-2">
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <strong className="text-blue-300">Aditivo Cerámico Cera Tec:</strong> Agrega al cárter con motor tibio. Las partículas de microcerámica recubren camisas y pistones reduciendo el rozamiento.
                  </div>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                    <strong className="text-blue-300">Limpiador de Inyectores Ultra:</strong> Vierte antes de repostar tanque lleno cada 10.000 km para disolver barnices en toberas.
                  </div>
                </div>
              </div>
            )}

            {activeGuideType === 'interior' && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Preservación de Tapicerías de Cuero y Plásticos:</h4>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  Usa cepillo de crin suave con Chemical Guys Leather Cleaner para abrir los poros sin rayar. Luego aplica acondicionador con filtro UV para evitar resequedad por el sol.
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/15 cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
