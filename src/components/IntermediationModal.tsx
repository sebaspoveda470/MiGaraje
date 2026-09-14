import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X,
  FileCheck,
  Lock,
  FileText
} from 'lucide-react';
import { VehicleListing } from '../types';

interface IntermediationModalProps {
  listing: VehicleListing | null;
  onClose: () => void;
}

export const IntermediationModal: React.FC<IntermediationModalProps> = ({
  listing,
  onClose,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCity, setBuyerCity] = useState('Bogotá');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!listing) return null;

  const estimatedTraspaso = Math.round(listing.price * 0.015);
  const escrowFee = 150; // USD

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header - Clean White */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-white text-slate-950">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-950 truncate">Intermediación & Compra Segura</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Peritaje técnico y cuenta custodia sin riesgo</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-700">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-950">¡Solicitud de Intermediación Iniciada!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Un asesor pericial de <strong>MiGaraje</strong> se pondrá en contacto al <strong>{buyerPhone || '+57 ...'}</strong> para coordinar la cita del peritaje de 180 puntos del <strong>{listing.title}</strong> y aperturar la cuenta custodia sin riesgo.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                Volver al Marketplace
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700">
            
            {/* Vehicle Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-16 h-16 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{listing.brand} {listing.year}</span>
                <h4 className="text-sm font-bold text-slate-950 truncate">{listing.title}</h4>
                <div className="text-base font-black text-slate-950 mt-0.5">
                  ${listing.price.toLocaleString()} {listing.currency}
                </div>
              </div>
            </div>

            {/* How Intermediation Works */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">¿Cómo te protege nuestra intermediación?</span>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Peritaje Mecánico & Legal:</strong> Revisión de chasis, compresión de motor, historial de siniestros RUNT y antecedentes judiciales del vendedor.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Cuenta Custodia Escrow:</strong> Tu dinero se deposita en una cuenta fiduciaria y solo se libera al vendedor cuando el traspaso esté radicado en Tránsito.</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Tramitología Integral:</strong> Gestionamos contrato de compraventa, improntas, pago de retención en la fuente y entrega de llaves.</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <span className="font-bold text-slate-900 block">Estimación de Costos de Cierre</span>
              <div className="flex justify-between text-slate-600">
                <span>Vehículo:</span>
                <span className="font-bold text-slate-900">${listing.price.toLocaleString()} {listing.currency}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Peritaje integral (180 puntos):</span>
                <span className="text-blue-600 font-bold">Incluido</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Custodia y gestión fiduciaria:</span>
                <span className="font-bold text-slate-900">${escrowFee} USD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Derechos de traspaso est. (1.5%):</span>
                <span className="font-bold text-slate-900">${estimatedTraspaso.toLocaleString()} USD</span>
              </div>
            </div>

            {/* Buyer Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-900 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre y apellidos"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+57 300..."
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={buyerCity}
                    onChange={(e) => setBuyerCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Solicitar Intermediación & Peritaje</span>
              </button>
            </form>

          </div>
        )}

        </div>

      </div>
    </div>
  );
};
