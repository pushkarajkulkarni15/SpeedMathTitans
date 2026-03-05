
import { CONFIGURED, app } from './config';
import { getAuth, GoogleAuthProvider, signInWithPopup,
         onAuthStateChanged as fbOnAuth, signOut as fbSignOut } from 'firebase/auth';

const auth = CONFIGURED ? getAuth(app) : null;

export function onAuthStateChanged(callback) {
  if (!CONFIGURED) { callback(null); return () => {}; }
  return fbOnAuth(auth, callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOut() {
  return fbSignOut(auth);
}