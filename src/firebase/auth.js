/**
 * Firebase Auth — dummy module
 *
 * All functions are stubs that log to the console.
 * When CONFIGURED = true in config.js, replace the bodies with
 * real Firebase SDK calls (see TODO comments).
 *
 * Firestore data structure:
 *   users/{uid}                 ← user doc (denormalised stats)
 *   users/{uid}/games/{autoId}  ← one doc per game result
 */

import { CONFIGURED } from './config';

/**
 * Subscribe to auth state changes.
 * @param {(user: object|null) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onAuthStateChanged(callback) {
  if (!CONFIGURED) {
    // Always report "not signed in" until Firebase is wired up
    callback(null);
    return () => {};
  }

  // TODO: real implementation
  // import { getAuth, onAuthStateChanged as fbOnAuth } from 'firebase/auth';
  // return fbOnAuth(getAuth(), callback);
  callback(null);
  return () => {};
}

/**
 * Open a Google sign-in popup.
 * @returns {Promise<object>} Firebase UserCredential
 */
export async function signInWithGoogle() {
  if (!CONFIGURED) {
    throw new Error(
      'Firebase is not configured yet.\n' +
      'Open src/firebase/config.js, paste your project values, and set CONFIGURED = true.'
    );
  }

  // TODO: real implementation
  // import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
  // return signInWithPopup(getAuth(), new GoogleAuthProvider());
}

/**
 * Sign the current user out.
 */
export async function signOut() {
  if (!CONFIGURED) return;

  // TODO: real implementation
  // import { getAuth, signOut as fbSignOut } from 'firebase/auth';
  // return fbSignOut(getAuth());
}
