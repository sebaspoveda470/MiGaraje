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
  const intermediationFee = Number((subtotal * 0.03).toFixed(2));
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
        paymentStatus: 'en_custodia',
        storeNames: uniqueStores,
      });

      setCompletedOrder(order);
      setCheckoutStep('success');
    } catch {
      alert('Hubo un error procesando tu pedido. Intenta nuevamente.');
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white border-l border-slate-200 w-full sm:max-w-md h-[100dvh] max-h-[100dvh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header - Fixed */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white text-slate-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-950 truncate">Carrito de Compras</h3>
              <p className="text-[10px] text-slate-500 font-medium truncate">Intermediación 100% Garantizada</p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 transition-all cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar carrito"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain bg-slate-50/50">
          
          {checkoutStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="py-12 sm:py-16 text-center space-y-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-950">Tu carrito está vacío</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Explora nuestra red de repuestos, lubricantes y productos de estética para tu vehículo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-xs"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-950 truncate mt-0.5">{item.name}</h4>
                        <div className="text-xs font-black text-slate-900 mt-1">
                          ${(item.price * item.quantity).toFixed(2)} USD
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center bg-white text-slate-700 rounded hover:bg-slate-200 cursor-pointer shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center bg-white text-slate-700 rounded hover:bg-slate-200 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'shipping' && (
            <form onSubmit={handleFinishOrder} className="space-y-4 text-xs text-slate-700">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="font-bold text-slate-950 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-slate-900" />
                  <span>Datos de Envío & Facturación</span>
                </h4>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">WhatsApp / Tel</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">Ciudad</label>
                    <input
                      type="text"
                      required
                      value={receiverCity}
                      onChange={(e) => setReceiverCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="font-bold text-slate-950 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-900" />
                  <span>Método de Pago con Custodia Escrow</span>
                </h4>

                <div className="space-y-2">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${paymentMethod === 'contraentrega_custodia' ? 'border-slate-950 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'contraentrega_custodia'}
                      onChange={() => setPaymentMethod('contraentrega_custodia')}
                      className="accent-slate-950"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Pago Contra Entrega con Custodia</span>
                      <span className="text-[10px] text-slate-500">Paga al recibir tras verificar la pieza</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${paymentMethod === 'pse_transferencia' ? 'border-slate-950 bg-slate-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'pse_transferencia'}
                      onChange={() => setPaymentMethod('pse_transferencia')}
                      className="accent-slate-950"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">PSE / Transferencia Bancaria</span>
                      <span className="text-[10px] text-slate-500">Bancolombia, Davivienda, Nequi</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? 'Confirmando Pedido...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && completedOrder && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-xs animate-in fade-in">
              <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-950">¡Pedido #{completedOrder.orderNumber} Exitoso!</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Hemos notificado a los almacenes aliados. Tu dinero se encuentra protegido bajo garantía de compatibilidad.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Destino:</span>
                  <span>{completedOrder.city}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total a Pagar:</span>
                  <span>${completedOrder.total.toFixed(2)} USD</span>
                </div>
              </div>
              <button
                onClick={handleCloseAndReset}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs cursor-pointer"
              >
                Cerrar y Continuar
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer Summary (only when in cart step and items exist) */}
        {checkoutStep === 'cart' && items.length > 0 && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({items.length} ítems):</span>
                <span className="font-bold text-slate-900">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Envío asegurado:</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? <span className="text-blue-600 font-bold">Gratis</span> : `$${shippingFee.toFixed(2)} USD`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total Estimado:</span>
                <span className="text-base">${total.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutStep('shipping')}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceder al Despacho</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
