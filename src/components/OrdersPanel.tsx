import React, { useState } from 'react';
import { X, ClipboardList, MessageCircle, MapPin, Phone, Mail, StickyNote } from 'lucide-react';
import { CheckoutOrder } from '../types';
import { updateOrderStatus } from '../services/storeService';
import { useConfirm } from './ConfirmDialog';
import { timeAgo, toWhatsAppNumber } from '../utils/media';

interface OrdersPanelProps {
  isOpen: boolean;
  orders: CheckoutOrder[];
  onClose: () => void;
  onError: (message: string, err: unknown) => void;
}

type Status = CheckoutOrder['status'];

export const ORDER_STATUS: Record<Status, { label: string; badge: string }> = {
  pendiente: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  confirmada: { label: 'Confirmado', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
  despachada: { label: 'Despachado', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  entregada: { label: 'Entregado', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  cancelada: { label: 'Cancelado', badge: 'bg-slate-100 text-slate-600 border-slate-300' },
};

const FLOW: Status[] = ['pendiente', 'confirmada', 'despachada', 'entregada'];

const formatCOP = (value: number) => `$${value.toLocaleString('es-CO')}`;

export const OrdersPanel: React.FC<OrdersPanelProps> = ({ isOpen, orders, onClose, onError }) => {
  const [filter, setFilter] = useState<Status | 'todos'>('todos');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const confirmAction = useConfirm();

  if (!isOpen) return null;

  const visible = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);
  const countBy = (s: Status) => orders.filter((o) => o.status === s).length;

  const changeStatus = async (order: CheckoutOrder, status: Status) => {
    if (status === order.status) return;
    if (
      status === 'cancelada' &&
      !(await confirmAction(`El pedido ${order.orderNumber} quedará como cancelado.`, { title: '¿Cancelar pedido?', confirmLabel: 'Cancelar pedido', cancelLabel: 'Volver', danger: true }))
    )
      return;
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, status);
    } catch (err) {
      onError('No se pudo actualizar el pedido.', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full sm:max-w-xl h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Pedidos</h3>
              <p className="text-[11px] text-slate-500">{orders.length} en total • solo tú ves esta sección</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar pedidos"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-b border-slate-200 flex gap-1.5 overflow-x-auto">
          {(['todos', ...FLOW, 'cancelada'] as Array<Status | 'todos'>).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border cursor-pointer transition-colors ${
                filter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s === 'todos' ? `Todos (${orders.length})` : `${ORDER_STATUS[s].label} (${countBy(s)})`}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
          {visible.length === 0 && (
            <div className="text-center py-16 text-xs text-slate-500">
              {orders.length === 0 ? 'Todavía no has recibido pedidos por el carrito.' : 'No hay pedidos con este estado.'}
            </div>
          )}

          {visible.map((order) => {
            const buyerWhatsApp = toWhatsAppNumber(order.buyerPhone);
            const status = ORDER_STATUS[order.status] || ORDER_STATUS.pendiente;
            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-slate-950 text-sm">{order.orderNumber}</div>
                    <div className="text-[11px] text-slate-500">{timeAgo(order.createdAt)}</div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span>
                </div>

                <div className="space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900">{order.buyerName}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {order.buyerPhone}</div>
                  {order.buyerEmail && <div className="flex items-center gap-1.5 break-all"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {order.buyerEmail}</div>}
                  <div className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 mt-px shrink-0" /> {order.shippingAddress}, {order.city}</div>
                  {order.notes && <div className="flex items-start gap-1.5"><StickyNote className="w-3.5 h-3.5 text-slate-400 mt-px shrink-0" /> {order.notes}</div>}
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="truncate">{item.quantity} × {item.name}</span>
                      <span className="font-bold text-slate-900 shrink-0">{formatCOP(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 font-black text-slate-950">
                    <span>Total productos</span>
                    <span>{formatCOP(order.total)} COP</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {FLOW.map((s) => (
                    <button
                      key={s}
                      disabled={updatingId === order.id}
                      onClick={() => changeStatus(order, s)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer disabled:opacity-60 ${
                        order.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ORDER_STATUS[s].label}
                    </button>
                  ))}
                  <button
                    disabled={updatingId === order.id || order.status === 'cancelada'}
                    onClick={() => changeStatus(order, 'cancelada')}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-500 hover:text-red-700 hover:border-red-300 cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  {buyerWhatsApp && (
                    <a
                      href={`https://wa.me/${buyerWhatsApp}?text=${encodeURIComponent(`Hola ${order.buyerName.split(' ')[0]}! Te escribimos de MiGaraje por tu pedido ${order.orderNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-950 text-white hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Escribir al cliente
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
