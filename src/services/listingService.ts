import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { VehicleListing } from '../types';

const listingsRef = collection(db, 'vehicleListings');

// Each Firestore document holds at most 1 MB, so the listing keeps only its cover photo
// and every extra photo lives in its own document under vehicleListings/{id}/photos.
const photosRef = (listingId: string) => collection(db, 'vehicleListings', listingId, 'photos');

/** Thrown when the listing was published but its extra photos could not be saved */
export class ExtraPhotosError extends Error {}

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
 * Publishes a listing owned by `ownerId`. The first photo is the cover (stored in the listing);
 * the rest are stored one per document. Returns the new listing id.
 */
export async function publishListing(ownerId: string, listing: Omit<VehicleListing, 'id'>, photos: string[]): Promise<string> {
  const ref = doc(listingsRef);
  const [cover, ...extra] = photos;
  await setDoc(ref, {
    ...listing,
    images: cover ? [cover] : listing.images,
    photoCount: Math.max(1, photos.length),
    ownerId,
    createdAt: serverTimestamp(),
  });

  if (extra.length > 0) {
    // The listing must exist first: the rules check its owner before accepting photos.
    const batch = writeBatch(db);
    extra.forEach((url, i) => {
      batch.set(doc(photosRef(ref.id), String(i + 1).padStart(2, '0')), { url, index: i + 1, createdAt: serverTimestamp() });
    });
    try {
      await batch.commit();
    } catch (err) {
      console.error('No se pudieron guardar las fotos adicionales', err);
      await updateDoc(ref, { photoCount: 1 }).catch(() => undefined);
      throw new ExtraPhotosError('Anuncio publicado sin fotos adicionales');
    }
  }
  return ref.id;
}

/**
 * All photos of a listing, cover first. Older listings keep every photo in `images`.
 */
export async function getListingPhotos(listing: VehicleListing): Promise<string[]> {
  if (!listing.photoCount || listing.photoCount <= listing.images.length) return listing.images;
  const snapshot = await getDocs(query(photosRef(listing.id), orderBy('index', 'asc')));
  return [...listing.images, ...snapshot.docs.map((d) => d.data().url as string)];
}

export async function setListingSold(listingId: string, sold: boolean): Promise<void> {
  await updateDoc(doc(listingsRef, listingId), {
    status: sold ? 'vendido' : 'disponible',
    soldAt: sold ? serverTimestamp() : null,
  });
}

/**
 * Deletes the listing together with its extra photos.
 */
export async function deleteListing(listingId: string): Promise<void> {
  const photos = await getDocs(photosRef(listingId));
  const batch = writeBatch(db);
  photos.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(listingsRef, listingId));
  await batch.commit();
}
