import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';

// Firebase configuration from provisioned environment
export const firebaseConfig = {
  projectId: "witty-fabric-1224x",
  appId: "1:857197276882:web:64c82f286401e6ad42070b",
  apiKey: "AIzaSyAbQRxrxKcACvHbHwOfMPh_zFmicUpAOCc",
  authDomain: "witty-fabric-1224x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-7537b35c-baa7-44a0-8e16-e15e51e95656",
  storageBucket: "witty-fabric-1224x.firebasestorage.app",
  messagingSenderId: "857197276882",
  measurementId: "",
  oAuthClientId: "857197276882-opfro4p4398qh5b8g8kfvk3calrihrl0.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
  createdAt: string;
  lastLoginAt: string;
  searchCount: number;
  savedItemCount: number;
}

export interface SearchRecord {
  id?: string;
  query: string;
  title: string;
  summary: string;
  insights: string[];
  recommendedTags: string[];
  metrics: { category: string; score: number }[];
  category: string;
  timestamp: string;
  createdAt?: unknown;
}

export interface SavedDataItem {
  id?: string;
  title: string;
  content: string;
  category: 'document' | 'note' | 'search_insight' | 'task' | 'bookmark' | 'image' | 'file';
  tags: string[];
  pinned?: boolean;
  fileData?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSession {
  uid: string;
  email: string;
  displayName: string;
  lastActive: string;
  avatarColor: string;
  avatarUrl?: string;
  searchCount: number;
}

const SAVED_ACCOUNTS_STORAGE_KEY = 'ebolt_saved_accounts_v2';
const ACTIVE_ACCOUNT_STORAGE_KEY = 'ebolt_active_account_v2';

export function getSavedAccounts(): AccountSession[] {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAccountSession(account: AccountSession) {
  try {
    const existing = getSavedAccounts();
    const filtered = existing.filter(a => a.uid !== account.uid && a.email.toLowerCase() !== account.email.toLowerCase());
    const updated = [account, ...filtered].slice(0, 10);
    localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, account.uid);
  } catch (err) {
    console.warn('Could not persist account session', err);
  }
}

export function removeSavedAccount(uid: string) {
  try {
    const existing = getSavedAccounts();
    const updated = existing.filter(a => a.uid !== uid);
    localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not remove account', err);
  }
}

export function clearAllAccountSessions() {
  try {
    localStorage.removeItem(SAVED_ACCOUNTS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear all account sessions', err);
  }
}

export function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
}

export function setActiveAccountId(uid: string) {
  localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, uid);
}

// User Profile Firestore Sync
export async function syncUserProfile(user: { uid: string; email?: string | null; displayName?: string | null }): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedProfile: UserProfile = {
        uid: user.uid,
        email: user.email || data.email || 'user@ebolt.app',
        displayName: user.displayName || data.displayName || (user.email ? user.email.split('@')[0] : 'Ebolt Explorer'),
        avatarUrl: data.avatarUrl || '',
        role: data.role || 'Member',
        bio: data.bio || 'Productivity explorer on Ebolt Cloud',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        searchCount: data.searchCount || 0,
        savedItemCount: data.savedItemCount || 0,
      };
      await setDoc(userDocRef, { lastLoginAt: updatedProfile.lastLoginAt }, { merge: true });
      return updatedProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || 'user@ebolt.app',
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User ' + user.uid.slice(0, 4)),
        avatarUrl: '',
        role: 'Pro Member',
        bio: 'Synchronizing real-time information with Ebolt',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        searchCount: 0,
        savedItemCount: 0,
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn('Falling back for user profile:', err);
    return {
      uid: user.uid,
      email: user.email || 'user@ebolt.app',
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Ebolt Member'),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      searchCount: 0,
      savedItemCount: 0,
    };
  }
}

// Save search query & AI breakdown to Firestore
export async function recordSearchToFirestore(userId: string, record: Omit<SearchRecord, 'id' | 'timestamp'>) {
  try {
    const colRef = collection(db, 'users', userId, 'searches');
    const docData = {
      ...record,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };
    const res = await addDoc(colRef, docData);

    // Increment user search count
    try {
      const userDocRef = doc(db, 'users', userId);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const curCount = snap.data().searchCount || 0;
        await updateDoc(userDocRef, { searchCount: curCount + 1 });
      }
    } catch {
      // Non-blocking counter update
    }

    return res.id;
  } catch (err) {
    console.error('Failed to save search to Firestore:', err);
    return null;
  }
}

// Subscribe to search history in real-time
export function subscribeToSearchHistory(userId: string, callback: (searches: SearchRecord[]) => void) {
  try {
    const colRef = collection(db, 'users', userId, 'searches');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(30));

    return onSnapshot(q, (snapshot) => {
      const items: SearchRecord[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          query: data.query || '',
          title: data.title || data.query || '',
          summary: data.summary || '',
          insights: data.insights || [],
          recommendedTags: data.recommendedTags || [],
          metrics: data.metrics || [],
          category: data.category || 'General',
          timestamp: data.timestamp || new Date().toISOString(),
        });
      });
      callback(items);
    }, (error) => {
      console.warn('Snapshot listener error for searches:', error);
    });
  } catch (err) {
    console.error('Error attaching search history listener:', err);
    return () => {};
  }
}

// Subscribe to saved documents & items in real-time
export function subscribeToSavedItems(userId: string, callback: (items: SavedDataItem[]) => void) {
  try {
    const colRef = collection(db, 'users', userId, 'savedItems');
    const q = query(colRef, orderBy('updatedAt', 'desc'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const list: SavedDataItem[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Untitled Document',
          content: d.content || '',
          category: d.category || 'note',
          tags: d.tags || [],
          pinned: d.pinned || false,
          fileData: d.fileData || undefined,
          fileName: d.fileName || undefined,
          fileSize: d.fileSize || undefined,
          fileType: d.fileType || undefined,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        });
      });
      callback(list);
    }, (error) => {
      console.warn('Saved items listener error:', error);
    });
  } catch (err) {
    console.error('Error attaching saved items listener:', err);
    return () => {};
  }
}

// Update User Profile in Firestore & Local Session
export async function updateUserProfileInFirestore(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    
    // Also update saved account session if present
    const existing = getSavedAccounts();
    const updated = existing.map(acc => {
      if (acc.uid === userId) {
        return {
          ...acc,
          displayName: updates.displayName || acc.displayName,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : acc.avatarUrl,
        };
      }
      return acc;
    });
    localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not update profile in firestore:', err);
  }
}

// Add a saved data item / note
export async function addSavedItemToFirestore(userId: string, item: Omit<SavedDataItem, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const colRef = collection(db, 'users', userId, 'savedItems');
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
      serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to add saved item:', err);
    throw err;
  }
}

// Delete saved item
export async function deleteSavedItemFromFirestore(userId: string, itemId: string) {
  try {
    const docRef = doc(db, 'users', userId, 'savedItems', itemId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete item:', err);
    throw err;
  }
}

// Delete search history item
export async function deleteSearchFromFirestore(userId: string, searchId: string) {
  try {
    const docRef = doc(db, 'users', userId, 'searches', searchId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete search:', err);
    throw err;
  }
}

// Clear all search history for user
export async function clearAllSearchesFromFirestore(userId: string) {
  try {
    const colRef = collection(db, 'users', userId, 'searches');
    const snap = await getDocs(colRef);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
}

// Chat message interface and Firestore persistence
export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export function subscribeToChatMessages(userId: string, callback: (messages: ChatMessage[]) => void) {
  const colRef = collection(db, 'users', userId, 'chatMessages');
  const q = query(colRef, orderBy('timestamp', 'asc'), limit(60));
  return onSnapshot(q, (snapshot) => {
    const items: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(items);
  }, (err) => {
    console.warn('Chat messages sync notice:', err);
  });
}

export async function addChatMessageToFirestore(userId: string, message: Omit<ChatMessage, 'id'>) {
  try {
    const colRef = collection(db, 'users', userId, 'chatMessages');
    const docRef = await addDoc(colRef, {
      ...message,
      serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Could not persist chat message to Firestore:', err);
  }
}

export async function clearChatMessagesFromFirestore(userId: string) {
  try {
    const colRef = collection(db, 'users', userId, 'chatMessages');
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  } catch (err) {
    console.warn('Could not clear chat messages:', err);
  }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

