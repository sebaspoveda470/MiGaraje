import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  X, 
  Check, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  Sparkles,
  ArrowRight,
  Store
} from 'lucide-react';
import { PartnerStore } from '../types';
import { registerPartnerStore } from '../services/storeService';

interface PartnerStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreRegistered: (store: PartnerStore) => void;
}

const COMMON_BRANDS = [
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 
  'Honda', 'Mazda', 'Nissan', 'Ford', 'Chevrolet', 'Porsche', 'Renault'
];

export const PartnerStoreModal: React.FC<PartnerStoreModalProps> = ({
  isOpen,
  onClose,
  onStoreRegistered
}) => {
  const [commercialName, setCommercialName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Toyota', 'Nissan', 'Mazda']);
  const [customBrand, setCustomBrand] = useState('');
  const [specialtiesText, setSpecialtiesText] = useState('Frenos cerámicos, Suspensión deportiva, Kits de embrague');
  const [description, setDescription] = useState('');
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<PartnerStore | null>(null);

  if (!isOpen) return null;

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleAddCustomBrand = () => {
    if (customBrand.trim() && !selectedBrands.includes(customBrand.trim())) {
      setSelectedBrands([...selectedBrands, customBrand.trim()]);
      setCustomBrand('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanWhatsapp = whatsapp.replace(/\D/g, '') || phone.replace(/\D/g, '');

    try {
      const newStore = await registerPartnerStore({
        commercialName,
        taxId: taxId || 'En trámite',
        ownerName,
        email,
        phone,
        whatsapp: cleanWhatsapp,
        city,
        address,
        brands: selectedBrands,
        specialties: specialties.length > 0 ? specialties : ['Repuestos mecánicos', 'Autopartes OEM'],
        commissionRate,
        description: description || `Tienda especializada en repuestos para ${selectedBrands.join(', ')}. Despacho con garantía MiGaraje.`,
        logoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80',
        catalogCount: 25
      });

      setRegisteredData(newStore);
      setIsSuccess(true);
      onStoreRegistered(newStore);
    } catch (err) {
      console.error('Error registrando tienda:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setCommercialName('');
      setTaxId('');
      setOwnerName('');
      setEmail('');
      setPhone('');
      setWhatsapp('');
      setCity('');
      setAddress('');
      setDescription('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 border border-white/20 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Inscripción de Tienda Aliada</h3>
              <p className="text-xs text-slate-300">Únete a la red de autopartes con intermediación y pagos garantizados</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess && registeredData ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">¡Tienda Inscrita en MiGaraje!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                <strong className="text-white">{registeredData.commercialName}</strong> ha sido registrada en Firestore y dada de alta en el Marketplace. Los usuarios ya pueden contactarte directamente por WhatsApp y solicitar compras con intermediación segura.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tienda:</span>
                  <span className="font-bold text-white">{registeredData.commercialName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ciudad:</span>
                  <span className="text-slate-200">{registeredData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Comisión por intermediación:</span>
                  <span className="text-emerald-400 font-bold">{registeredData.commissionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado:</span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Activa en Marketplace
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Ver en el Marketplace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-300">
              
              {/* Beneficios de intermediación */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-white block text-xs mb-0.5">¿Cómo funciona la intermediación MiGaraje?</strong>
                  Los clientes compran y pagan dentro de la plataforma con dinero en custodia. Tú preparas el repuesto y despachas. Una vez entregado conforme, recibes el valor de la venta deduciendo únicamente la tarifa acordada.
                </div>
              </div>

              {/* Información comercial */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Datos del Establecimiento</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nombre Comercial de la Tienda *</label>
                    <input
                      type="text"
                      required
                      value={commercialName}
                      onChange={(e) => setCommercialName(e.target.value)}
                      placeholder="Ej: Autopartes & Frenos Bogotá"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">NIT / Identificación Tributaria</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="Ej: 900.123.456-7"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nombre del Encargado / Propietario *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Correo Electrónico de Contacto *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ventas@tutienda.com"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Teléfono Fijo o Celular *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 310 123 4567"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">WhatsApp para Pedidos Directos *</label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Ej: 573101234567"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Ciudad *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej: Bogotá, Medellín, Cali, Barranquilla..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Dirección del Local / Bodega *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej: Calle 63 # 24-18, Barrio 7 de Agosto"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Marcas y especialidades */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Marcas Especializadas & Autopartes</h4>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Selecciona las marcas que vendes:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_BRANDS.map((brand) => {
                      const isSelected = selectedBrands.includes(brand);
                      return (
                        <button
                          type="button"
                          key={brand}
                          onClick={() => toggleBrand(brand)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-400 text-white shadow-xs'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? `✓ ${brand}` : brand}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="Otra marca..."
                      className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomBrand}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                    >
                      + Añadir marca
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Especialidades o líneas principales (separadas por coma)</label>
                  <input
                    type="text"
                    value={specialtiesText}
                    onChange={(e) => setSpecialtiesText(e.target.value)}
                    placeholder="Frenos, Amortiguadores, Partes Eléctricas, Motor..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Descripción de la tienda y experiencia</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cuéntale a los conductores sobre tu garantía, años en el mercado o stock de repuestos..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Comisión sugerida: <strong className="text-white">5% por venta completada</strong>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Registrando en Firebase...</span>
                    ) : (
                      <>
                        <span>Inscribir mi Tienda</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
