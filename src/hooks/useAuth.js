import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle as fbSignIn,
  signOut as fbSignOut,
} from '../firebase/auth';

/**
 * Provides auth state and sign-in / sign-out helpers.
 *
 * user:    Firebase User object | null
 * loading: true while the initial auth state is being resolved
 */
export function useAuth() {
  // undefined = still loading, null = definitely not signed in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await fbSignIn();
    // onAuthStateChanged will fire and update `user` automatically
  };

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return {
    user,
    loading: user === undefined,
    signInWithGoogle,
    signOut,
  };
}
