import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Car, 
  Wrench, 
  ShoppingBag, 
  Sparkles, 
  Users, 
  Bot, 
  ShieldCheck, 
  PlusCircle, 
  ChevronDown, 
  ShoppingCart,
  Search,
  Award,
  Crown,
  Edit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Vehicle, CartItem, UserProfile } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  vehicles?: Vehicle[];
  userVehicles?: Vehicle[];
  activeVehicle: Vehicle | null;
  onSelectVehicle: ((id: string) => void) | ((vehicle: Vehicle) => void);
  onOpenGarageModal?: () => void;
  onOpenAddVehicleModal?: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  cart?: CartItem[];
  cartItemCount?: number;
  onOpenCart?: () => void;
  onOpenCartModal?: () => void;
  onOpenAdvisorModal?: () => void;
  globalSearch?: string;
  setGlobalSearch?: (s: string) => void;
  user?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  vehicles,
  userVehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenGarageModal,
  onOpenAddVehicleModal,
  onEditVehicle,
  cart,
  cartItemCount,
  onOpenCart,
  onOpenCartModal,
  onOpenAdvisorModal,
  globalSearch = '',
  setGlobalSearch,
  user,
  onOpenProfile,
  onOpenOnboarding,
}) => {
  const [garageDropdownOpen, setGarageDropdownOpen] = useState(false);

  // Horizontal scroll tracking for section tabs
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [thumbWidthPercent, setThumbWidthPercent] = useState(35);

  const updateScrollMetrics = useCallback(() => {
    const el = tabsNavRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const isScrollable = maxScroll > 4;
    setCanScroll(isScrollable);
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < maxScroll - 6);

    if (isScrollable && maxScroll > 0) {
      const progress = Math.max(0, Math.min(1, el.scrollLeft / maxScroll));
      setScrollProgress(progress);
      const visibleRatio = Math.max(0.2, Math.min(0.6, el.clientWidth / el.scrollWidth));
      setThumbWidthPercent(Math.round(visibleRatio * 100));
    } else {
      setScrollProgress(0);
      setThumbWidthPercent(100);
    }
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    const handleResize = () => updateScrollMetrics();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollMetrics]);

  useEffect(() => {
    updateScrollMetrics();
    const activeBtn = tabsNavRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-white/15 text-white shadow-2xl w-full max-w-full overflow-x-clip sm:overflow-visible">
      {/* Top Banner: Security & AI Support */}
      <div className="bg-white/[0.05] backdrop-blur-xl border-b border-white/10 px-3 sm:px-4 py-1.5 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-extrabold bg-white text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garantía & Seguridad
            </span>
            <span className="hidden sm:inline text-slate-200 text-[11px] font-medium">
              Diagnóstico inteligente, tiendas verificadas y repuestos 100% compatibles.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden xs:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-0.5 rounded-full text-[11px] text-slate-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>1.2k repuestos verificados</span>
            </div>
            {onOpenAdvisorModal && (
              <button
                onClick={onOpenAdvisorModal}
                className="flex items-center gap-1.5 font-bold text-slate-900 bg-white hover:bg-slate-100 px-3 py-0.5 rounded-full transition-all cursor-pointer shadow-xs text-[11px]"
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>Mecánico IA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Slogan */}
          <Logo 
            size="md" 
            onClick={() => handleTabChange('garaje')} 
            className="shrink-0"
          />

          {/* Quick Search (Desktop) */}
          {setGlobalSearch && (
            <div className="hidden lg:flex flex-1 max-w-md mx-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar repuestos, autos, productos de cuidado o temas..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/30 transition-all"
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
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
                className="flex items-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/15 p-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all shadow-md cursor-pointer group shrink-0"
                title={`Perfil: ${user.fullName}`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm border border-blue-400/40">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left max-w-[110px] truncate">
                  <div className="text-xs font-bold text-white truncate">{user.fullName.split(' ')[0]}</div>
                  <div className="text-[10px] text-blue-400 capitalize truncate">{user.role || 'Propietario'}</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/40 text-blue-300 hover:text-white px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Crear Cuenta</span>
                <span className="sm:hidden text-[11px]">Ingresar</span>
              </button>
            )}

            {/* Active Vehicle Selector */}
            <div className="relative shrink min-w-0">
              <button
                onClick={() => {
                  if (allVehicles.length === 0) {
                    handleOpenGarage();
                  } else {
                    setGarageDropdownOpen(!garageDropdownOpen);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/15 px-2 sm:px-3.5 py-1.5 rounded-xl text-left transition-all shadow-md cursor-pointer max-w-[125px] xs:max-w-[160px] sm:max-w-[200px]"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300 overflow-hidden shrink-0 border border-white/10">
                  {activeVehicle?.image ? (
                    <img src={activeVehicle.image} alt={activeVehicle.model} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate">
                      {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Registrar Auto'}
                    </span>
                    {activeVehicle?.hasClassicPlates && (
                      <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" title="Placa de Antiguo" />
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium truncate block">
                    {activeVehicle ? `${activeVehicle.year} • ${(activeVehicle.mileage / 1000).toFixed(0)}k km` : '+ Agregar'}
                  </span>
                </div>
                {allVehicles.length > 0 && (
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform shrink-0 ${garageDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Dropdown Menu for Garage */}
              {garageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 border-b border-white/10 mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Mis Vehículos Registrados</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-500/30">
                      {allVehicles.length} Autos
                    </span>
                  </div>

                  <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-none">
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
                              ? 'bg-blue-600/20 border border-blue-500/30 text-white font-bold'
                              : 'hover:bg-white/5 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-white/10 overflow-hidden shrink-0 border border-white/10">
                              {veh.image ? (
                                <img src={veh.image} alt={veh.model} className="w-full h-full object-cover" />
                              ) : (
                                <Car className="w-4 h-4 text-slate-400 m-auto mt-2.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold truncate text-white">
                                  {veh.brand} {veh.model}
                                </span>
                                {veh.hasClassicPlates && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">Antiguo</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
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
                                className="p-1 rounded-lg hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                                title="Modificar datos del vehículo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1.5 border-t border-white/10">
                    <button
                      onClick={() => {
                        setGarageDropdownOpen(false);
                        handleOpenGarage();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Registrar Nuevo Vehículo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button (Fully Accessible on Mobile & Desktop) */}
            <button
              onClick={handleOpenCartDrawer}
              aria-label="Abrir Carrito de Compras"
              className="relative p-2.5 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center gap-2 cursor-pointer"
              title="Carrito de Compras / Repuestos"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold">Carrito</span>
            </button>
          </div>

        </div>
      </div>

      {/* Module Navigation Tabs with Scrollbar & Indicator Bar */}
      <nav className="bg-white/[0.02] backdrop-blur-xl border-t border-white/10 px-2 sm:px-4 relative group/nav">
        <div className="max-w-7xl mx-auto relative flex items-center">
          
          {/* Scroll Left Button (Visible when scrolled to the right) */}
          {canScroll && canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              aria-label="Mover secciones a la izquierda"
              className="absolute left-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-md transition-all cursor-pointer -ml-1 sm:ml-0"
              title="Mover a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left Gradient Fade Mask */}
          {canScroll && canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
          )}

          {/* Scrollable Tabs Container */}
          <div 
            ref={tabsNavRef}
            onScroll={updateScrollMetrics}
            className="w-full flex items-center gap-1.5 overflow-x-auto py-2 px-1 scroll-smooth scrollbar-thin"
          >
            <button
              data-tab="garaje"
              onClick={() => handleTabChange('garaje')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'garaje'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Car className={`w-3.5 h-3.5 ${activeTab === 'garaje' ? 'text-blue-600' : 'text-blue-400'}`} />
              <span>Mi Garaje & IA</span>
              {activeVehicle && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs"></span>
              )}
            </button>

            <button
              data-tab="repuestos"
              onClick={() => handleTabChange('repuestos')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'repuestos'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Wrench className={`w-3.5 h-3.5 ${activeTab === 'repuestos' ? 'text-blue-600' : 'text-blue-400'}`} />
              <span>Repuestos & Autopartes</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'repuestos' ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'
              }`}>Tiendas</span>
            </button>

            <button
              data-tab="vehiculos"
              onClick={() => handleTabChange('vehiculos')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'vehiculos'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${activeTab === 'vehiculos' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>Compra & Venta</span>
            </button>

            <button
              data-tab="clasicos"
              onClick={() => handleTabChange('clasicos')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'clasicos'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeTab === 'clasicos' ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>Clásicos & Restauración</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30">Placas Antiguo</span>
            </button>

            <button
              data-tab="cuidado"
              onClick={() => handleTabChange('cuidado')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'cuidado'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'cuidado' ? 'text-purple-600' : 'text-purple-400'}`} />
              <span>Estética & Motor</span>
            </button>

            <button
              data-tab="comunidades"
              onClick={() => handleTabChange('comunidades')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeTab === 'comunidades'
                  ? 'bg-white text-slate-950 font-black shadow-lg shadow-white/10 border border-white'
                  : 'text-slate-200 font-semibold hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeTab === 'comunidades' ? 'text-teal-600' : 'text-teal-400'}`} />
              <span>Comunidades por Marca</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-bold border border-emerald-500/30">Clubs</span>
            </button>
          </div>

          {/* Right Gradient Fade Mask */}
          {canScroll && canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
          )}

          {/* Scroll Right Button (Visible when more content is to the right) */}
          {canScroll && canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              aria-label="Mover secciones a la derecha"
              className="absolute right-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-md transition-all cursor-pointer -mr-1 sm:mr-0"
              title="Mover a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barrita indicadora para mover secciones */}
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center pb-2 pt-0.5 px-4">
          <div className="flex items-center gap-2.5">
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                const el = tabsNavRef.current;
                if (el) {
                  const maxScroll = el.scrollWidth - el.clientWidth;
                  el.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
                }
              }}
              className="group/track relative w-36 xs:w-48 sm:w-60 h-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all shadow-inner overflow-hidden p-0.5 border border-white/10"
              title="Haz clic o desliza para mover las secciones"
              role="scrollbar"
              aria-label="Barra para mover las secciones"
            >
              {/* Thumb / Barrita indicadora */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-400 rounded-full shadow-sm shadow-blue-500/50 transition-all duration-100 ease-out"
                style={{
                  width: `${canScroll ? thumbWidthPercent : 100}%`,
                  transform: `translateX(${canScroll ? (scrollProgress * (100 - thumbWidthPercent)) / (thumbWidthPercent / 100) : 0}%)`,
                }}
              />
            </div>

            {canScroll && (
              <span className="text-[10px] text-slate-300 font-semibold select-none flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>Mover secciones</span>
              </span>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
