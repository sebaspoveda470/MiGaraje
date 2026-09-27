import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import {
  Auth,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Optional form fields are left as `undefined`; Firestore rejects those unless told to skip them.
const firestoreSettings = { ignoreUndefinedProperties: true };

export const db = initializeFirestore(app, firestoreSettings);

// Stay signed in on this device until the user signs out. Falls back to localStorage
// in browsers that block IndexedDB. (initializeAuth throws if it already ran, e.g. on hot reload.)
function createAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
auth.languageCode = 'es';

// Accounts allowed to manage the official product catalog and sales WhatsApp.
// Keep in sync with isAdmin() in firestore.rules.
export const ADMIN_EMAILS = ['sebaspoveda317@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export default app;
