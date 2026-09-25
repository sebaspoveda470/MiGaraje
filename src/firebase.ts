import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Optional form fields are left as `undefined`; Firestore rejects those unless told to skip them.
const firestoreSettings = { ignoreUndefinedProperties: true };

// Explicitly pass custom databaseId if configured in the applet config
export const db = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, firestoreSettings);

export const auth = getAuth(app);
auth.languageCode = 'es';

// Accounts allowed to manage the official product catalog and sales WhatsApp.
// Keep in sync with isAdmin() in firestore.rules.
export const ADMIN_EMAILS = ['sebaspoveda317@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export default app;
