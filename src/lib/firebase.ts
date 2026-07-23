import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
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
  const customDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
    ? firebaseConfig.firestoreDatabaseId 
    : undefined;

  if (customDbId) {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, customDbId);
  } else {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
} catch {
  // Fallback if already initialized or unsupported in environment
  db = getFirestore(app);
}

// Initialize Auth
export const auth = getAuth(app);
export { db };

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();

// Auth Helper Functions
export const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const registerWithEmail = async (email: string, pass: string, displayName?: string): Promise<User | null> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user && displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
};

export const loginWithGithub = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.info('Sign in popup was closed by user.');
      return null;
    }
    if (error?.code === 'auth/operation-not-allowed') {
      throw error;
    }
    console.warn('GitHub Popup login failed, trying redirect...', error);
    try {
      await signInWithRedirect(auth, githubProvider);
      return null;
    } catch (redirectErr: any) {
      console.error('GitHub Redirect sign in error:', redirectErr);
      throw redirectErr;
    }
  }
};

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.info('Sign in popup was closed by user.');
      return null;
    }
    if (error?.code === 'auth/operation-not-allowed') {
      throw error;
    }
    console.warn('Google Popup login failed, trying redirect...', error);
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.error('Redirect sign in error:', redirectErr);
        throw redirectErr;
      }
    }
    throw error;
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
