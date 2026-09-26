import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
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

/**
 * Streams every order, newest first. Admin only (enforced by firestore.rules).
 */
export function subscribeToAllOrders(
  onChange: (orders: CheckoutOrder[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ ...(d.data() as CheckoutOrder), id: d.id }))),
    onError
  );
}

export async function updateOrderStatus(orderId: string, status: CheckoutOrder['status']): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status, statusUpdatedAt: serverTimestamp() });
}
