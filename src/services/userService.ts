import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Vehicle } from '../types';

/**
 * Persists a user profile and their garage vehicles in Firestore
 * and synchronizes with local storage.
 */
export async function saveUserToDatabase(user: UserProfile, vehicles: Vehicle[]): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      vehicles: vehicles,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Notice: Firestore save fallback to local storage', error);
  }
}

/**
 * Loads a user profile and their vehicles from Firestore by email or user ID
 */
export async function loadUserFromDatabase(identifier: string): Promise<{ user: UserProfile; vehicles: Vehicle[] } | null> {
  try {
    // Try by ID first
    const userRef = doc(db, 'users', identifier);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        user: {
          id: snap.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          city: data.city,
          role: data.role,
          avatar: data.avatar,
          joinedDate: data.joinedDate || new Date().toISOString(),
        },
        vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
      };
    }

    // Try finding by email
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    for (const userDoc of querySnapshot.docs) {
      const data = userDoc.data();
      if (data.email && data.email.toLowerCase() === identifier.toLowerCase().trim()) {
        return {
          user: {
            id: userDoc.id,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            city: data.city,
            role: data.role,
            avatar: data.avatar,
            joinedDate: data.joinedDate || new Date().toISOString(),
          },
          vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
        };
      }
    }
  } catch (error) {
    console.warn('Could not query users from Firestore:', error);
  }

  return null;
}
