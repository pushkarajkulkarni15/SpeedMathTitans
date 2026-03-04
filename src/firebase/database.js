/**
 * Firebase Realtime Database — Room Management
 *
 * Setup (in addition to existing Firestore setup):
 *   1. Firebase Console → Realtime Database → Create database → Test mode
 *   2. Add `databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com'`
 *      to firebaseConfig in config.js, then set CONFIGURED = true
 *
 * Data structure:
 *   /rooms/{code}
 *     hostId:       string
 *     hostName:     string
 *     status:       'waiting' | 'playing' | 'finished'
 *     duration:     number  (seconds)
 *     questionSeed: number  (seeded PRNG seed for identical questions)
 *     startAt:      number | null  (epoch ms, null until host starts; set to
 *                   Date.now() + 3000 so clients get a 3-second countdown)
 *     players/
 *       {playerId}/
 *         name:     string
 *         score:    number
 *         solved:   number
 *         accuracy: number  (0–100, first-try %)
 *         joinedAt: number  (epoch ms)
 *
 * When CONFIGURED = false:
 *   Falls back to BroadcastChannel + localStorage so the full multiplayer
 *   flow works across multiple browser tabs on the same device — no Firebase
 *   needed for local development and demo.
 */

import { CONFIGURED } from './config';

// ── Local demo mode ────────────────────────────────────────────────────────
// BroadcastChannel notifies other tabs; CustomEvent notifies the current tab.

const BC = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('smt_rooms')
  : null;

function localGet(code) {
  try { return JSON.parse(localStorage.getItem(`smt_room_${code}`) || 'null'); }
  catch { return null; }
}

function localSet(code, data) {
  localStorage.setItem(`smt_room_${code}`, JSON.stringify(data));
  // Notify other tabs
  BC?.postMessage({ code, data });
  // Notify this tab (BroadcastChannel does NOT fire on the sender)
  window.dispatchEvent(new CustomEvent('smt_room_change', { detail: { code, data } }));
}

function localListen(code, cb) {
  // Fire immediately with current data
  const current = localGet(code);
  if (current) cb(current);

  const localHandler = (e) => { if (e.detail?.code === code) cb(e.detail.data); };
  const bcHandler    = (e) => { if (e.data?.code  === code) cb(e.data.data); };

  window.addEventListener('smt_room_change', localHandler);
  BC?.addEventListener('message', bcHandler);

  return () => {
    window.removeEventListener('smt_room_change', localHandler);
    BC?.removeEventListener('message', bcHandler);
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous I/O/0/1
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Create a new room. Returns the 6-character room code.
 */
export async function createRoom({ hostId, hostName, duration }) {
  const code = genCode();
  const seed = Math.floor(Math.random() * 2 ** 31);
  const room = {
    hostId,
    hostName,
    status: 'waiting',
    duration,
    questionSeed: seed,
    startAt: null,
    players: {
      [hostId]: { name: hostName, score: 0, solved: 0, accuracy: 0, joinedAt: Date.now() },
    },
  };

  if (!CONFIGURED) {
    localSet(code, room);
    return code;
  }

  // TODO: real RTDB implementation
  // import { getDatabase, ref, set } from 'firebase/database';
  // const db = getDatabase();
  // await set(ref(db, `rooms/${code}`), room);
  return code;
}

/**
 * Join an existing room. Throws if room not found or game already started.
 */
export async function joinRoom({ roomCode, playerId, playerName }) {
  if (!CONFIGURED) {
    const room = localGet(roomCode);
    if (!room) throw new Error('Room not found. Check the code and try again.');
    if (room.status !== 'waiting') throw new Error('Game already started. You cannot join now.');
    room.players[playerId] = { name: playerName, score: 0, solved: 0, accuracy: 0, joinedAt: Date.now() };
    localSet(roomCode, room);
    return room;
  }

  // TODO: real RTDB implementation
  // const db = getDatabase();
  // const snap = await get(ref(db, `rooms/${roomCode}`));
  // if (!snap.exists()) throw new Error('Room not found. Check the code and try again.');
  // const room = snap.val();
  // if (room.status !== 'waiting') throw new Error('Game already started. You cannot join now.');
  // await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
  //   name: playerName, score: 0, solved: 0, accuracy: 0, joinedAt: Date.now(),
  // });
  // return room;
}

/**
 * Subscribe to all changes on a room. Returns an unsubscribe function.
 */
export function listenRoom(roomCode, callback) {
  if (!CONFIGURED) return localListen(roomCode, callback);

  // TODO: real RTDB implementation
  // import { getDatabase, ref, onValue, off } from 'firebase/database';
  // const db = getDatabase();
  // const roomRef = ref(db, `rooms/${roomCode}`);
  // onValue(roomRef, snap => callback(snap.exists() ? snap.val() : null));
  // return () => off(roomRef);
  return () => {};
}

/**
 * Host starts the game.
 * Sets startAt = now + 3 s so all clients get a synchronized 3-second countdown.
 */
export async function startRoomGame(roomCode) {
  if (!CONFIGURED) {
    const room = localGet(roomCode);
    if (!room) return;
    room.status  = 'playing';
    room.startAt = Date.now() + 3000;
    localSet(roomCode, room);
    return;
  }

  // TODO: real RTDB implementation
  // const db = getDatabase();
  // await update(ref(db, `rooms/${roomCode}`), {
  //   status: 'playing',
  //   startAt: Date.now() + 3000,  // use serverTimestamp() + offset in production
  // });
}

/**
 * Write a player's live score (throttle calls from the component).
 */
export async function updatePlayerScore(roomCode, playerId, { score, solved, accuracy }) {
  if (!CONFIGURED) {
    const room = localGet(roomCode);
    if (!room || !room.players[playerId]) return;
    room.players[playerId] = { ...room.players[playerId], score, solved, accuracy };
    localSet(roomCode, room);
    return;
  }

  // TODO: real RTDB implementation
  // const db = getDatabase();
  // await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { score, solved, accuracy });
}

/**
 * Remove a player from a room (used when leaving the room).
 */
export async function removePlayer(roomCode, playerId) {
  if (!CONFIGURED) {
    const room = localGet(roomCode);
    if (!room) return;
    delete room.players[playerId];
    localSet(roomCode, room);
    return;
  }

  // TODO: real RTDB implementation
  // const db = getDatabase();
  // await set(ref(db, `rooms/${roomCode}/players/${playerId}`), null);
}

/**
 * Update the room duration (host only).
 */
export async function updateRoomDuration(roomCode, duration) {
  if (!CONFIGURED) {
    const room = localGet(roomCode);
    if (!room) return;
    room.duration = duration;
    localSet(roomCode, room);
    return;
  }

  // TODO: real RTDB implementation
  // const db = getDatabase();
  // await update(ref(db, `rooms/${roomCode}`), { duration });
}
