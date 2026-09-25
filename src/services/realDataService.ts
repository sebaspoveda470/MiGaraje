import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { VehicleListing, CareProduct } from '../types';
import { initialCarListings, initialCareProducts } from '../data/initialData';

const DEFAULT_WHATSAPP = '573109876543';

/**
 * Gets the configured official WhatsApp number for MiGaraje
 */
export function getOfficialWhatsAppNumber(): string {
  try {
    const saved = localStorage.getItem('migaraje_official_whatsapp');
    return saved || DEFAULT_WHATSAPP;
  } catch {
    return DEFAULT_WHATSAPP;
  }
}

/**
 * Updates the configured official WhatsApp number for MiGaraje
 */
export function setOfficialWhatsAppNumber(phone: string): void {
  try {
    const clean = phone.replace(/\D/g, '');
    localStorage.setItem('migaraje_official_whatsapp', clean);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Loads real vehicle listings from Firestore with fallback to initial data
 */
export async function loadRealVehicleListings(): Promise<VehicleListing[]> {
  try {
    const colRef = collection(db, 'vehicleListings');
    const snapshot = await getDocs(colRef);
    
    if (!snapshot.empty) {
      const list: VehicleListing[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as VehicleListing);
      });
      // Sort newest first
      return list.sort((a, b) => (b.id > a.id ? 1 : -1));
    }
    
    // If Firestore collection has no items yet, check localStorage or use initial data
    const local = localStorage.getItem('migaraje_car_listings');
    if (local) {
      return JSON.parse(local);
    }
    return initialCarListings;
  } catch (error) {
    console.warn('Notice: Firestore vehicleListings load fallback', error);
    const local = localStorage.getItem('migaraje_car_listings');
    return local ? JSON.parse(local) : initialCarListings;
  }
}

/**
 * Saves or updates a real vehicle listing in Firestore & localStorage
 */
export async function saveRealVehicleListing(listing: VehicleListing): Promise<void> {
  try {
    // 1. Save in Firestore
    const docRef = doc(db, 'vehicleListings', listing.id);
    await setDoc(docRef, {
      ...listing,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Notice: Firestore save listing fallback', error);
  }

  // 2. Also keep in localStorage for offline resiliency
  try {
    const local = localStorage.getItem('migaraje_car_listings');
    const list: VehicleListing[] = local ? JSON.parse(local) : initialCarListings;
    const filtered = list.filter((item) => item.id !== listing.id);
    localStorage.setItem('migaraje_car_listings', JSON.stringify([listing, ...filtered]));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Deletes a vehicle listing from Firestore and localStorage
 */
export async function deleteRealVehicleListing(listingId: string): Promise<void> {
  try {
    const docRef = doc(db, 'vehicleListings', listingId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Notice: Firestore delete listing fallback', error);
  }

  try {
    const local = localStorage.getItem('migaraje_car_listings');
    if (local) {
      const list: VehicleListing[] = JSON.parse(local);
      localStorage.setItem('migaraje_car_listings', JSON.stringify(list.filter((l) => l.id !== listingId)));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Loads real products from Firestore with fallback to initial data
 */
export async function loadRealProducts(): Promise<CareProduct[]> {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    
    if (!snapshot.empty) {
      const list: CareProduct[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CareProduct);
      });
      return list.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    const local = localStorage.getItem('migaraje_care_products');
    if (local) {
      return JSON.parse(local);
    }
    return initialCareProducts;
  } catch (error) {
    console.warn('Notice: Firestore products load fallback', error);
    const local = localStorage.getItem('migaraje_care_products');
    return local ? JSON.parse(local) : initialCareProducts;
  }
}

/**
 * Saves a product to Firestore and localStorage
 */
export async function saveRealProduct(product: CareProduct): Promise<void> {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Notice: Firestore save product fallback', error);
  }

  try {
    const local = localStorage.getItem('migaraje_care_products');
    const list: CareProduct[] = local ? JSON.parse(local) : initialCareProducts;
    const filtered = list.filter((p) => p.id !== product.id);
    localStorage.setItem('migaraje_care_products', JSON.stringify([product, ...filtered]));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Deletes a product from Firestore and localStorage
 */
export async function deleteRealProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Notice: Firestore delete product fallback', error);
  }

  try {
    const local = localStorage.getItem('migaraje_care_products');
    if (local) {
      const list: CareProduct[] = JSON.parse(local);
      localStorage.setItem('migaraje_care_products', JSON.stringify(list.filter((p) => p.id !== productId)));
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Helper to compress and convert file to base64 data URL
 */
export function compressImageFile(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
