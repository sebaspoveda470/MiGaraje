import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { VehicleListing } from '../types';

const listingsRef = collection(db, 'vehicleListings');

/**
 * Streams every published vehicle listing, newest first.
 */
export function subscribeToListings(
  onChange: (listings: VehicleListing[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    query(listingsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            ...(data as VehicleListing),
            id: d.id,
            createdAt: (data.createdAt as Timestamp | undefined)?.toMillis(),
          };
        })
      );
    },
    onError
  );
}

/**
 * Publishes a listing owned by `ownerId`. Returns the new document id.
 */
export async function publishListing(ownerId: string, listing: Omit<VehicleListing, 'id'>): Promise<string> {
  const ref = doc(listingsRef);
  await setDoc(ref, { ...listing, ownerId, createdAt: serverTimestamp() });
  return ref.id;
}

export async function setListingSold(listingId: string, sold: boolean): Promise<void> {
  await updateDoc(doc(listingsRef, listingId), {
    status: sold ? 'vendido' : 'disponible',
    soldAt: sold ? serverTimestamp() : null,
  });
}

export async function deleteListing(listingId: string): Promise<void> {
  await deleteDoc(doc(listingsRef, listingId));
}
