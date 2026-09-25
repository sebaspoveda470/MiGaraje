import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CareProduct } from '../types';
import { INITIAL_CARE_PRODUCTS } from '../data/initialData';

const productsRef = collection(db, 'products');
const settingsRef = doc(db, 'config', 'store');

export interface StoreSettings {
  salesWhatsApp: string;
}

/**
 * Streams the official product catalog, newest first.
 */
export function subscribeToProducts(
  onChange: (products: CareProduct[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const products = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          ...(data as CareProduct),
          id: d.id,
          createdAt: (data.createdAt as Timestamp | undefined)?.toMillis(),
        };
      });
      products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onChange(products);
    },
    onError
  );
}

/**
 * Creates or replaces a product. Admin only (enforced by firestore.rules).
 */
export async function saveProduct(product: CareProduct): Promise<void> {
  const { id, createdAt, ...data } = product;
  await setDoc(doc(productsRef, id), {
    ...data,
    createdAt: createdAt ? Timestamp.fromMillis(createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(productsRef, productId));
}

/**
 * Loads the starter catalog from initialData into an empty `products` collection.
 */
export async function seedInitialProducts(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_CARE_PRODUCTS.forEach((product, index) => {
    const { id, ...data } = product;
    // Stagger timestamps so the catalog keeps its original order.
    batch.set(doc(productsRef, id), {
      ...data,
      createdAt: Timestamp.fromMillis(Date.now() - index * 1000),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export function subscribeToStoreSettings(
  onChange: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    settingsRef,
    (snap) => onChange({ salesWhatsApp: (snap.data()?.salesWhatsApp as string) || '' }),
    onError
  );
}

export async function saveSalesWhatsApp(number: string): Promise<void> {
  await setDoc(settingsRef, { salesWhatsApp: number, updatedAt: serverTimestamp() }, { merge: true });
}
