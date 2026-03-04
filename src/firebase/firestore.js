/**
 * Firestore — dummy module
 *
 * All functions are stubs. Replace with real Firestore SDK calls
 * once Firebase is configured (CONFIGURED = true in config.js).
 *
 * Data structure:
 *   users/{uid}
 *     displayName: string
 *     email:       string
 *     photoURL:    string
 *     gamesPlayed: number
 *     highScore:   number
 *     bestAccuracy: number
 *     bestStreak:  number
 *
 *   users/{uid}/games/{autoId}
 *     score:      number
 *     solved:     number
 *     accuracy:   number   (firstTryOk / solved * 100)
 *     bestStreak: number
 *     duration:   number   (seconds)
 *     timestamp:  Timestamp
 */

import { CONFIGURED } from './config';

/**
 * Create or update the user document on every sign-in.
 */
export async function upsertUserDoc(user) {
  if (!CONFIGURED) return;

  // TODO: real implementation
  // const db  = getFirestore();
  // const ref = doc(db, 'users', user.uid);
  // const snap = await getDoc(ref);
  // if (!snap.exists()) {
  //   await setDoc(ref, { displayName: user.displayName, email: user.email,
  //     photoURL: user.photoURL, gamesPlayed: 0, highScore: 0, bestAccuracy: 0, bestStreak: 0 });
  // } else {
  //   await updateDoc(ref, { displayName: user.displayName, email: user.email, photoURL: user.photoURL });
  // }
}

/**
 * Load a user's aggregate stats.
 * @returns {Promise<object|null>}
 */
export async function loadUserData(uid) {
  if (!CONFIGURED) return null;

  // TODO: real implementation
  // const snap = await getDoc(doc(getFirestore(), 'users', uid));
  // return snap.exists() ? snap.data() : null;
  return null;
}

/**
 * Load the last N game results for a user.
 * @returns {Promise<Array>}
 */
export async function loadGameHistory(uid, limit = 10) {
  if (!CONFIGURED) return [];

  // TODO: real implementation
  // const q = query(
  //   collection(getFirestore(), 'users', uid, 'games'),
  //   orderBy('timestamp', 'desc'),
  //   firestoreLimit(limit)
  // );
  // const snap = await getDocs(q);
  // return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return [];
}

/**
 * Write a game result and update the user's best stats.
 * @param {string} uid
 * @param {{ score, solved, accuracy, bestStreak, duration }} result
 */
export async function saveGameResult(uid, result) {
  if (!CONFIGURED) {
    console.log('[Firestore] saveGameResult (dummy — Firebase not configured):', result);
    return;
  }

  // TODO: real implementation
  // const db = getFirestore();
  // await addDoc(collection(db, 'users', uid, 'games'), {
  //   ...result,
  //   timestamp: serverTimestamp(),
  // });
  // const userRef  = doc(db, 'users', uid);
  // const userSnap = await getDoc(userRef);
  // const d = userSnap.data() || {};
  // const upd = { gamesPlayed: (d.gamesPlayed || 0) + 1 };
  // if (result.score      > (d.highScore    || 0)) upd.highScore    = result.score;
  // if (result.accuracy   > (d.bestAccuracy || 0)) upd.bestAccuracy = result.accuracy;
  // if (result.bestStreak > (d.bestStreak   || 0)) upd.bestStreak   = result.bestStreak;
  // await updateDoc(userRef, upd);
}
