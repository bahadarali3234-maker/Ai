import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
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

// Ensure permanent local persistence across tabs and sessions
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase persistence warning:', err);
  });
}

// Keep track of current user
let currentUser: User | null = null;

// Synchronize user profile into Firestore permanently
async function recordUserProfile(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        lastLoginAt: serverTimestamp(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    // Also save in localStorage for fast instant UI hydration
    localStorage.setItem(
      'think_creative_user',
      JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
      })
    );
  } catch (err) {
    console.warn('User profile sync warning:', err);
  }
}

export function getCurrentUser(): User | null {
  return currentUser || auth.currentUser;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user && !user.isAnonymous) {
      recordUserProfile(user);
    } else {
      localStorage.removeItem('think_creative_user');
    }
    callback(user);
  });
}

export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    currentUser = res.user;
    if (res.user) {
      await recordUserProfile(res.user);
    }
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
    if (res.user) {
      await recordUserProfile(res.user);
    }
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
    if (res.user) {
      await recordUserProfile(res.user);
    }
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
    localStorage.removeItem('think_creative_user');
    localStorage.removeItem('think_creative_guest_threads');
    localStorage.removeItem('think_creative_projects');
    localStorage.removeItem('gemini_project_memory_v2');
    localStorage.removeItem('gemini_active_project_id_v2');
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

export function ensureAuth(): Promise<User | null> {
  if (currentUser) return Promise.resolve(currentUser);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      unsubscribe();
      resolve(user);
    });
  });
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
 * Persist or update project memory in Firestore strictly under users/{uid}/projects/{projectId}
 */
export async function syncProjectMemoryToFirestore(project: any): Promise<boolean> {
  try {
    const user = await ensureAuth();
    if (!user || !project.id) return false;

    const docRef = doc(db, 'users', user.uid, 'projects', project.id);
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
 * Persist real-time chat thread strictly under users/{uid}/chats/{threadId}
 */
export async function syncChatThreadToFirestore(thread: any, explicitUserId?: string): Promise<boolean> {
  try {
    const user = explicitUserId ? { uid: explicitUserId } : await ensureAuth();
    if (!user || !user.uid || !thread?.id) return false;

    // Clean messages for Firestore storage (remove undefined or non-serializable fields)
    const sanitizedMessages = Array.isArray(thread.messages)
      ? thread.messages.map((m: any) => ({
          id: m.id || `msg-${Date.now()}`,
          sender: m.sender || 'user',
          text: m.text || '',
          timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isoTimestamp: m.isoTimestamp || new Date().toISOString(),
          promptSnippet: m.promptSnippet || null,
          promptBanner: m.promptBanner || null,
          isError: Boolean(m.isError),
        }))
      : [];

    const docRef = doc(db, 'users', user.uid, 'chats', thread.id);
    await setDoc(
      docRef,
      {
        id: thread.id,
        title: thread.title || thread.name || 'Untitled Thread',
        promptBanner: thread.promptBanner || '',
        activeTab: thread.activeTab || 'prompt',
        userId: user.uid,
        messages: sanitizedMessages,
        messagesCount: sanitizedMessages.length,
        lastUpdated: serverTimestamp(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Chat thread Firestore sync warning:', err);
    return false;
  }
}

/**
 * Subscribe to real-time chat threads directly under users/{userId}/chats
 * NEVER perform a global query.
 */
export function subscribeToUserChatThreads(
  userId: string | null | undefined,
  onUpdate: (threads: Record<string, any>) => void
): () => void {
  if (!userId) {
    onUpdate({});
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'users', userId, 'chats'),
      orderBy('lastUpdated', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const threads: Record<string, any> = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const topicKey = data.title || data.id || docSnap.id;
          const threadObj = {
            id: data.id || docSnap.id,
            title: data.title || topicKey,
            promptBanner: data.promptBanner || '',
            activeTab: data.activeTab || 'prompt',
            messages: Array.isArray(data.messages) ? data.messages : [],
          };
          threads[topicKey] = threadObj;
          if (data.id && data.id !== topicKey) {
            threads[data.id] = threadObj;
          }
        });
        onUpdate(threads);
      },
      (err) => {
        console.warn('Real-time chat threads listener notice:', err);
        // Fallback without orderBy if index is still propagating
        try {
          const fallbackQ = query(collection(db, 'users', userId, 'chats'));
          return onSnapshot(fallbackQ, (snapshot) => {
            const threads: Record<string, any> = {};
            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              const topicKey = data.title || data.id || docSnap.id;
              const threadObj = {
                id: data.id || docSnap.id,
                title: data.title || topicKey,
                promptBanner: data.promptBanner || '',
                activeTab: data.activeTab || 'prompt',
                messages: Array.isArray(data.messages) ? data.messages : [],
              };
              threads[topicKey] = threadObj;
              if (data.id && data.id !== topicKey) {
                threads[data.id] = threadObj;
              }
            });
            onUpdate(threads);
          });
        } catch {
          // ignore
        }
      }
    );
  } catch (err) {
    console.warn('Error setting up chat threads listener:', err);
    return () => {};
  }
}

/**
 * Delete a specific chat thread from Firestore under users/{uid}/chats/{threadId}
 */
export async function deleteChatThreadFromFirestore(threadId: string, explicitUserId?: string): Promise<boolean> {
  try {
    const user = explicitUserId ? { uid: explicitUserId } : await ensureAuth();
    if (!user || !user.uid) return false;
    const docRef = doc(db, 'users', user.uid, 'chats', threadId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete chat thread from Firestore:', err);
    return false;
  }
}
