import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  MessageCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { CartItem, CheckoutOrder, UserProfile } from '../types';
import { createOrder } from '../services/storeService';
import { auth } from '../firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserProfile | null;
  salesWhatsApp: string;
  requireAuth: () => boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

const formatCOP = (value: number) => `$${value.toLocaleString('es-CO')} COP`;

function buildWhatsAppOrderUrl(order: CheckoutOrder, salesWhatsApp: string): string {
  const lines = [
    `Hola MiGaraje! 👋 Quiero confirmar mi pedido *${order.orderNumber}*:`,
    '',
    ...order.items.map((i) => `• ${i.quantity} x ${i.name} — ${formatCOP(i.price * i.quantity)}`),
    '',
    `*Total productos:* ${formatCOP(order.total)}`,
    '',
    `Nombre: ${order.buyerName}`,
    `Teléfono: ${order.buyerPhone}`,
    `Envío a: ${order.shippingAddress}, ${order.city}`,
    order.notes ? `Notas: ${order.notes}` : '',
    '',
    '¿Me confirman costo de envío y forma de pago?',
  ].filter((line, idx, arr) => line !== '' || arr[idx - 1] !== '');
  return `https://wa.me/${salesWhatsApp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  user,
  salesWhatsApp,
  requireAuth,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CheckoutOrder | null>(null);

  // Prefill contact data from the profile
  useEffect(() => {
    if (!user) return;
    setBuyerName((prev) => prev || user.fullName);
    setBuyerPhone((prev) => prev || user.phone || '');
    setReceiverCity((prev) => prev || user.city || '');
  }, [user]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleProceed = () => {
    if (!requireAuth()) return;
    setOrderError(null);
    setCheckoutStep('shipping');
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid || !user) {
      requireAuth();
      return;
    }
    setIsProcessing(true);
    setOrderError(null);

    try {
      const order = await createOrder({
        userId: uid,
        buyerName: buyerName.trim(),
        buyerEmail: user.email,
        buyerPhone: buyerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: receiverCity.trim(),
        notes: notes.trim() || undefined,
        items,
        total: subtotal,
      });
      setCompletedOrder(order);
      setCheckoutStep('success');
      onClearCart();
    } catch (err) {
      console.error(err);
      setOrderError('No se pudo registrar tu pedido. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseAndReset = () => {
    if (checkoutStep === 'success') {
      setCheckoutStep('cart');
      setCompletedOrder(null);
      setNotes('');
    }
    onClose();
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white';

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
              <p className="text-[10px] text-slate-500 font-medium truncate">Productos oficiales MiGaraje • Pedido por WhatsApp</p>
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
                    Agrega productos desde la pestaña "Nuestros Productos" para hacer un solo pedido.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-xs">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-bold text-slate-950 truncate mt-0.5">{item.name}</h4>
                        <div className="text-xs font-black text-slate-900 mt-1">{formatCOP(item.price * item.quantity)}</div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Eliminar"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            aria-label="Disminuir cantidad"
                            className="w-5 h-5 flex items-center justify-center bg-white text-slate-700 rounded hover:bg-slate-200 cursor-pointer shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            aria-label="Aumentar cantidad"
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
                  <span>Datos de Envío</span>
                </h4>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Nombre Completo *</label>
                  <input type="text" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">WhatsApp / Tel *</label>
                    <input type="tel" required value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">Ciudad *</label>
                    <input type="text" required value={receiverCity} onChange={(e) => setReceiverCity(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Dirección de Entrega *</label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, número, apartamento, barrio"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Notas (opcional)</label>
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-[11px] text-blue-900 leading-relaxed">
                Registraremos tu pedido y luego podrás enviarlo por WhatsApp. El costo de envío y la forma de pago se confirman por ese medio.
              </div>

              {orderError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{orderError}</p>
              )}

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
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProcessing ? 'Registrando Pedido...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && completedOrder && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-xs animate-in fade-in">
              <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-950">Pedido {completedOrder.orderNumber} registrado</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Último paso: envíanos el pedido por WhatsApp para confirmar disponibilidad, envío y forma de pago.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Destino:</span>
                  <span>{completedOrder.city}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total productos:</span>
                  <span>{formatCOP(completedOrder.total)}</span>
                </div>
              </div>

              {salesWhatsApp ? (
                <a
                  href={buildWhatsAppOrderUrl(completedOrder, salesWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Enviar pedido por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  Te contactaremos al {completedOrder.buyerPhone} para confirmar tu pedido.
                </p>
              )}

              <button onClick={handleCloseAndReset} className="w-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer">
                Cerrar
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer Summary (only when in cart step and items exist) */}
        {checkoutStep === 'cart' && items.length > 0 && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-sm font-black text-slate-950">
                <span>Total productos:</span>
                <span className="text-base">{formatCOP(subtotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500">El costo de envío se confirma por WhatsApp según tu ciudad.</p>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar con el Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
