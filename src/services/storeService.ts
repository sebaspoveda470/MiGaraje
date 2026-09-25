import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { PartnerStore, CheckoutOrder } from '../types';

/**
 * Submits a partner store application. It starts unverified and "en revisión"
 * until an admin approves it from the Firebase console.
 */
export async function registerPartnerStore(
  ownerId: string,
  storeData: Omit<PartnerStore, 'id' | 'rating' | 'verified' | 'status' | 'createdAt' | 'ownerId'>
): Promise<PartnerStore> {
  const ref = doc(collection(db, 'partnerStores'));
  const newStore: PartnerStore = {
    ...storeData,
    id: ref.id,
    ownerId,
    rating: 0,
    verified: false,
    status: 'revision',
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, { ...newStore, serverTime: serverTimestamp() });
  return newStore;
}

/**
 * Records a product order. Payment and delivery are coordinated over WhatsApp,
 * so every order starts as "pendiente".
 */
export async function createOrder(
  orderData: Omit<CheckoutOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'currency' | 'productIds'>
): Promise<CheckoutOrder> {
  const ref = doc(collection(db, 'orders'));
  const orderNumber = `MG-${new Date().getFullYear()}-${ref.id.slice(0, 6).toUpperCase()}`;
  const order: CheckoutOrder = {
    ...orderData,
    productIds: Array.from(new Set(orderData.items.map((i) => i.id))),
    id: ref.id,
    orderNumber,
    currency: 'COP',
    status: 'pendiente',
    createdAt: Date.now(),
  };
  await setDoc(ref, { ...order, serverTime: serverTimestamp() });
  return order;
}
