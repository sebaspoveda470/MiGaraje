import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header - Fixed */}
        <div className="shrink-0 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white truncate">Intermediación & Compra Segura</h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">Protección 100% con peritaje y cuenta custodia</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">¡Solicitud de Intermediación Iniciada!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Un asesor pericial de <strong>MiGaraje</strong> se pondrá en contacto al <strong>{buyerPhone || '+57 ...'}</strong> para coordinar la cita del peritaje de 180 puntos del <strong>{listing.title}</strong> y aperturar la cuenta custodia sin riesgo.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
              >
                Volver al Marketplace
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-slate-300">
            
            {/* Vehicle Summary Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5 backdrop-blur-md">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-16 h-16 rounded-xl object-cover bg-white/5 shrink-0 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-blue-300 font-bold uppercase">{listing.brand} {listing.year}</span>
                <h4 className="text-sm font-bold text-white truncate">{listing.title}</h4>
                <div className="text-base font-black text-white mt-0.5">
                  ${listing.price.toLocaleString()} {listing.currency}
                </div>
              </div>
            </div>

            {/* How Intermediation Works */}
            <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="font-bold text-white block">¿Cómo te protege nuestra intermediación?</span>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600/25 border border-blue-500/30 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <span><strong>Peritaje Mecánico & Legal:</strong> Se inspecciona chasis, motor, compresión y antecedentes penales/embargos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600/25 border border-blue-500/30 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <span><strong>Cuenta Custodia (Escrow):</strong> El dinero queda retenido en banco de primer nivel. El vendedor solo cobra cuando el auto esté radicado a tu nombre.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600/25 border border-blue-500/30 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <span><strong>Garantía de Devolución:</strong> Si el vehículo no supera el peritaje o tiene vicios ocultos, recibes el 100% de tu dinero de vuelta.</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+57 300 123 4567"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Ciudad para Peritaje</label>
                <input
                  type="text"
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              {/* Estimate Cost Breakdown */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Valor del Vehículo:</span>
                  <span className="font-mono text-white">${listing.price.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Peritaje 180 pts + Cuenta Custodia:</span>
                  <span className="font-mono text-white">${escrowFee} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Traspaso estimado (Derechos de Tránsito):</span>
                  <span className="font-mono text-white">~${estimatedTraspaso} USD</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all cursor-pointer"
                >
                  Solicitar Asignación de Perito & Custodia
                </button>
              </div>
            </form>

          </div>
        )}

        </div>
      </div>
    </div>
  );
};
