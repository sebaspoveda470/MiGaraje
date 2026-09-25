import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import { Header } from './components/Header';
import { SmartRecommendations } from './components/SmartRecommendations';
import { CarMarketplace } from './components/CarMarketplace';
import { NuestrosProductos } from './components/NuestrosProductos';
import { CommunityHub } from './components/CommunityHub';
import { GarageModal } from './components/GarageModal';
import { CartDrawer } from './components/CartDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { WebHero } from './components/WebHero';
import { WebFooter } from './components/WebFooter';
import { PartnerStoreModal } from './components/PartnerStoreModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { auth, isAdminEmail } from './firebase';
import { signOut } from './services/authService';
import {
  getUserProfile,
  saveUserProfile,
  subscribeToVehicles,
  saveVehicle,
  deleteVehicle,
} from './services/userService';
import { subscribeToListings, publishListing, deleteListing } from './services/listingService';
import {
  subscribeToProducts,
  saveProduct,
  deleteProduct,
  seedInitialProducts,
  subscribeToStoreSettings,
  saveSalesWhatsApp,
} from './services/productService';
import { initialCommunities } from './data/initialData';
import {
  Vehicle,
  VehicleListing,
  CareProduct,
  CartItem,
  UserProfile,
} from './types';
import { Sparkles, AlertCircle } from 'lucide-react';

// Keys written by the previous localStorage-only version of the app.
const LEGACY_STORAGE_KEYS = [
  'migaraje_user',
  'migaraje_vehicles',
  'migaraje_care_products',
  'migaraje_car_listings',
  'migaraje_official_whatsapp',
  'migaraje_partner_stores_local',
  'migaraje_orders_local',
];

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, blocked site data): conveniences only.
  }
}

export function App() {
  // Auth & profile
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const isAdmin = isAdminEmail(authUser?.email) && !!authUser?.emailVerified;

  // Garage
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(() => readStorage('migaraje_active_vehicle'));

  // Navigation & UI Modals State
  const [activeTab, setActiveTab] = useState<string>('garaje');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isStoreRegisterOpen, setIsStoreRegisterOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isGarageModalOpen, setIsGarageModalOpen] = useState<boolean>(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Shared catalog data (Firestore, realtime)
  const [carListings, setCarListings] = useState<VehicleListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [careProducts, setCareProducts] = useState<CareProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [salesWhatsApp, setSalesWhatsApp] = useState('');
  const communities = initialCommunities;

  // Cart (per-device convenience)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = readStorage('migaraje_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), isError ? 5000 : 3500);
  };

  const showError = (message: string) => (err: unknown) => {
    console.error(message, err);
    showToast(message, true);
  };

  // One-time cleanup of data from the old localStorage-only version
  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach((key) => writeStorage(key, null));
  }, []);

  // Auth session → profile
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthUser(firebaseUser);
      if (!firebaseUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      setIsAuthOpen(false);
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
        if (!profile) setIsOnboardingOpen(true);
      } catch (err) {
        showError('No pudimos cargar tu perfil. Revisa tu conexión.')(err);
      } finally {
        setAuthReady(true);
      }
    });
  }, []);

  // Garage vehicles for the signed-in user
  useEffect(() => {
    if (!authUser) {
      setVehicles([]);
      return;
    }
    return subscribeToVehicles(authUser.uid, setVehicles, showError('No pudimos cargar tus vehículos.'));
  }, [authUser]);

  // Public data
  useEffect(() => {
    return subscribeToListings(
      (listings) => {
        setCarListings(listings);
        setListingsLoading(false);
      },
      (err) => {
        setListingsLoading(false);
        showError('No pudimos cargar los vehículos en venta.')(err);
      }
    );
  }, []);

  useEffect(() => {
    return subscribeToProducts(
      (products) => {
        setCareProducts(products);
        setProductsLoading(false);
      },
      (err) => {
        setProductsLoading(false);
        showError('No pudimos cargar los productos.')(err);
      }
    );
  }, []);

  useEffect(() => {
    return subscribeToStoreSettings((settings) => setSalesWhatsApp(settings.salesWhatsApp), (err) =>
      console.error('No se pudo cargar la configuración de la tienda', err)
    );
  }, []);

  // Keep a valid active vehicle selected
  useEffect(() => {
    if (vehicles.length > 0 && (!activeVehicleId || !vehicles.some((v) => v.id === activeVehicleId))) {
      setActiveVehicleId(vehicles[0].id);
    }
  }, [vehicles, activeVehicleId]);

  useEffect(() => {
    writeStorage('migaraje_active_vehicle', activeVehicleId);
  }, [activeVehicleId]);

  useEffect(() => {
    writeStorage('migaraje_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || (vehicles.length > 0 ? vehicles[0] : null);

  /**
   * Gate for actions that need an account. Opens login or profile completion
   * when needed and returns false so the caller can stop.
   */
  const requireAuth = (): boolean => {
    if (!authUser) {
      setIsAuthOpen(true);
      return false;
    }
    if (!user) {
      setIsOnboardingOpen(true);
      return false;
    }
    return true;
  };

  // Profile completion (after first sign-in)
  const handleCompleteOnboarding = async (profile: UserProfile, vehicle: Vehicle | null) => {
    await saveUserProfile(profile);
    if (vehicle) {
      await saveVehicle(profile.id, vehicle);
      setActiveVehicleId(vehicle.id);
    }
    setUser(profile);
    setIsOnboardingOpen(false);
    const firstName = profile.fullName.split(' ')[0];
    showToast(
      vehicle
        ? `¡Bienvenido, ${firstName}! Tu ${vehicle.brand} ${vehicle.model} ha sido registrado.`
        : `¡Bienvenido, ${firstName}! Tu cuenta está lista.`
    );
  };

  const handleOpenAccount = () => {
    if (!authUser) setIsAuthOpen(true);
    else if (!user) setIsOnboardingOpen(true);
    else setIsProfileModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCartItems([]);
      setActiveVehicleId(null);
      setIsProfileModalOpen(false);
      showToast('Sesión cerrada.');
    } catch (err) {
      showError('No se pudo cerrar la sesión.')(err);
    }
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
    showToast(`"${item.name}" añadido al carrito`);
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
    if (!requireAuth()) return;
    setVehicleToEdit(null);
    setIsGarageModalOpen(true);
  };

  const handleOpenEditVehicle = (veh: Vehicle) => {
    setVehicleToEdit(veh);
    setIsGarageModalOpen(true);
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    if (!authUser) return;
    setActiveVehicleId(newVeh.id);
    saveVehicle(authUser.uid, newVeh)
      .then(() => showToast(`Vehículo ${newVeh.brand} ${newVeh.model} registrado y activado`))
      .catch(showError('No se pudo guardar el vehículo. Inténtalo de nuevo.'));
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    if (!authUser) return;
    saveVehicle(authUser.uid, updatedVeh)
      .then(() => showToast(`Datos de ${updatedVeh.brand} ${updatedVeh.model} actualizados con éxito`))
      .catch(showError('No se pudieron guardar los cambios del vehículo.'));
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (!authUser) return;
    deleteVehicle(authUser.uid, vehicleId)
      .then(() => showToast('Vehículo eliminado de tu garaje'))
      .catch(showError('No se pudo eliminar el vehículo.'));
  };

  // Listing Management (Compra & Venta de Vehículos)
  const handlePublishListing = async (newListing: Omit<VehicleListing, 'id'>) => {
    if (!authUser) return;
    await publishListing(authUser.uid, newListing);
    showToast(`¡Tu ${newListing.title} ha sido publicado exitosamente en Compra & Venta!`);
  };

  const handleDeleteListing = (listingId: string) => {
    deleteListing(listingId)
      .then(() => showToast('Publicación eliminada'))
      .catch(showError('No se pudo eliminar la publicación.'));
  };

  // Product catalog (admin)
  const handleSaveProduct = async (product: CareProduct) => {
    await saveProduct(product);
    showToast(`Producto "${product.name}" guardado`);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId)
      .then(() => showToast('Producto eliminado'))
      .catch(showError('No se pudo eliminar el producto.'));
  };

  const handleSeedProducts = () => {
    seedInitialProducts()
      .then(() => showToast('Catálogo inicial cargado. Revisa precios y fotos antes de vender.'))
      .catch(showError('No se pudo cargar el catálogo inicial.'));
  };

  const handleSaveSalesWhatsApp = async (number: string) => {
    await saveSalesWhatsApp(number);
    showToast('WhatsApp de ventas actualizado');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-slate-900 selection:text-white">

      {/* Toast Banner */}
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-[60] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4 duration-200 border ${
            toast.isError ? 'bg-red-700 text-white border-red-800' : 'bg-slate-950 text-white border-slate-800'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
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
          onOpenOnboarding={handleOpenAccount}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 pb-32 sm:pb-12">

        {/* TAB 1: MI GARAJE (BITÁCORA, MANTENIMIENTO PREVENTIVO Y CONTROL) */}
        {activeTab === 'garaje' && (
          <div className="space-y-8">
            <WebHero
              listingsCount={listingsLoading ? null : carListings.length}
              onExploreVehicles={() => setActiveTab('vehiculos')}
              onExploreProducts={() => setActiveTab('productos')}
              onRegisterCar={handleOpenAddVehicle}
            />

            {authReady && (
              <SmartRecommendations
                activeVehicle={activeVehicle}
                onOpenAddVehicleModal={handleOpenAddVehicle}
                onEditVehicle={handleOpenEditVehicle}
                careProducts={careProducts}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>
        )}

        {/* TAB 2: COMPRA Y VENTA DE VEHÍCULOS */}
        {activeTab === 'vehiculos' && (
          <CarMarketplace
            carListings={carListings}
            isLoading={listingsLoading}
            currentUserId={authUser?.uid || null}
            currentUser={user}
            isAdmin={isAdmin}
            requireAuth={requireAuth}
            onPublishListing={handlePublishListing}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {/* TAB 3: NUESTROS PRODUCTOS MIGARAJE (VENTA DIRECTA POR WHATSAPP) */}
        {activeTab === 'productos' && (
          <NuestrosProductos
            products={careProducts}
            isLoading={productsLoading}
            isAdmin={isAdmin}
            salesWhatsApp={salesWhatsApp}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSeedCatalog={handleSeedProducts}
            onSaveSalesWhatsApp={handleSaveSalesWhatsApp}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* TAB 4: MI COMUNIDAD (CLUBES DE MARCA EN COLOMBIA) */}
        {activeTab === 'comunidades' && (
          <CommunityHub
            communities={communities}
            activeVehicle={activeVehicle}
            currentUserId={authUser?.uid || null}
            currentUser={user}
            isAdmin={isAdmin}
            requireAuth={requireAuth}
            onError={(message, err) => showError(message)(err)}
          />
        )}

      </main>

      {/* Mobile-Native Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
        cartItemCount={totalCartCount}
        cartTotalPrice={totalCartPrice}
        activeVehicle={activeVehicle || null}
      />

      {/* Sign in / Sign up */}
      <AuthModal isOpen={isAuthOpen && !authUser} onClose={() => setIsAuthOpen(false)} />

      {/* Profile completion & first vehicle (after first sign-in) */}
      <OnboardingModal
        key={authUser?.uid || 'anon'}
        isOpen={isOnboardingOpen && !!authUser && !user}
        account={authUser ? { uid: authUser.uid, email: authUser.email || '', displayName: authUser.displayName } : null}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
      />

      {/* Partner Store Registration Modal */}
      <PartnerStoreModal
        isOpen={isStoreRegisterOpen}
        ownerId={authUser?.uid || null}
        onClose={() => setIsStoreRegisterOpen(false)}
        onStoreRegistered={() => {
          showToast('¡Solicitud enviada! Revisaremos los datos de tu almacén y te contactaremos.');
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
        user={user}
        salesWhatsApp={salesWhatsApp}
        requireAuth={requireAuth}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Rich Web Ecosystem Footer */}
      <WebFooter
        salesWhatsApp={salesWhatsApp}
        onNavigateTab={setActiveTab}
        onOpenStoreModal={() => {
          if (!requireAuth()) return;
          setIsStoreRegisterOpen(true);
        }}
      />

    </div>
  );
}

export default App;
