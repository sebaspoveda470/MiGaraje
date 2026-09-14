import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SmartRecommendations } from './components/SmartRecommendations';
import { RepuestosMarketplace } from './components/RepuestosMarketplace';
import { CarMarketplace } from './components/CarMarketplace';
import { ClasicosRestauracion } from './components/ClasicosRestauracion';
import { CuidadoEsteticoMotor } from './components/CuidadoEsteticoMotor';
import { CommunityHub } from './components/CommunityHub';
import { GarageModal } from './components/GarageModal';
import { CartDrawer } from './components/CartDrawer';
import { IntermediationModal } from './components/IntermediationModal';
import { AiMechanicChat } from './components/AiMechanicChat';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { Logo } from './components/Logo';
import { WebHero } from './components/WebHero';
import { WebFooter } from './components/WebFooter';
import { PartnerStoreModal } from './components/PartnerStoreModal';
import { saveUserToDatabase } from './services/userService';
import { 
  initialSpareParts, 
  initialCarListings, 
  initialCareProducts, 
  initialCommunities 
} from './data/initialData';
import { 
  Vehicle, 
  SparePart, 
  VehicleListing, 
  CareProduct, 
  BrandCommunity, 
  CartItem,
  UserProfile 
} from './types';
import { 
  Bot, 
  Sparkles, 
  ShoppingCart,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export function App() {
  // User Profile State (persisted in localStorage)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('migaraje_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Core Vehicles State (persisted in localStorage, starts EMPTY until registered!)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('migaraje_vehicles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('migaraje_active_vehicle');
      return saved || null;
    } catch {
      return null;
    }
  });

  // Navigation & UI Modals State
  const [activeTab, setActiveTab] = useState<string>('garaje');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isStoreRegisterOpen, setIsStoreRegisterOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isGarageModalOpen, setIsGarageModalOpen] = useState<boolean>(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  // Store Market Catalog Data
  const [spareParts] = useState<SparePart[]>(initialSpareParts);
  const [carListings, setCarListings] = useState<VehicleListing[]>(initialCarListings);
  const [careProducts, setCareProducts] = useState<CareProduct[]>(() => {
    try {
      const saved = localStorage.getItem('migaraje_care_products');
      return saved ? JSON.parse(saved) : initialCareProducts;
    } catch {
      return initialCareProducts;
    }
  });
  const [communities] = useState<BrandCommunity[]>(initialCommunities);

  // Sync custom published care products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('migaraje_care_products', JSON.stringify(careProducts));
    } catch (e) {
      console.error(e);
    }
  }, [careProducts]);

  const handleRegisterCareProduct = (newProduct: CareProduct) => {
    setCareProducts((prev) => [newProduct, ...prev]);
    showToast(`Producto "${newProduct.name}" publicado exitosamente para la venta`);
  };

  // Cart & Intermediation State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('migaraje_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedIntermediationListing, setSelectedIntermediationListing] = useState<VehicleListing | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('migaraje_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('migaraje_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('migaraje_vehicles', JSON.stringify(vehicles));
      if (vehicles.length > 0 && (!activeVehicleId || !vehicles.some(v => v.id === activeVehicleId))) {
        setActiveVehicleId(vehicles[0].id);
      }
      if (user) {
        saveUserToDatabase(user, vehicles);
      }
    } catch (e) {
      console.error(e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      if (activeVehicleId) {
        localStorage.setItem('migaraje_active_vehicle', activeVehicleId);
      } else {
        localStorage.removeItem('migaraje_active_vehicle');
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeVehicleId]);

  useEffect(() => {
    try {
      localStorage.setItem('migaraje_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Find active vehicle
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || (vehicles.length > 0 ? vehicles[0] : null);

  // Registration / Onboarding Completion
  const handleCompleteOnboarding = (newUser: UserProfile, newVehicle: Vehicle) => {
    setUser(newUser);
    const updatedVehicles = [newVehicle];
    setVehicles(updatedVehicles);
    setActiveVehicleId(newVehicle.id);
    setIsOnboardingOpen(false);
    
    // Save to Firestore cloud database
    saveUserToDatabase(newUser, updatedVehicles);

    showToast(`¡Bienvenido, ${newUser.fullName.split(' ')[0]}! Tu ${newVehicle.brand} ${newVehicle.model} ha sido registrado.`);
  };

  // Quick Login
  const handleLoginExisting = (existingUser: UserProfile) => {
    setUser(existingUser);
    setIsOnboardingOpen(false);
    showToast(`Sesión iniciada como ${existingUser.fullName}`);
  };

  // Logout / Reset
  const handleLogout = () => {
    setUser(null);
    setVehicles([]);
    setActiveVehicleId(null);
    setCartItems([]);
    localStorage.removeItem('migaraje_user');
    localStorage.removeItem('migaraje_vehicles');
    localStorage.removeItem('migaraje_active_vehicle');
    localStorage.removeItem('migaraje_cart');
    setIsProfileModalOpen(false);
    setIsOnboardingOpen(true);
    showToast('Sesión cerrada. Regístrate para vincular tu vehículo.');
  };

  // Cart Operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    showToast(`"${item.name}" añadido al carrito con garantía`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Vehicle Management
  const handleOpenAddVehicle = () => {
    setVehicleToEdit(null);
    setIsGarageModalOpen(true);
  };

  const handleOpenEditVehicle = (veh: Vehicle) => {
    setVehicleToEdit(veh);
    setIsGarageModalOpen(true);
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles((prev) => [...prev, newVeh]);
    setActiveVehicleId(newVeh.id);
    showToast(`Vehículo ${newVeh.brand} ${newVeh.model} registrado y activado`);
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVeh.id ? updatedVeh : v))
    );
    showToast(`Datos de ${updatedVeh.brand} ${updatedVeh.model} actualizados con éxito`);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles((prev) => {
      const filtered = prev.filter((v) => v.id !== vehicleId);
      if (activeVehicleId === vehicleId) {
        setActiveVehicleId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    showToast('Vehículo eliminado de tu garaje');
  };

  // Listing Management
  const handlePublishListing = (newListing: VehicleListing) => {
    setCarListings((prev) => [newListing, ...prev]);
    showToast('Vehículo publicado exitosamente en el Marketplace');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-slate-900 selection:text-white">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-200 border border-slate-800">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header */}
      <div className="relative z-30">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeVehicle={activeVehicle}
          vehicles={vehicles}
          user={user}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onSelectVehicle={(vOrId) => {
            if (typeof vOrId === 'string') {
              setActiveVehicleId(vOrId);
            } else if (vOrId && typeof vOrId === 'object') {
              setActiveVehicleId(vOrId.id);
            }
          }}
          onOpenGarageModal={handleOpenAddVehicle}
          onEditVehicle={handleOpenEditVehicle}
          cartItemCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-28 sm:pb-12">
        
        {/* TAB 1: GARAJE INTELIGENTE & RECOMENDACIONES IA */}
        {activeTab === 'garaje' && (
          <div className="space-y-8">
            {/* Website Hero Presentation Section */}
            <WebHero
              onExploreCatalog={() => setActiveTab('repuestos')}
              onExploreStores={() => setActiveTab('repuestos')}
              onAskAi={() => setIsAiChatOpen(true)}
              onRegisterCar={() => {
                if (!user) {
                  setIsOnboardingOpen(true);
                } else {
                  handleOpenAddVehicle();
                }
              }}
            />

            <SmartRecommendations
              activeVehicle={activeVehicle}
              onOpenAddVehicleModal={() => {
                if (!user) {
                  setIsOnboardingOpen(true);
                } else {
                  handleOpenAddVehicle();
                }
              }}
              onEditVehicle={handleOpenEditVehicle}
              spareParts={spareParts}
              careProducts={careProducts}
              onAddToCart={handleAddToCart}
              onNavigateToTab={setActiveTab}
              onOpenPartDetail={() => {
                setActiveTab('repuestos');
              }}
            />
          </div>
        )}

        {/* TAB 2: INTERMEDIACIÓN DE REPUESTOS & AUTOPARTES */}
        {activeTab === 'repuestos' && (
          <RepuestosMarketplace
            spareParts={spareParts}
            activeVehicle={activeVehicle}
            onAddToCart={handleAddToCart}
            onRequestSpecialQuote={() => {
              showToast('Solicitud de cotización enviada a 80+ tiendas aliadas');
            }}
          />
        )}

        {/* TAB 3: COMPRA Y VENTA DE VEHÍCULOS (MARKETPLACE) */}
        {activeTab === 'vehiculos' && (
          <CarMarketplace
            carListings={carListings}
            onPublishListing={handlePublishListing}
            onOpenIntermediationModal={(listing) => {
              setSelectedIntermediationListing(listing);
            }}
          />
        )}

        {/* TAB 4: VEHÍCULOS CLÁSICOS & RESTAURACIÓN */}
        {activeTab === 'clasicos' && (
          <ClasicosRestauracion
            carListings={carListings}
            onOpenIntermediationModal={(listing) => {
              setSelectedIntermediationListing(listing);
            }}
          />
        )}

        {/* TAB 5: CUIDADO ESTÉTICO & MOTOR */}
        {activeTab === 'cuidado' && (
          <CuidadoEsteticoMotor
            careProducts={careProducts}
            onAddToCart={handleAddToCart}
            onRegisterProduct={handleRegisterCareProduct}
          />
        )}

        {/* TAB 6: CLUBES & COMUNIDADES DE MARCA */}
        {activeTab === 'comunidades' && (
          <CommunityHub
            communities={communities}
            activeVehicle={activeVehicle}
            onSelectCommunity={() => {}}
            onNavigateToTab={setActiveTab}
          />
        )}

      </main>

      {/* Persistent Mobile Bottom Sticky Cart & Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex-1 mr-2 cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-white" />
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-blue-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-black leading-tight flex items-center justify-between">
              <span>{totalCartCount > 0 ? `Carrito (${totalCartCount})` : 'Ver Carrito'}</span>
              {totalCartCount > 0 && (
                <span className="text-blue-300 font-mono text-xs">${totalCartPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="text-[10px] text-slate-300 font-normal">Intermediación & Garantía</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Mobile AI Quick Trigger */}
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="p-3 bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-xl border border-slate-300 text-slate-900 shrink-0 shadow-xs cursor-pointer"
          title="Consultar Mecánico IA"
        >
          <Bot className="w-5 h-5 text-slate-950" />
        </button>
      </div>

      {/* Floating AI Mechanic Button (Visible on Desktop / Tablet) */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="hidden sm:flex fixed bottom-6 right-6 z-40 bg-white text-slate-900 hover:bg-slate-50 border border-slate-300 font-bold p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-xl items-center gap-3 transition-all hover:scale-102 cursor-pointer group"
          title="Consultar Mecánico IA"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-black text-slate-950 leading-tight">Mecánico IA 24/7</div>
            <div className="text-[10px] text-slate-600 font-medium">Diagnóstico & Consultas</div>
          </div>
        </button>
      )}

      {/* User Registration & First Vehicle Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
        onLoginExisting={handleLoginExisting}
      />

      {/* Partner Store Registration Modal */}
      <PartnerStoreModal
        isOpen={isStoreRegisterOpen}
        onClose={() => setIsStoreRegisterOpen(false)}
        onStoreCreated={() => {
          showToast('¡Almacén registrado con éxito! Tu tienda ahora aparece en la red oficial.');
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        vehicles={vehicles}
        activeVehicleId={activeVehicleId}
        onSelectVehicle={(id) => setActiveVehicleId(id)}
        onOpenAddVehicle={handleOpenAddVehicle}
        onEditVehicle={handleOpenEditVehicle}
        onLogout={handleLogout}
      />

      {/* Vehicle Garage Registration & Editing Modal */}
      <GarageModal
        isOpen={isGarageModalOpen}
        onClose={() => {
          setIsGarageModalOpen(false);
          setVehicleToEdit(null);
        }}
        vehicleToEdit={vehicleToEdit}
        onAddVehicle={handleAddVehicle}
        onUpdateVehicle={handleUpdateVehicle}
        onDeleteVehicle={handleDeleteVehicle}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Vehicle Purchase Intermediation Modal */}
      <IntermediationModal
        listing={selectedIntermediationListing}
        onClose={() => setSelectedIntermediationListing(null)}
      />

      {/* AI Mechanic Chat Modal/Drawer */}
      <AiMechanicChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        activeVehicle={activeVehicle}
        onNavigateToTab={setActiveTab}
      />

      {/* Rich Web Ecosystem Footer */}
      <WebFooter
        onNavigateTab={setActiveTab}
        onOpenStoreModal={() => setIsStoreRegisterOpen(true)}
        onOpenAiMechanic={() => setIsAiChatOpen(true)}
      />

    </div>
  );
}
export default App;
