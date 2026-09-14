import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { PartnerStore, CheckoutOrder } from '../types';

const INITIAL_PARTNER_STORES: PartnerStore[] = [
  {
    id: 'store-1',
    commercialName: 'Autopartes Alemanas del Norte',
    taxId: '900.824.192-3',
    ownerName: 'Carlos Mario Gómez',
    email: 'ventas@alemanasdelnorte.com',
    phone: '+57 312 458 9012',
    whatsapp: '573124589012',
    city: 'Bogotá D.C.',
    address: 'Calle 63 # 24-18, Barrio 7 de Agosto',
    specialties: ['Frenos de alto rendimiento', 'Suspensión Bilstein/Meyle', 'Kits de distribución', 'Filtros Mann'],
    brands: ['BMW', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Porsche'],
    rating: 4.9,
    verified: true,
    commissionRate: 5.0,
    status: 'destacada',
    logoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80',
    description: 'Especialistas con más de 18 años de experiencia en partes originales e importación directa para marcas europeas con garantía certificada MiGaraje.',
    createdAt: new Date().toISOString(),
    catalogCount: 1420
  },
  {
    id: 'store-2',
    commercialName: 'Japón Parts & Motor Colombia',
    taxId: '901.332.884-1',
    ownerName: 'Alejandro Morales',
    email: 'contacto@japonparts.co',
    phone: '+57 300 789 2341',
    whatsapp: '573007892341',
    city: 'Medellín',
    address: 'Carrera 52 # 38-12, Sector Guayabal',
    specialties: ['Embragues Exedy', 'Bombas Aisin', 'Bujías NGK Láser', 'Amortiguadores KYB'],
    brands: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi'],
    rating: 4.8,
    verified: true,
    commissionRate: 5.0,
    status: 'activa',
    logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=150&auto=format&fit=crop&q=80',
    description: 'Distribuidor mayorista y minorista de partes genuinas y OEM japonesas. Envío nacional con intermediación segura.',
    createdAt: new Date().toISOString(),
    catalogCount: 2310
  },
  {
    id: 'store-3',
    commercialName: 'Clásicos & Americanos V8 Store',
    taxId: '830.129.567-9',
    ownerName: 'Rodrigo Santamaría',
    email: 'ventas@v8storeclassic.com',
    phone: '+57 315 620 4488',
    whatsapp: '573156204488',
    city: 'Cali',
    address: 'Av. Pasoancho con Calle 13',
    specialties: ['Carburadores Holley/Edelbrock', 'Partes eléctricas 12V restauradas', 'Cromados y molduras', 'Empaquetaduras'],
    brands: ['Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Land Rover'],
    rating: 4.95,
    verified: true,
    commissionRate: 7.0,
    status: 'destacada',
    logoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=150&auto=format&fit=crop&q=80',
    description: 'El santuario de las piezas raras, restauración de clásicos, placas de antiguo e importación de repuestos descontinuados de USA.',
    createdAt: new Date().toISOString(),
    catalogCount: 680
  }
];

const STORES_STORAGE_KEY = 'migaraje_partner_stores_local';
const ORDERS_STORAGE_KEY = 'migaraje_orders_local';

export const getPartnerStores = async (): Promise<PartnerStore[]> => {
  try {
    const q = query(collection(db, 'partnerStores'), orderBy('rating', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const stores: PartnerStore[] = [];
      snapshot.forEach((d) => {
        stores.push({ id: d.id, ...d.data() } as PartnerStore);
      });
      return stores;
    }
  } catch (err) {
    console.warn('Firestore partnerStores sync fallback to local cache:', err);
  }

  // Fallback to local storage if Firestore is empty or offline
  const cached = localStorage.getItem(STORES_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(INITIAL_PARTNER_STORES));
  return INITIAL_PARTNER_STORES;
};

export const registerPartnerStore = async (storeData: Omit<PartnerStore, 'id' | 'rating' | 'verified' | 'status' | 'createdAt'>): Promise<PartnerStore> => {
  const newStore: PartnerStore = {
    ...storeData,
    id: 'store-' + Date.now(),
    rating: 5.0,
    verified: true,
    status: 'activa',
    createdAt: new Date().toISOString(),
    catalogCount: storeData.catalogCount || 10
  };

  // Attempt to save in Firestore
  try {
    const docRef = await addDoc(collection(db, 'partnerStores'), {
      ...newStore,
      serverTime: serverTimestamp()
    });
    newStore.id = docRef.id;
  } catch (err) {
    console.warn('Could not write store to Firestore, stored locally:', err);
  }

  // Always update local cache for instant zero-latency UI
  try {
    const current = await getPartnerStores();
    const updated = [newStore, ...current];
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newStore;
};

export const createCheckoutOrder = async (orderData: Omit<CheckoutOrder, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber' | 'orderStatus' | 'warrantyProtected'>): Promise<CheckoutOrder> => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `MG-${new Date().getFullYear()}-${randomSuffix}`;
  const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const newOrder: CheckoutOrder = {
    ...orderData,
    id: 'ord-' + Date.now(),
    orderNumber,
    trackingNumber,
    orderStatus: 'confirmada',
    warrantyProtected: true,
    createdAt: new Date().toISOString()
  };

  // Save in Firestore
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...newOrder,
      serverTime: serverTimestamp()
    });
    newOrder.id = docRef.id;
  } catch (err) {
    console.warn('Could not save order in Firestore, saving locally:', err);
  }

  // Store in local history
  try {
    const existingStr = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing: CheckoutOrder[] = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([newOrder, ...existing]));
  } catch {
    // ignore
  }

  return newOrder;
};

export const getUserOrders = (): CheckoutOrder[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
