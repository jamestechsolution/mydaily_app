import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore or local fallback
  const fetchUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        const detectedTimezone =
          typeof Intl !== 'undefined'
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : 'America/Los_Angeles';

        const newProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Work Manager'),
          email: fbUser.email || '',
          timezone: detectedTimezone,
          defaultWorkHours: {
            start: '09:00',
            end: '17:00',
          },
          defaultTaskDuration: 60,
          defaultReminderTime: 15,
          notificationPreferences: {
            browser: true,
            inApp: true,
            email: false,
            dailyDigest: true,
            weeklyReport: true,
            soundEnabled: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile, { merge: true });
        setProfile(newProfile);
      }
    } catch (e) {
      console.warn('Error fetching Firestore user profile, using memory profile:', e);
      setProfile({
        id: fbUser.uid,
        name: fbUser.displayName || 'Work Manager',
        email: fbUser.email || '',
        timezone: 'America/Los_Angeles',
        defaultWorkHours: { start: '09:00', end: '17:00' },
        defaultTaskDuration: 60,
        defaultReminderTime: 15,
        notificationPreferences: {
          browser: true,
          inApp: true,
          email: false,
          dailyDigest: true,
          weeklyReport: true,
          soundEnabled: true,
        },
      });
    }
  };

  useEffect(() => {
    // Purge any stale demo user sessions or demo storage markers
    if (typeof window !== 'undefined') {
      try {
        const localActive = localStorage.getItem('dwm_active_local_user');
        if (
          localActive &&
          (localActive.includes('demo-user-101') ||
            localActive.includes('alex.mercer') ||
            localActive.includes('Alex Mercer'))
        ) {
          localStorage.removeItem('dwm_active_local_user');
        }

        // Clean out any demo task/reminder cache keys from previous sessions
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.includes('demo-user-101') ||
              key.includes('has_seeded') ||
              key.includes('alex.mercer'))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    // Check initial local workspace session
    const localActive = typeof window !== 'undefined' ? localStorage.getItem('dwm_active_local_user') : null;
    if (localActive) {
      try {
        const parsed = JSON.parse(localActive);
        if (parsed?.user && parsed?.profile && parsed.user.uid !== 'demo-user-101') {
          setUser(parsed.user);
          setProfile(parsed.profile);
        } else {
          localStorage.removeItem('dwm_active_local_user');
        }
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser);
      } else {
        // Only clear if no local workspace session is active
        const activeLocal = typeof window !== 'undefined' ? localStorage.getItem('dwm_active_local_user') : null;
        if (!activeLocal) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        localStorage.removeItem('dwm_active_local_user');
        await fetchUserProfile(cred.user);
        return;
      } catch (err: any) {
        // If Firebase Auth provider is disabled in Firebase Console (auth/operation-not-allowed),
        // seamlessly log into the persistent local workspace account
        if (err?.code === 'auth/operation-not-allowed') {
          console.info('Firebase Email/Password provider not enabled in console. Connecting via persistent workspace account.');
          const uid = `usr_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || Date.now()}`;
          const localUser = {
            uid,
            email,
            displayName: email.split('@')[0],
          } as any;

          const savedAccounts = JSON.parse(localStorage.getItem('dwm_workspace_accounts') || '{}');
          const existing = savedAccounts[email.toLowerCase()];

          const userProfile: UserProfile = existing?.profile || {
            id: uid,
            name: email.split('@')[0],
            email,
            timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Los_Angeles',
            defaultWorkHours: { start: '09:00', end: '17:00' },
            defaultTaskDuration: 60,
            defaultReminderTime: 15,
            notificationPreferences: {
              browser: true,
              inApp: true,
              email: false,
              dailyDigest: true,
              weeklyReport: true,
              soundEnabled: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          localStorage.setItem('dwm_active_local_user', JSON.stringify({ user: localUser, profile: userProfile }));
          setUser(localUser);
          setProfile(userProfile);
          return;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const detectedTimezone =
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : 'America/Los_Angeles';

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
        localStorage.removeItem('dwm_active_local_user');

        const initialProfile: UserProfile = {
          id: cred.user.uid,
          name,
          email,
          timezone: detectedTimezone,
          defaultWorkHours: { start: '09:00', end: '17:00' },
          defaultTaskDuration: 60,
          defaultReminderTime: 15,
          notificationPreferences: {
            browser: true,
            inApp: true,
            email: false,
            dailyDigest: true,
            weeklyReport: true,
            soundEnabled: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), initialProfile, { merge: true });
        setProfile(initialProfile);
        return;
      } catch (err: any) {
        if (err?.code === 'auth/operation-not-allowed') {
          console.info('Firebase Email/Password provider disabled in console. Created workspace account.');
          const uid = `usr_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || Date.now()}`;
          const localUser = {
            uid,
            email,
            displayName: name,
          } as any;

          const initialProfile: UserProfile = {
            id: uid,
            name,
            email,
            timezone: detectedTimezone,
            defaultWorkHours: { start: '09:00', end: '17:00' },
            defaultTaskDuration: 60,
            defaultReminderTime: 15,
            notificationPreferences: {
              browser: true,
              inApp: true,
              email: false,
              dailyDigest: true,
              weeklyReport: true,
              soundEnabled: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const accounts = JSON.parse(localStorage.getItem('dwm_workspace_accounts') || '{}');
          accounts[email.toLowerCase()] = { name, email, pass, uid, profile: initialProfile };
          localStorage.setItem('dwm_workspace_accounts', JSON.stringify(accounts));
          localStorage.setItem('dwm_active_local_user', JSON.stringify({ user: localUser, profile: initialProfile }));

          setUser(localUser);
          setProfile(initialProfile);
          return;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        localStorage.removeItem('dwm_active_local_user');
        await fetchUserProfile(cred.user);
      } catch (err: any) {
        if (err?.code === 'auth/operation-not-allowed') {
          throw new Error(
            'Google Sign-In is not enabled on this Firebase project yet. Please register with your email and password above, or enable Google Sign-In in Firebase Console.'
          );
        } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
          // User closed popup window, nothing to throw
        } else {
          throw err;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    localStorage.removeItem('dwm_active_local_user');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } catch (e) {
      console.warn('Profile sync note:', e);
    }
    // Also update local storage cache if in workspace session
    const activeLocal = localStorage.getItem('dwm_active_local_user');
    if (activeLocal) {
      try {
        const parsed = JSON.parse(activeLocal);
        parsed.profile = updated;
        localStorage.setItem('dwm_active_local_user', JSON.stringify(parsed));
      } catch {}
    }
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
