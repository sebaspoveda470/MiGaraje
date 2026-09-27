import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Vehicle } from '../types';

export interface RegisteredUser {
  profile: UserProfile;
  vehicles: Vehicle[];
}

/**
 * Admin only (see firestore.rules): every completed profile with its garage vehicles,
 * newest sign-ups first. Accounts that never finished the welcome form have no profile
 * and are not included.
 */
export async function getRegisteredUsers(): Promise<RegisteredUser[]> {
  const [usersSnap, vehiclesSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collectionGroup(db, 'vehicles')),
  ]);

  const vehiclesByOwner = new Map<string, Vehicle[]>();
  vehiclesSnap.docs.forEach((d) => {
    const ownerId = d.ref.parent.parent?.id;
    if (!ownerId) return;
    const list = vehiclesByOwner.get(ownerId) || [];
    list.push({ ...(d.data() as Vehicle), id: d.id });
    vehiclesByOwner.set(ownerId, list);
  });

  return usersSnap.docs
    .map((d) => {
      const { updatedAt, ...data } = d.data();
      return {
        profile: { ...(data as UserProfile), id: d.id },
        vehicles: (vehiclesByOwner.get(d.id) || []).sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || '')),
      };
    })
    .sort((a, b) => (b.profile.joinedDate || '').localeCompare(a.profile.joinedDate || ''));
}
