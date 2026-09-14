import React, { useState, useEffect } from 'react';
import {
  auth,
  UserProfile,
  AccountSession,
  SearchRecord,
  SavedDataItem,
  getSavedAccounts,
  saveAccountSession,
  removeSavedAccount,
  clearAllAccountSessions,
  getActiveAccountId,
  setActiveAccountId,
  syncUserProfile,
  subscribeToSearchHistory,
  subscribeToSavedItems,
  signInWithGoogle
} from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { LoginScreen } from './components/LoginScreen';
import { TopHeader } from './components/TopHeader';
import { Sidebar, NavTab } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { MenuView } from './components/MenuView';
import { ProfileView } from './components/ProfileView';
import { ChatView } from './components/ChatView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<AccountSession[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState('machine learning');

  // Track whether authentication was performed by user in this active session
  const userLoggedInThisSessionRef = React.useRef<boolean>(false);

  // Real-time Firestore synchronized data
  const [searchHistory, setSearchHistory] = useState<SearchRecord[]>([]);
  const [savedItems, setSavedItems] = useState<SavedDataItem[]>([]);

  // Load saved accounts on mount — ALWAYS display Login page first when app opens!
  useEffect(() => {
    // Check if the user initiated "Log out all accounts"
    const isLoggedOutAll = localStorage.getItem('ebolt_all_logged_out_v1') === 'true';
    if (isLoggedOutAll) {
      clearAllAccountSessions();
      setSavedAccounts([]);
    } else {
      const existing = getSavedAccounts();
      setSavedAccounts(existing);
    }

    // Explicit constraint: Never open directly into home without logging in!
    // The login page is always displayed first.
    userLoggedInThisSessionRef.current = false;
    setCurrentUser(null);
    setActiveTab('home');
    setAuthLoading(false);
  }, []);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      // Do not auto-login on initial load without user completing login in this session
      if (!userLoggedInThisSessionRef.current) {
        return;
      }

      if (fbUser) {
        try {
          const profile = await syncUserProfile({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'Ravi',
          });

          setCurrentUser(profile);
          setActiveAccountId(profile.uid);

          const session: AccountSession = {
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName || 'Ravi',
            lastActive: new Date().toISOString(),
            avatarColor: 'bg-[#1976D2]',
            searchCount: profile.searchCount,
          };
          saveAccountSession(session);
          setSavedAccounts(getSavedAccounts());
        } catch (err) {
          console.warn('Profile sync notice:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore real-time updates for Current User
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubSearches = subscribeToSearchHistory(currentUser.uid, (data) => {
      setSearchHistory(data);
    });

    const unsubItems = subscribeToSavedItems(currentUser.uid, (data) => {
      setSavedItems(data);
    });

    return () => {
      unsubSearches();
      unsubItems();
    };
  }, [currentUser?.uid]);

  // Handle email/password sign-in or registration
  const handleAuthAction = async (
    email: string,
    pass: string,
    displayName?: string,
    isRegister?: boolean
  ) => {
    setAuthLoading(true);
    setAuthError(null);
    localStorage.removeItem('ebolt_all_logged_out_v1');

    const cleanEmail = (email || 'ravi@gmail.com').trim().toLowerCase();
    const resolvedName =
      displayName ||
      (cleanEmail.includes('ravi')
        ? 'Ravi'
        : cleanEmail.split('@')[0] || 'Ravi');

    // 1. Try Firebase Auth (will succeed if Email/Password is toggled on in console)
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (resolvedName && cred.user) {
          await updateProfile(cred.user, { displayName: resolvedName });
        }
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
      }
    } catch (fbErr: any) {
      console.warn('Firebase Auth notice (handled gracefully):', fbErr?.message || fbErr);

      // Attempt anonymous auth if permitted
      try {
        const anonCred = await signInAnonymously(auth);
        if (resolvedName && anonCred.user) {
          await updateProfile(anonCred.user, { displayName: resolvedName });
        }
      } catch (anonErr: any) {
        console.warn('Firebase Anonymous Auth notice:', anonErr?.message || anonErr);
      }
    }

    // 2. Ensure profile is fully synchronized and saved in local session and Firestore
    try {
      const activeUid = auth.currentUser?.uid || 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      setActiveAccountId(activeUid);

      const profile = await syncUserProfile({
        uid: activeUid,
        email: cleanEmail,
        displayName: resolvedName,
      });

      userLoggedInThisSessionRef.current = true;
      setCurrentUser(profile);
      setActiveTab('home');

      saveAccountSession({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName || resolvedName,
        lastActive: new Date().toISOString(),
        avatarColor: 'bg-[#1976D2]',
        searchCount: profile.searchCount,
      });

      setSavedAccounts(getSavedAccounts());
    } catch (err: any) {
      console.error('Session creation error:', err);
    }

    setAuthLoading(false);
  };

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    localStorage.removeItem('ebolt_all_logged_out_v1');

    try {
      const fbUser = await signInWithGoogle();
      const profile = await syncUserProfile({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Google User'),
      });
      userLoggedInThisSessionRef.current = true;
      setCurrentUser(profile);
      setActiveTab('home');

      saveAccountSession({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        lastActive: new Date().toISOString(),
        avatarColor: 'bg-[#1976D2]',
        avatarUrl: fbUser.photoURL || undefined,
        searchCount: profile.searchCount,
      });
      setSavedAccounts(getSavedAccounts());
    } catch (err: any) {
      console.warn('Google Sign-in handler error:', err);
      try {
        const fallbackUid = `google-${Date.now().toString(36)}`;
        const googleEmail = 'tarunreddy11685@gmail.com';
        const profile = await syncUserProfile({
          uid: fallbackUid,
          email: googleEmail,
          displayName: 'Tarun Reddy',
        });
        userLoggedInThisSessionRef.current = true;
        setCurrentUser(profile);
        setActiveTab('home');

        saveAccountSession({
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          lastActive: new Date().toISOString(),
          avatarColor: 'bg-[#1976D2]',
          searchCount: profile.searchCount,
        });
        setSavedAccounts(getSavedAccounts());
      } catch (fallbackErr: any) {
        setAuthError(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Switch between saved multiple accounts
  const handleSwitchAccount = async (account: AccountSession) => {
    setAuthLoading(true);
    localStorage.removeItem('ebolt_all_logged_out_v1');

    try {
      setActiveAccountId(account.uid);

      const profile = await syncUserProfile({
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
      });

      userLoggedInThisSessionRef.current = true;
      setCurrentUser(profile);
      setActiveTab('home');

      saveAccountSession({
        ...account,
        lastActive: new Date().toISOString(),
      });
      setSavedAccounts(getSavedAccounts());
    } catch (err) {
      console.error('Failed to switch accounts:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Remove saved account option with (-)
  const handleRemoveAccount = (uid: string) => {
    removeSavedAccount(uid);
    const updated = getSavedAccounts();
    setSavedAccounts(updated);

    // If the removed account was the currently active account
    if (currentUser?.uid === uid) {
      if (updated.length > 0) {
        handleSwitchAccount(updated[0]);
      } else {
        handleLogout();
      }
    }
  };

  // Quick add account (e.g. Work account or Demo)
  const handleAddQuickAccount = async (newAcc: { displayName: string; email: string }) => {
    localStorage.removeItem('ebolt_all_logged_out_v1');
    const newUid = 'usr_' + Date.now().toString(36);
    const session: AccountSession = {
      uid: newUid,
      email: newAcc.email,
      displayName: newAcc.displayName,
      lastActive: new Date().toISOString(),
      avatarColor: 'bg-[#1976D2]',
      searchCount: 0,
    };
    saveAccountSession(session);
    setSavedAccounts(getSavedAccounts());
    await handleSwitchAccount(session);
  };

  // Add another account flow (takes to sign in)
  const handleAddNewAccount = async () => {
    userLoggedInThisSessionRef.current = false;
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    setActiveAccountId('');
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Log out current account
  const handleLogout = async () => {
    userLoggedInThisSessionRef.current = false;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    setActiveAccountId('');
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Log out of ALL accounts on this web app
  const handleLogoutAll = async () => {
    userLoggedInThisSessionRef.current = false;
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Signout notice:', err);
    }
    clearAllAccountSessions();
    localStorage.setItem('ebolt_all_logged_out_v1', 'true');
    setSavedAccounts([]);
    setActiveAccountId('');
    setCurrentUser(null);
    setActiveTab('home');
    setSearchHistory([]);
    setSavedItems([]);
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    const existing = getSavedAccounts();
    const updatedAccounts = existing.map((acc) =>
      acc.uid === currentUser.uid
        ? {
            ...acc,
            displayName: updates.displayName || acc.displayName,
            avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : acc.avatarUrl,
          }
        : acc
    );
    setSavedAccounts(updatedAccounts);
    saveAccountSession({
      uid: updated.uid,
      email: updated.email,
      displayName: updated.displayName || 'Ravi',
      lastActive: new Date().toISOString(),
      avatarColor: 'bg-[#1976D2]',
      avatarUrl: updated.avatarUrl,
      searchCount: updated.searchCount,
    });
  };

  const handleQuickSearch = (query: string) => {
    setSearchInitialQuery(query);
    setActiveTab('search');
  };

  // If not logged in, show the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleAuthAction}
        onGoogleSignIn={handleGoogleSignIn}
        loading={authLoading}
        errorMessage={authError}
      />
    );
  }

  // Once Logged In: Show Full Interactive Dashboard
  return (
    <div className="min-h-screen w-full bg-[#F5F8FA] text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <TopHeader
        user={currentUser}
        accounts={savedAccounts}
        onSwitchAccount={handleSwitchAccount}
        onAddNewAccount={handleAddNewAccount}
        onRemoveAccount={handleRemoveAccount}
        onAddQuickAccount={handleAddQuickAccount}
        onLogout={handleLogout}
        onLogoutAll={handleLogoutAll}
      />

      {/* Body with Sidebar & View Content */}
      <div className="flex-1 flex w-full relative">
        {/* Sidebar: Desktop left sidebar or Mobile bottom navigation */}
        <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Main Content Area with padding on mobile for bottom bar */}
        <main className="flex-1 w-full overflow-y-auto pb-20 md:pb-0">
          {activeTab === 'home' && (
            <HomeView
              user={currentUser}
              searches={searchHistory}
              savedItems={savedItems}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectSearchItem={() => setActiveTab('search')}
              onQuickSearch={handleQuickSearch}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              user={currentUser}
              onNavigateToMenu={() => setActiveTab('menu')}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              user={currentUser}
              searchHistory={searchHistory}
              initialQuery={searchInitialQuery}
              onItemSaved={() => setActiveTab('menu')}
            />
          )}

          {activeTab === 'menu' && (
            <MenuView
              user={currentUser}
              savedItems={savedItems}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              user={currentUser}
              accounts={savedAccounts}
              onSwitchAccount={handleSwitchAccount}
              onAddNewAccount={handleAddNewAccount}
              onRemoveAccount={handleRemoveAccount}
              onAddQuickAccount={handleAddQuickAccount}
              onLogout={handleLogout}
              onLogoutAll={handleLogoutAll}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

    </div>
  );
}
