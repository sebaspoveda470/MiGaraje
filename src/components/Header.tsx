import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Car, 
  ShoppingBag, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ShoppingCart, 
  ShieldCheck, 
  Bot, 
  Award, 
  Users, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Crown,
  Flag
} from 'lucide-react';
import { Vehicle, UserProfile, CartItem } from '../types';
import { Logo } from './Logo';
import { MobileGarageDrawer } from './MobileGarageDrawer';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  user?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenOnboarding?: () => void;
  activeVehicle?: Vehicle | null;
  vehicles?: Vehicle[];
  userVehicles?: Vehicle[];
  onSelectVehicle?: (vehicle: Vehicle | string) => void;
  onOpenGarageModal?: () => void;
  onOpenAddVehicleModal?: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  cartItemCount?: number;
  /** Admin only: pending reports and a way to open the panel */
  pendingReportsCount?: number;
  onOpenReports?: () => void;
  cart?: CartItem[];
  onOpenCart?: () => void;
  onOpenCartModal?: () => void;
  onOpenAdvisorModal?: () => void;
  globalSearch?: string;
  setGlobalSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'garaje',
  onTabChange,
  setActiveTab,
  user,
  onOpenProfile,
  onOpenOnboarding,
  activeVehicle,
  vehicles,
  userVehicles,
  onSelectVehicle,
  onOpenGarageModal,
  onOpenAddVehicleModal,
  onEditVehicle,
  cartItemCount,
  pendingReportsCount,
  onOpenReports,
cart,
  onOpenCart,
  onOpenCartModal,
  onOpenAdvisorModal,
  globalSearch,
  setGlobalSearch,
}) => {
  const [garageDropdownOpen, setGarageDropdownOpen] = useState(false);
  const [mobileGarageOpen, setMobileGarageOpen] = useState(false);
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [canScroll, setCanScroll] = useState<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const [thumbWidthPercent, setThumbWidthPercent] = useState<number>(30);

  const updateScrollMetrics = useCallback(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 1) {
      setCanScroll(true);
      const current = el.scrollLeft;
      const progress = Math.max(0, Math.min(1, current / maxScroll));
      setScrollProgress(progress);
      setCanScrollLeft(current > 4);
      setCanScrollRight(current < maxScroll - 4);
      const ratio = el.clientWidth / el.scrollWidth;
      setThumbWidthPercent(Math.max(18, Math.min(60, ratio * 100)));
    } else {
      setCanScroll(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setScrollProgress(0);
      setThumbWidthPercent(100);
    }
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    window.addEventListener('resize', updateScrollMetrics);
    return () => window.removeEventListener('resize', updateScrollMetrics);
  }, [updateScrollMetrics]);

  useEffect(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    const activeEl = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeEl) {
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = el.clientWidth;
      const targetScroll = elLeft - (containerWidth / 2) + (elWidth / 2);
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [activeTab, updateScrollMetrics]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsNavRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    else if (setActiveTab) setActiveTab(tab);
  };

  const handleOpenGarage = () => {
    if (onOpenGarageModal) onOpenGarageModal();
    else if (onOpenAddVehicleModal) onOpenAddVehicleModal();
  };

  const handleOpenCartDrawer = () => {
    if (onOpenCart) onOpenCart();
    else if (onOpenCartModal) onOpenCartModal();
  };

  const allVehicles = vehicles || userVehicles || [];
  const itemCount = cartItemCount ?? (cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs w-full max-w-full overflow-x-clip sm:overflow-visible">
      
      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Slogan (compact on phones so the right-side buttons fit) */}
          <div className="hidden sm:block shrink-0">
            <Logo size="md" onClick={() => handleTabChange('garaje')} />
          </div>
          <div className="sm:hidden shrink-0">
            <Logo size="sm" showTagline={false} onClick={() => handleTabChange('garaje')} />
          </div>

          {/* Quick Search (Desktop) */}
          {setGlobalSearch && (
            <div className="hidden lg:flex flex-1 max-w-md mx-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar vehículos en venta, productos MiGaraje o temas en Mi Comunidad..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Active Vehicle, User Profile & Cart Section */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* User Profile / Login Button */}
            {user ? (
              <button
                onClick={onOpenProfile}
                aria-label="Abrir Perfil de Usuario"
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all shadow-xs cursor-pointer group shrink-0"
                title={`Perfil: ${user.fullName}`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left max-w-[110px] truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">{user.fullName.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500 capitalize truncate">{user.role || 'Propietario'}</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Crear Cuenta</span>
                <span className="sm:hidden text-[11px]">Ingresar</span>
              </button>
            )}

            {/* Active Vehicle Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  if (allVehicles.length === 0) {
                    handleOpenGarage();
                  } else if (typeof window !== 'undefined' && window.innerWidth < 640) {
                    setMobileGarageOpen(true);
                  } else {
                    setGarageDropdownOpen(!garageDropdownOpen);
                  }
                }}
                aria-label="Mi Auto"
                className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 sm:px-3 py-1.5 rounded-xl text-left transition-all shadow-xs cursor-pointer sm:max-w-[200px]"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 overflow-hidden shrink-0">
                  {activeVehicle?.image ? (
                    <img src={activeVehicle.image} alt={activeVehicle.model} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate whitespace-nowrap">
                      <span className="sm:hidden">Mi Auto</span>
                      <span className="hidden sm:inline">
                        {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Mi Auto'}
                      </span>
                    </span>
                    {activeVehicle?.hasClassicPlates && (
                      <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" title="Placa de Antiguo" />
                    )}
                  </div>
                  <span className="hidden sm:block text-[10px] text-slate-500 font-medium truncate">
                    {activeVehicle ? `${activeVehicle.year} • ${(activeVehicle.mileage / 1000).toFixed(0)}k km` : '+ Agregar'}
                  </span>
                </div>
                {allVehicles.length > 0 && (
                  <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${garageDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Dropdown Menu for Garage (Desktop) */}
              {garageDropdownOpen && (
                <div className="hidden sm:block absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Mis Vehículos Registrados</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                      {allVehicles.length} Autos
                    </span>
                  </div>

                  <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                    {allVehicles.map((veh) => {
                      const isCurrent = activeVehicle?.id === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => {
                            (onSelectVehicle as any)(veh.id ? veh.id : veh);
                            setGarageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-100 border border-slate-300 text-slate-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                              {veh.image ? (
                                <img src={veh.image} alt={veh.model} className="w-full h-full object-cover" />
                              ) : (
                                <Car className="w-4 h-4 text-slate-500 m-auto mt-2" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold truncate text-slate-900">
                                  {veh.brand} {veh.model}
                                </span>
                                {veh.hasClassicPlates && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">Antiguo</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Año {veh.year} • {veh.mileage.toLocaleString()} km
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onEditVehicle && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGarageDropdownOpen(false);
                                  onEditVehicle(veh);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
                                title="Modificar datos del vehículo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setGarageDropdownOpen(false);
                        handleOpenGarage();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Registrar Nuevo Vehículo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin: reports */}
            {onOpenReports && (
              <button
                onClick={onOpenReports}
                aria-label="Reportes de contenido"
                title="Reportes de contenido"
                className="relative p-2 sm:p-2.5 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 transition-all cursor-pointer shrink-0"
              >
                <Flag className="w-4 h-4" />
                {!!pendingReportsCount && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={handleOpenCartDrawer}
              aria-label="Abrir Carrito de Compras"
              className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-95 text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              title="Carrito de Compras / Repuestos"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">Carrito</span>
            </button>

          </div>

        </div>
      </div>

      {/* Module Navigation Tabs */}
      <nav className="hidden sm:block border-t border-slate-200 px-2 sm:px-4 relative bg-slate-50/50">
        <div className="max-w-7xl mx-auto relative flex items-center">
          
          {/* Scroll Left Button */}
          {canScroll && canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              aria-label="Mover secciones a la izquierda"
              className="absolute left-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center shadow-md transition-all cursor-pointer -ml-1 sm:ml-0"
              title="Mover a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Tabs Container */}
          <div 
            ref={tabsNavRef}
            onScroll={updateScrollMetrics}
            className="w-full flex items-center gap-1 overflow-x-auto py-2 px-1 scroll-smooth scrollbar-thin"
          >
            <button
              data-tab="garaje"
              onClick={() => handleTabChange('garaje')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'garaje'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-300'
                  : 'text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Car className={`w-3.5 h-3.5 ${activeTab === 'garaje' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Mi Garaje</span>
              {activeVehicle && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              )}
            </button>

            <button
              data-tab="vehiculos"
              onClick={() => handleTabChange('vehiculos')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'vehiculos'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-300'
                  : 'text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${activeTab === 'vehiculos' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Compra & Venta</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">Vehículos</span>
            </button>

            <button
              data-tab="productos"
              onClick={() => handleTabChange('productos')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'productos'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-300'
                  : 'text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'productos' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Nuestros Productos</span>
              <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.2 rounded-full font-bold border border-blue-200">MiGaraje</span>
            </button>

            <button
              data-tab="comunidades"
              onClick={() => handleTabChange('comunidades')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'comunidades'
                  ? 'bg-white text-slate-950 font-bold shadow-xs border border-slate-300'
                  : 'text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'comunidades' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Mi Comunidad</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full font-bold">Clubes</span>
            </button>
          </div>

          {/* Scroll Right Button */}
          {canScroll && canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              aria-label="Mover secciones a la derecha"
              className="absolute right-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center shadow-md transition-all cursor-pointer -mr-1 sm:mr-0"
              title="Mover a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile-optimized Vehicle Selector Sheet */}
      <MobileGarageDrawer
        isOpen={mobileGarageOpen}
        onClose={() => setMobileGarageOpen(false)}
        vehicles={allVehicles}
        activeVehicle={activeVehicle || null}
        onSelectVehicle={(veh) => {
          if (onSelectVehicle) {
            onSelectVehicle(veh.id ? veh.id : veh);
          }
        }}
        onOpenAddVehicle={handleOpenGarage}
        onEditVehicle={onEditVehicle}
      />

    </header>
  );
};
