import { CONFIGURED, app } from './config';
  import { getFirestore, doc, getDoc, setDoc, updateDoc,
           addDoc, collection, query, orderBy,
           limit as firestoreLimit, getDocs, serverTimestamp } from 'firebase/firestore';

  const db = CONFIGURED ? getFirestore(app) : null;

  export async function upsertUserDoc(user) {
    if (!CONFIGURED) return;
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName, email: user.email,
        photoURL: user.photoURL, gamesPlayed: 0,
        highScore: 0, bestAccuracy: 0, bestStreak: 0,
      });
    } else {
      await updateDoc(ref, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  }

  export async function loadUserData(uid) {
    if (!CONFIGURED) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  }

  export async function loadGameHistory(uid, limit = 10) {
    if (!CONFIGURED) return [];
    const q = query(
      collection(db, 'users', uid, 'games'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  export async function saveGameResult(uid, result) {
    if (!CONFIGURED) return;
    await addDoc(collection(db, 'users', uid, 'games'), {
      ...result,
      timestamp: serverTimestamp(),
    });
    const userRef  = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const d = userSnap.data() || {};
    const upd = { gamesPlayed: (d.gamesPlayed || 0) + 1 };
    if (result.score      > (d.highScore    || 0)) upd.highScore    = result.score;
    if (result.accuracy   > (d.bestAccuracy || 0)) upd.bestAccuracy = result.accuracy;
    if (result.bestStreak > (d.bestStreak   || 0)) upd.bestStreak   = result.bestStreak;
    await updateDoc(userRef, upd);
  }