import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured custom database ID
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Authentication
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Keep track of current user and auto-sign in anonymously if not signed in
let currentUser: User | null = null;
let authReadyPromise: Promise<User | null> | null = null;

export function getCurrentUser(): User | null {
  return currentUser || auth.currentUser;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    currentUser = res.user;
    return { success: true, user: res.user };
  } catch (err: any) {
    console.warn('Google sign in error:', err);
    return { success: false, error: err?.message || 'Failed to sign in with Google' };
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    currentUser = res.user;
    return { success: true, user: res.user };
  } catch (err: any) {
    console.warn('Email sign in error:', err);
    return { success: false, error: err?.message || 'Invalid credentials' };
  }
}

export async function signUpWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    currentUser = res.user;
    return { success: true, user: res.user };
  } catch (err: any) {
    console.warn('Email sign up error:', err);
    return { success: false, error: err?.message || 'Could not create account' };
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
    currentUser = null;
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

export function ensureAuth(): Promise<User | null> {
  if (currentUser) return Promise.resolve(currentUser);
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          currentUser = cred.user;
          unsubscribe();
          resolve(cred.user);
        } catch (err) {
          console.warn('Firebase anonymous auth warning:', err);
          unsubscribe();
          resolve(null);
        }
      }
    });
  });

  return authReadyPromise;
}

// Automatically initiate anonymous auth on load
if (typeof window !== 'undefined') {
  ensureAuth().catch(() => {});
}

/**
 * Persist client booking request to Firestore
 */
export async function saveBookingToFirestore(data: {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  selectedDate: string;
  selectedSlot: string;
}): Promise<string | null> {
  try {
    await ensureAuth();
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...data,
      userId: currentUser?.uid || 'anonymous',
      createdAt: serverTimestamp(),
      isoTimestamp: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to save booking to Firestore:', err);
    return null;
  }
}

/**
 * Persist or update project memory in Firestore
 */
export async function syncProjectMemoryToFirestore(project: any): Promise<boolean> {
  try {
    const user = await ensureAuth();
    if (!user || !project.id) return false;

    const docRef = doc(db, 'projectMemories', project.id);
    await setDoc(
      docRef,
      {
        ...project,
        userId: user.uid,
        lastSyncedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Project memory Firestore sync warning:', err);
    return false;
  }
}

/**
 * Persist chat thread to Firestore
 */
export async function syncChatThreadToFirestore(thread: any): Promise<boolean> {
  try {
    const user = await ensureAuth();
    if (!user || !thread.id) return false;

    const docRef = doc(db, 'chatThreads', thread.id);
    await setDoc(
      docRef,
      {
        id: thread.id,
        title: thread.title || thread.name || 'Untitled Thread',
        promptBanner: thread.promptBanner || '',
        activeTab: thread.activeTab || 'prompt',
        userId: user.uid,
        messagesCount: thread.messages?.length || 0,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Chat thread Firestore sync warning:', err);
    return false;
  }
}
