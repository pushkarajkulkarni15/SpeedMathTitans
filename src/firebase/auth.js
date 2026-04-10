
import { CONFIGURED, app } from './config';
import { getAuth, GoogleAuthProvider, signInWithPopup,
         createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,
         onAuthStateChanged as fbOnAuth, signOut as fbSignOut } from 'firebase/auth';

const auth = CONFIGURED ? getAuth(app) : null;

export function onAuthStateChanged(callback) {
  if (!CONFIGURED) { callback(null); return () => {}; }
  return fbOnAuth(auth, callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signUpWithEmail(email, password, username) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (username) await updateProfile(cred.user, { displayName: username });
  return cred;
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return fbSignOut(auth);
}