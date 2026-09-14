import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  X, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header - Clean White */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white text-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950">Inscripción de Tienda Aliada</h3>
              <p className="text-xs text-slate-500">Únete a la red de autopartes con intermediación y pagos garantizados</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {isSuccess && registeredData ? (
            <div className="text-center py-8 space-y-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950">¡Tienda Inscrita en MiGaraje!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                <strong className="text-slate-950">{registeredData.commercialName}</strong> ha sido registrada y dada de alta en el Marketplace. Los usuarios ya pueden contactarte directamente y solicitar compras con intermediación segura.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tienda:</span>
                  <span className="font-bold text-slate-900">{registeredData.commercialName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ciudad:</span>
                  <span className="text-slate-800">{registeredData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comisión por intermediación:</span>
                  <span className="text-blue-700 font-bold">{registeredData.commissionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    Activa en Marketplace
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Ver en el Marketplace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
              
              {/* Beneficios de intermediación */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-slate-900 block text-xs mb-0.5">¿Cómo funciona la intermediación MiGaraje?</strong>
                  Los clientes compran y pagan dentro de la plataforma con dinero en custodia. Tú preparas el repuesto y despachas. Una vez entregado conforme, recibes el valor de la venta deduciendo únicamente la tarifa acordada.
                </div>
              </div>

              {/* Información comercial */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">1. Datos del Establecimiento</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">Nombre Comercial de la Tienda *</label>
                    <input
                      type="text"
                      required
                      value={commercialName}
                      onChange={(e) => setCommercialName(e.target.value)}
                      placeholder="Ej: Autopartes & Frenos Bogotá"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">NIT / Identificación Tributaria</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="Ej: 900.123.456-7"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">Nombre del Encargado / Propietario *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ventas@tutienda.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">WhatsApp para Notificaciones de Compra *</label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-900 font-semibold mb-1">Ciudad Principal de Despacho *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej: Bogotá, Medellín, Cali..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-semibold mb-1">Dirección del Almacén Físico</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Carrera 24 # 63-12, 7 de Agosto"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Marcas y especialidades */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">2. Marcas y Línea de Repuestos</h4>
                
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Marcas atendidas:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_BRANDS.map((b) => {
                      const isSel = selectedBrands.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleBrand(b)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                            isSel
                              ? 'bg-slate-950 text-white border-slate-950'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-semibold mb-1">Especialidad de Repuestos</label>
                  <input
                    type="text"
                    value={specialtiesText}
                    onChange={(e) => setSpecialtiesText(e.target.value)}
                    placeholder="Frenos, Embragues, Filtros, Sensores, Suspensión..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Inscribiendo Tienda...' : 'Completar Inscripción'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
