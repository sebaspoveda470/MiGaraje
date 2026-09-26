import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { deleteUser, User as AuthUser } from 'firebase/auth';
import { db } from '../firebase';
import { UserProfile, Vehicle } from '../types';
import { deleteListing } from './listingService';

/**
 * Loads the profile stored at users/{uid}. Returns null when the account
 * exists in Firebase Auth but hasn't completed onboarding yet.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const { updatedAt, ...data } = snap.data();
  return { ...(data as UserProfile), id: snap.id };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(
    doc(db, 'users', profile.id),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export type FavoriteKind = 'favoriteListings' | 'favoriteProducts';

export async function setFavorite(uid: string, kind: FavoriteKind, itemId: string, favorite: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    [kind]: favorite ? arrayUnion(itemId) : arrayRemove(itemId),
  });
}

/**
 * Streams the vehicles in users/{uid}/vehicles, oldest first.
 */
export function subscribeToVehicles(
  uid: string,
  onChange: (vehicles: Vehicle[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'users', uid, 'vehicles'),
    (snapshot) => {
      const vehicles = snapshot.docs.map((d) => ({ ...(d.data() as Vehicle), id: d.id }));
      vehicles.sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || ''));
      onChange(vehicles);
    },
    onError
  );
}

export async function saveVehicle(uid: string, vehicle: Vehicle): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'vehicles', vehicle.id), vehicle);
}

export async function deleteVehicle(uid: string, vehicleId: string): Promise<void> {
  const services = await getDocs(collection(db, 'users', uid, 'vehicles', vehicleId, 'services'));
  await Promise.all(services.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId));
}

/**
 * Deletes the user's data (Ley 1581: right to deletion) and then the login itself.
 * Orders are kept: they are commercial records we may be required to retain.
 * Comments on other people's posts remain.
 */
export async function deleteAccount(authUser: AuthUser): Promise<void> {
  const uid = authUser.uid;
  const byField = (path: string, field: string) => getDocs(query(collection(db, path), where(field, '==', uid)));

  const [listings, posts, reviews, memberships, vehicles] = await Promise.all([
    byField('vehicleListings', 'ownerId'),
    byField('communityPosts', 'authorId'),
    byField('productReviews', 'userId'),
    getDocs(query(collection(db, 'communities'), where('memberIds', 'array-contains', uid))),
    getDocs(collection(db, 'users', uid, 'vehicles')),
  ]);

  await Promise.all([
    ...listings.docs.map((d) => deleteListing(d.id)),
    ...posts.docs.map((d) => deleteDoc(d.ref)),
    ...reviews.docs.map((d) => deleteDoc(d.ref)),
    ...memberships.docs.map((d) => updateDoc(d.ref, { memberIds: arrayRemove(uid) })),
    ...vehicles.docs.map((d) => deleteVehicle(uid, d.id)),
  ]);
  await deleteDoc(doc(db, 'users', uid));

  // Firebase requires a recent sign-in to delete the login; the caller handles that error.
  await deleteUser(authUser);
}
