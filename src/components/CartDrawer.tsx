import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Check, 
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Building,
  Lock,
  PackageCheck
} from 'lucide-react';
import { CartItem, CheckoutOrder } from '../types';
import { createCheckoutOrder } from '../services/storeService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [buyerName, setBuyerName] = useState('Sebastián Poveda');
  const [buyerEmail, setBuyerEmail] = useState('sebaspoveda317@gmail.com');
  const [buyerPhone, setBuyerPhone] = useState('+57 310 987 6543');
  const [shippingAddress, setShippingAddress] = useState('Calle 100 # 15-20, Apto 402');
  const [receiverCity, setReceiverCity] = useState('Bogotá, D.C.');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'pse_transferencia' | 'contraentrega_custodia'>('contraentrega_custodia');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CheckoutOrder | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 100 ? 0 : 8.50;
  const intermediationFee = Number((subtotal * 0.03).toFixed(2)); // Tarifa de seguro/garantía
  const total = subtotal + shippingFee;

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const uniqueStores: string[] = Array.from(new Set(items.map((i) => i.storeName || 'Almacén Aliado MiGaraje')));
      const order = await createCheckoutOrder({
        buyerName,
        buyerEmail,
        buyerPhone,
        shippingAddress,
        city: receiverCity,
        items,
        subtotal,
        shippingCost: shippingFee,
        intermediationFee,
        total,
        currency: 'USD',
        paymentMethod,
        paymentStatus: paymentMethod === 'contraentrega_custodia' ? 'en_custodia' : 'aprobado',
        storeNames: uniqueStores
      });

      setCompletedOrder(order);
      setCheckoutStep('success');
    } catch (err) {
      console.error('Error procesando orden:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseAndReset = () => {
    if (checkoutStep === 'success') {
      onClearCart();
      setCheckoutStep('cart');
      setCompletedOrder(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-slate-950 border-l border-white/15 w-full sm:max-w-md h-[100dvh] max-h-[100dvh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header - Fixed */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white truncate">Carrito & Repuestos</h3>
              <p className="text-[10px] text-slate-300 font-medium truncate">Intermediación 100% Garantizada</p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar carrito"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          
          {checkoutStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="py-12 sm:py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto border border-white/10">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Tu carrito está vacío</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Explora nuestra red de tiendas de repuestos y productos de cuidado para armar tu pedido con intermediación garantizada.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-white/5 shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h4>
                        <div className="text-xs font-black text-white mt-1">
                          ${(item.price * item.quantity).toFixed(2)} USD
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-400 p-1 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-slate-300 hover:text-white cursor-pointer"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-slate-300 hover:text-white cursor-pointer"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Intermediation Trust Banner */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs backdrop-blur-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      <strong className="text-white">Pago Protegido:</strong> El dinero se transfiere a la tienda únicamente cuando recibes la pieza y confirmas compatibilidad.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {checkoutStep === 'shipping' && (
            <form onSubmit={handleFinishOrder} id="checkoutForm" className="space-y-4 text-xs text-slate-300">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Datos del Comprador & Envío</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2 text-white backdrop-blur-md focus:outline-none focus:border-white text-xs"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2 text-white backdrop-blur-md focus:outline-none focus:border-white text-xs"
                      placeholder="+57 310 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2 text-white backdrop-blur-md focus:outline-none focus:border-white text-xs"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Dirección exacta de entrega *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2 text-white backdrop-blur-md focus:outline-none focus:border-white text-xs"
                    placeholder="Ej. Calle 100 # 15-20, Apto 402"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ciudad de Entrega *</label>
                  <input
                    type="text"
                    required
                    value={receiverCity}
                    onChange={(e) => setReceiverCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2 text-white backdrop-blur-md focus:outline-none focus:border-white text-xs"
                    placeholder="Ej. Bogotá, D.C."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Pasarela de Pago & Intermediación Segura</span>
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: 'contraentrega_custodia', label: '🛡️ Pago en Custodia MiGaraje (Recomendado)', desc: 'Fondos retenidos en la plataforma hasta recibir conforme' },
                    { id: 'tarjeta', label: '💳 Tarjeta de Crédito / Débito (Stripe / Wompi)', desc: 'Procesamiento encriptado con Visa, Mastercard o Amex' },
                    { id: 'pse_transferencia', label: '🏦 Transferencia Bancaria PSE / Nequi / Bancolombia', desc: 'Débito inmediato desde tu cuenta bancaria' },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors backdrop-blur-sm ${
                        paymentMethod === m.id
                          ? 'bg-blue-600/20 border-blue-400/60 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id as any)}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{m.label}</div>
                        <div className="text-[10px] text-slate-400">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && completedOrder && (
            <div className="py-6 sm:py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">¡Orden de Compra Confirmada!</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">N° {completedOrder.orderNumber}</p>
              </div>

              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Guardado en la base de datos en la nube. Hemos notificado a las tiendas asociadas: <strong className="text-white">{completedOrder.storeNames.join(', ')}</strong>.
              </p>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-left space-y-2 backdrop-blur-md">
                <div className="flex justify-between">
                  <span className="text-slate-400">Guía de Rastreo:</span>
                  <span className="font-mono font-bold text-blue-400">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Transacción:</span>
                  <span className="font-bold text-white">${completedOrder.total.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega en:</span>
                  <span className="text-slate-200">{completedOrder.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado de Pago:</span>
                  <span className="text-emerald-400 font-bold capitalize">{completedOrder.paymentStatus.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Garantía MiGaraje:</span>
                  <span className="text-emerald-400 font-bold">100% Protegido</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer with Totals - Fixed Shrink-0 */}
        {items.length > 0 && checkoutStep !== 'success' && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-white/10 bg-slate-950/95 backdrop-blur-md space-y-3 pb-8 sm:pb-5">
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} productos):</span>
                <span className="text-white font-semibold">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Envío asegurado:</span>
                <span className="text-white">
                  {shippingFee === 0 ? <strong className="text-emerald-400 font-bold">Gratis ($0.00)</strong> : `$${shippingFee.toFixed(2)} USD`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                <span>Total a Pagar:</span>
                <span className="text-white font-black">${total.toFixed(2)} USD</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                onClick={() => setCheckoutStep('shipping')}
                className="w-full bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black py-3 rounded-2xl shadow-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceder al Pago Seguro</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl bg-white/10 text-slate-200 text-xs font-bold hover:bg-white/15 cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  form="checkoutForm"
                  disabled={isProcessing}
                  className="flex-1 bg-white hover:bg-slate-100 disabled:opacity-50 active:scale-98 text-slate-950 font-black py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isProcessing ? 'Procesando Pago & Custodia...' : `Confirmar & Pagar ($${total.toFixed(2)})`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {checkoutStep === 'success' && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-white/10 bg-slate-950/95 backdrop-blur-md pb-8 sm:pb-5">
            <button
              onClick={handleCloseAndReset}
              className="w-full bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-md"
            >
              Cerrar y Seguir Navegando
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
