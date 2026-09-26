import React from 'react';
import { 
  Car, 
  ShoppingBag, 
  Sparkles, 
  Users, 
  ShoppingCart, 
  ChevronRight,
  ShieldCheck 
} from 'lucide-react';
import { Vehicle } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCart?: () => void;
  cartItemCount?: number;
  cartTotalPrice?: number;
  activeVehicle: Vehicle | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCart,
  cartItemCount = 0,
  cartTotalPrice = 0,
  activeVehicle,
}) => {
  const tabs = [
    {
      id: 'garaje',
      label: 'Mi Garaje',
      icon: Car,
      hasDot: !!activeVehicle,
    },
    {
      id: 'vehiculos',
      label: 'Vehículos',
      icon: ShoppingBag,
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: Sparkles,
    },
    {
      id: 'comunidades',
      label: 'Comunidad',
      icon: Users,
    },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 select-none">
      
      {/* Floating Sticky Cart Quick Pill (only when cart has items) */}
      {cartItemCount > 0 && onOpenCart && (
        <div className="px-3 pb-2">
          <button
            onClick={onOpenCart}
            className="w-full bg-slate-950 text-white rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-xl border border-slate-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 bg-white text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold truncate">
                  {cartItemCount} {cartItemCount === 1 ? 'producto en carrito' : 'productos en carrito'}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>Pedido por WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="text-xs font-mono font-black text-blue-400">
                ${cartTotalPrice.toLocaleString('es-CO')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      )}

      {/* Main Bottom Nav Bar: 4 balanced thumb-friendly touch targets */}
      <nav 
        aria-label="Navegación Móvil"
        className="bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'text-blue-600 font-bold' 
                    : 'text-slate-500 font-medium hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-600' : 'text-slate-500'}`} />
                  {tab.hasDot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none tracking-tight">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-3 h-0.5 bg-blue-600 rounded-full mt-1 animate-in fade-in" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};
