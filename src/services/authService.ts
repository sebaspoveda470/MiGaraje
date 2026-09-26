import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reauthenticateWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(fullName: string, email: string, password: string): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (fullName.trim()) {
    await updateProfile(cred.user, { displayName: fullName.trim() });
  }
  // Non-blocking: the account works right away, verification only confirms the address.
  sendEmailVerification(cred.user).catch((err) => console.warn('No se pudo enviar el correo de verificación', err));
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Maps Firebase Auth error codes to messages a user can act on.
 */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/missing-password':
      return 'Ingresa tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Se cerró la ventana de Google antes de terminar.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.';
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase. Agrégalo en Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Este método de inicio de sesión no está habilitado en Firebase.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
    default:
      return 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
}

/**
 * Sensitive operations (like deleting the account) need a sign-in from the last few minutes.
 * Google accounts confirm with a popup; email accounts must sign in again.
 * Returns false when the user has to sign out and back in first.
 */
export async function ensureRecentLogin(user: User): Promise<boolean> {
  const lastSignIn = new Date(user.metadata.lastSignInTime || 0).getTime();
  if (Date.now() - lastSignIn < 4 * 60 * 1000) return true;
  if (user.providerData.some((p) => p.providerId === 'google.com')) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    return true;
  }
  return false;
}
