import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with offline persistence cache
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  // Fallback if already initialized or unsupported in environment
  db = getFirestore(app);
}

// Initialize Auth
export const auth = getAuth(app);
export { db };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth Helper Functions
export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.info('Sign in popup was closed by user.');
      return null;
    }
    console.warn('Google Popup login failed, trying redirect...', error);
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        console.error('Redirect sign in error:', redirectErr);
        return null;
      }
    }
    return null;
  }
};

export const loginAsDemo = async (): Promise<User | null> => {
  // Anonymous authentication is restricted by default in Firebase project settings.
  // Returning null allows the app to cleanly run in offline/local guest mode without throwing admin errors.
  return null;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const updateUserProfileName = async (newDisplayName: string): Promise<void> => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: newDisplayName });
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
