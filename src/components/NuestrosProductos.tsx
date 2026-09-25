import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  MessageCircle, 
  ShieldCheck, 
  Check, 
  Star, 
  Droplet, 
  Flame, 
  Layers, 
  X, 
  Package, 
  ArrowRight,
  Truck,
  ExternalLink,
  Trash2,
  Camera,
  Phone,
  Pencil,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { CareProduct, CareCategory, CartItem } from '../types';
import { compressImageFile, toWhatsAppNumber } from '../utils/media';

interface NuestrosProductosProps {
  products: CareProduct[];
  isLoading: boolean;
  isAdmin: boolean;
  salesWhatsApp: string;
  onSaveProduct: (product: CareProduct) => Promise<void>;
  onDeleteProduct: (productId: string) => void;
  onSeedCatalog: () => void;
  onSaveSalesWhatsApp: (number: string) => Promise<void>;
  onAddToCart: (item: CartItem) => void;
}

const CATEGORIES: { id: CareCategory | 'todos'; label: string; icon: any }[] = [
  { id: 'todos', label: 'Todos los Productos', icon: Sparkles },
  { id: 'exterior', label: 'Exterior & Cerámicos', icon: Droplet },
  { id: 'motor_aditivos', label: 'Motor & Desengrasantes', icon: Flame },
  { id: 'interior', label: 'Interiores & Cuero', icon: Layers },
  { id: 'herramientas', label: 'Microfibras & Accesorios', icon: Package },
];

export const NuestrosProductos: React.FC<NuestrosProductosProps> = ({
  products,
  isLoading,
  isAdmin,
  salesWhatsApp,
  onSaveProduct,
  onDeleteProduct,
  onSeedCatalog,
  onSaveSalesWhatsApp,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CareProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // WhatsApp Configuration State
  const [tempWhatsApp, setTempWhatsApp] = useState<string>('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Product being edited (null = creating a new one)
  const [editingProduct, setEditingProduct] = useState<CareProduct | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Add Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CareCategory>('exterior');
  const [subcategory, setSubcategory] = useState('Detailing');
  const [price, setPrice] = useState<number>(35000);
  const [volume, setVolume] = useState('500 ml');
  const [description, setDescription] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSub = p.subcategory.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSub) return false;
    }
    return true;
  });

  const generateWhatsAppUrl = (prod: CareProduct) => {
    if (!salesWhatsApp) return undefined;
    const message= `Hola MiGaraje! 👋 Estoy interesado en comprar el producto oficial *${prod.name}* por valor de $${prod.price.toLocaleString()} COP. ¿Tienen disponibilidad y hacen envíos a mi ciudad?`;
    return `https://wa.me/${salesWhatsApp}?text=${encodeURIComponent(message)}`;
  };

  const handleAddToCart = (prod: CareProduct) => {
    onAddToCart({
      type: 'cuidado',
      id: prod.id,
      name: prod.name,
      brand: prod.brand,
      price: prod.price,
      quantity: 1,
      image: prod.image,
    });
  };

  const openPhoneModal = () => {
    setTempWhatsApp(salesWhatsApp);
    setPhoneError(null);
    setShowPhoneModal(true);
  };

  const resetProductForm = () => {
    setName('');
    setCategory('exterior');
    setSubcategory('Detailing');
    setPrice(35000);
    setVolume('500 ml');
    setDescription('');
    setBenefitsText('');
    setImageUrl('');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetProductForm();
    setProductError(null);
    setShowAddModal(true);
  };

  const openEditModal = (prod: CareProduct) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setSubcategory(prod.subcategory);
    setPrice(prod.price);
    setVolume(prod.volume);
    setDescription(prod.description);
    setBenefitsText((prod.benefits || []).join('\n'));
    setImageUrl(prod.image);
    setProductError(null);
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const compressedDataUrl = await compressImageFile(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Error optimizando foto', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = toWhatsAppNumber(tempWhatsApp);
    if (clean.length < 11) {
      setPhoneError('Ingresa el número completo con código de país, por ejemplo 573001234567.');
      return;
    }
    setIsSavingPhone(true);
    setPhoneError(null);
    try {
      await onSaveSalesWhatsApp(clean);
      setShowPhoneModal(false);
    } catch (err) {
      console.error(err);
      setPhoneError('No se pudo guardar el número. Inténtalo de nuevo.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    const benefitsArray = benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const base: CareProduct = editingProduct || {
      id: `mg-prod-${Date.now()}`,
      name: '',
      brand: 'MiGaraje',
      category,
      subcategory: '',
      price: 0,
      rating: 0,
      reviewsCount: 0,
      description: '',
      volume: '',
      applicationGuide: [],
      benefits: [],
      image: '',
      inStock: true,
      idealFor: [],
    };

    const product: CareProduct = {
      ...base,
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || 'Cuidado Oficial',
      price: Number(price),
      description: description.trim(),
      volume: volume.trim(),
      benefits: benefitsArray,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    };

    setIsSavingProduct(true);
    setProductError(null);
    try {
      await onSaveProduct(product);
      setShowAddModal(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (err) {
      console.error(err);
      setProductError('No se pudo guardar el producto. Verifica que iniciaste sesión con la cuenta administradora.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const renderWhatsAppButton = (prod: CareProduct, label: string, className: string) => {
    const href = generateWhatsAppUrl(prod);
    if (!href) {
      return (
        <div className={`${className} !bg-slate-200 !text-slate-500 !cursor-not-allowed`} title="El WhatsApp de ventas aún no está configurado">
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp de ventas no disponible</span>
        </div>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <MessageCircle className="w-4 h-4 text-blue-400 shrink-0" />
        <span>{label}</span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
      </a>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Línea Oficial MiGaraje
            </span>
            <span className="text-xs text-slate-500 font-medium">Venta Directa por WhatsApp • Envíos a Toda Colombia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Nuestros Productos MiGaraje
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Fórmulas profesionales de estética, detailing y mantenimiento desarrolladas especialmente para el cuidado de tu carro. Atención personalizada y despacho inmediato vía WhatsApp.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold pt-1">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Envíos a nivel nacional</span>
            </div>
            {salesWhatsApp && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span>WhatsApp de Ventas: +{salesWhatsApp}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isAdmin && (
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={openAddModal}
            className="bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>+ Publicar Nuevo Producto</span>
          </button>

          <button
            onClick={openPhoneModal}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            title="Cambiar el número de WhatsApp receptor de pedidos"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>{salesWhatsApp ? 'Configurar WhatsApp de Ventas' : 'Configurar WhatsApp de Ventas (pendiente)'}</span>
          </button>
        </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando productos...
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar shampoo, cera cerámica, desengrasante, microfibra, acondicionador de cuero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group relative"
          >
            <div>
              {/* Product Image */}
              <div 
                onClick={() => setSelectedProduct(prod)}
                className="aspect-4/3 bg-slate-100 relative overflow-hidden cursor-pointer"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                
                <div className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  MiGaraje Oficial
                </div>

                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                  {prod.volume}
                </div>

                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(prod);
                      }}
                      title="Editar producto"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar "${prod.name}" de la tienda?`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      title="Eliminar producto"
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    {prod.subcategory}
                  </span>
                  {prod.reviewsCount > 0 && (
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{prod.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({prod.reviewsCount})</span>
                    </div>
                  )}
                </div>

                <h3 
                  onClick={() => setSelectedProduct(prod)}
                  className="text-base font-black text-slate-950 tracking-tight cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {prod.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {/* Key Benefits Preview */}
                {prod.benefits && prod.benefits.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {prod.benefits.slice(0, 2).map((b, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price & Action Bottom Strip */}
            <div className="p-5 pt-3 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Precio Oficial</span>
                  <div className="text-xl font-black text-slate-950 tracking-tight">
                    ${prod.price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Ficha</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct WhatsApp Purchase + Cart */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  {renderWhatsAppButton(
                    prod,
                    'Comprar por WhatsApp',
                    'w-full bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer'
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(prod)}
                  title="Agregar al carrito"
                  aria-label={`Agregar ${prod.name} al carrito`}
                  className="shrink-0 w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && products.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-950">
            {isAdmin ? 'Tu catálogo está vacío' : 'Muy pronto publicaremos nuestros productos'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {isAdmin
              ? 'Carga el catálogo inicial de MiGaraje (6 productos) para editarlo, o publica tus productos uno por uno.'
              : 'Vuelve en unos días para conocer la línea oficial MiGaraje.'}
          </p>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={onSeedCatalog}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cargar catálogo inicial
              </button>
              <button
                onClick={openAddModal}
                className="bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                + Publicar Producto
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-950">No hay productos en esta categoría</h3>
          <p className="text-xs text-slate-500 mt-1">
            Prueba con otra categoría o cambia tu búsqueda.
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    MiGaraje
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-900">Presentación Oficial</div>
                  <div className="text-slate-600">{selectedProduct.volume || 'Consultar presentación'}</div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    {selectedProduct.subcategory}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1">
                    {selectedProduct.name}
                  </h2>

                  <div className="text-2xl font-black text-slate-950 mt-2">
                    ${selectedProduct.price.toLocaleString()} <span className="text-sm font-normal text-slate-500">COP</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Benefits */}
                  {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="text-xs font-bold text-slate-900">Beneficios Clave:</div>
                      {selectedProduct.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Guide */}
                  {selectedProduct.applicationGuide && selectedProduct.applicationGuide.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="text-xs font-bold text-slate-900">Modo de Uso:</div>
                      {selectedProduct.applicationGuide.map((step, idx) => (
                        <div key={idx} className="text-[11px] text-slate-500">
                          {idx + 1}. {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  {renderWhatsAppButton(
                    selectedProduct,
                    'Pedir este Producto por WhatsApp',
                    'w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer'
                  )}

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Agregar al carrito</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Enlace directo al WhatsApp de ventas MiGaraje con referencia del producto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure WhatsApp Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">WhatsApp de Ventas MiGaraje</h3>
                <p className="text-xs text-slate-500">Número al que llegarán los pedidos de los clientes</p>
              </div>
            </div>

            <form onSubmit={handleSavePhone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Número de WhatsApp (con código de país ej: 573109876543)
                </label>
                <input
                  type="text"
                  required
                  placeholder="573109876543"
                  value={tempWhatsApp}
                  onChange={(e) => setTempWhatsApp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Para Colombia empieza por 57 seguido de tu número celular (ejemplo: 573001234567).
                </p>
                {phoneError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold mt-2">{phoneError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPhone}
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSavingPhone && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Guardar Número
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl p-6 sm:p-8 relative max-h-[92dvh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Línea Oficial MiGaraje
              </span>
              <h3 className="text-xl font-black text-slate-950 tracking-tight mt-1">
                {editingProduct ? 'Editar Producto' : 'Subir Producto para la Venta'}
              </h3>
              <p className="text-xs text-slate-500">
                Los clientes podrán pedirlo directamente a tu WhatsApp oficial.
              </p>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nombre Comercial del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cera Cerámica Líquida HydroShield MiGaraje"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="exterior">Exterior & Cerámicos</option>
                    <option value="motor_aditivos">Motor & Desengrasantes</option>
                    <option value="interior">Interiores & Cuero</option>
                    <option value="herramientas">Microfibras & Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Precio en COP *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    placeholder="35000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Presentación / Volumen</label>
                  <input
                    type="text"
                    placeholder="Ej: 500 ml o Pack x 3"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Protección Cerámica"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Descripción del Producto</label>
                <textarea
                  rows={2}
                  placeholder="Describe las propiedades y beneficios del producto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Beneficios (Uno por línea)</label>
                <textarea
                  rows={2}
                  placeholder="Efecto hidrofóbico extremo&#10;Brillo espejo garantizado&#10;Protección UV 6 meses"
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white resize-none"
                />
              </div>

              {/* Photo Upload: File from Device/Camera OR URL */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60">
                <label className="block font-bold text-slate-800">Foto del Producto</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{isProcessingImage ? 'Procesando...' : 'Tomar Foto o Subir Archivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />
                  </label>

                  <span className="text-slate-400 text-xs">o ingresa una URL:</span>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                {imageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                    <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 text-[9px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {productError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{productError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct || isProcessingImage}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-blue-400" />}
                  <span>{editingProduct ? 'Guardar Cambios' : 'Publicar en Nuestros Productos'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
