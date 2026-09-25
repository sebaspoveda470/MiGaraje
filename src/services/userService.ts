import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Vehicle } from '../types';

/**
 * Loads the profile stored at users/{uid}. Returns null when the account
 * exists in Firebase Auth but hasn't completed onboarding yet.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    role: data.role,
    avatar: data.avatar,
    joinedDate: data.joinedDate,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(
    doc(db, 'users', profile.id),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
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
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId));
}
