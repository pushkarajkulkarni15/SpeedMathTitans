import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createRoom    as dbCreate,
  joinRoom      as dbJoin,
  listenRoom,
  startRoomGame,
  updatePlayerScore,
  removePlayer,
  updateRoomDuration,
} from '../firebase/database';

/**
 * Manages room lifecycle for multiplayer games.
 *
 * Exposed state:
 *   roomCode  — 6-char code, null when not in a room
 *   roomData  — live snapshot of the RTDB room object
 *   isHost    — true if this client created the room
 *   status    — 'idle' | 'creating' | 'joining' | 'in-room' | 'in-lobby' | 'playing' | 'finished'
 *   error     — last error message, null otherwise
 *   playerId  — stable ID for this session (Firebase UID or random guest ID)
 *   playerName
 *
 * Exposed actions:
 *   createRoom(duration)     → resolves with roomCode
 *   joinRoom(code)           → resolves on success, rejects with message on failure
 *   startGame()              → host only
 *   changeDuration(secs)     → host only
 *   reportScore(s, sol, acc) → writes live score to RTDB (call throttled externally)
 *   leaveRoom()              → removes player, cleans up listener
 */
export function useRoom(user, isGuest, guestName = 'Guest') {
  const [roomCode,  setRoomCode]  = useState(null);
  const [roomData,  setRoomData]  = useState(null);
  const [isHost,    setIsHost]    = useState(false);
  const [status,    setStatus]    = useState('idle');
  const [error,     setError]     = useState(null);

  const unsubRef   = useRef(null);
  const statusRef  = useRef('idle');

  // Stable player identity for this session
  const playerIdRef = useRef(
    user?.uid || `guest_${Math.random().toString(36).slice(2, 10)}`
  );
  const playerId   = playerIdRef.current;
  const playerName = isGuest ? (guestName || 'Guest') : (user?.displayName || 'Player');

  // Keep statusRef in sync so the RTDB listener can read the latest status
  useEffect(() => { statusRef.current = status; }, [status]);

  // Subscribe to room when roomCode is set
  useEffect(() => {
    if (!roomCode) return;
    unsubRef.current?.();
    unsubRef.current = listenRoom(roomCode, (data) => {
      if (!data) return;
      setRoomData(data);
      if (data.status === 'playing'  && statusRef.current !== 'playing')  setStatus('playing');
      if (data.status === 'finished' && statusRef.current !== 'finished') setStatus('finished');
    });
    return () => { unsubRef.current?.(); unsubRef.current = null; };
  }, [roomCode]);

  const createRoom = useCallback(async (duration) => {
    setError(null);
    setStatus('creating');
    try {
      const code = await dbCreate({ hostId: playerId, hostName: playerName, duration });
      setRoomCode(code);
      setIsHost(true);
      setStatus('in-room');
      return code;
    } catch (e) {
      setError(e.message);
      setStatus('idle');
      throw e;
    }
  }, [playerId, playerName]);

  const joinRoom = useCallback(async (code) => {
    setError(null);
    setStatus('joining');
    try {
      await dbJoin({ roomCode: code.toUpperCase(), playerId, playerName });
      setRoomCode(code.toUpperCase());
      setIsHost(false);
      setStatus('in-lobby');
    } catch (e) {
      setError(e.message);
      setStatus('idle');
      throw e;
    }
  }, [playerId, playerName]);

  const startGame = useCallback(async () => {
    if (!roomCode || !isHost) return;
    await startRoomGame(roomCode);
  }, [roomCode, isHost]);

  const changeDuration = useCallback(async (duration) => {
    if (!roomCode || !isHost) return;
    await updateRoomDuration(roomCode, duration);
  }, [roomCode, isHost]);

  const reportScore = useCallback(async (score, solved, accuracy) => {
    if (!roomCode) return;
    await updatePlayerScore(roomCode, playerId, { score, solved, accuracy });
  }, [roomCode, playerId]);

  const leaveRoom = useCallback(async () => {
    if (roomCode) {
      await removePlayer(roomCode, playerId).catch(() => {});
    }
    unsubRef.current?.();
    unsubRef.current = null;
    setRoomCode(null);
    setRoomData(null);
    setIsHost(false);
    setStatus('idle');
    setError(null);
  }, [roomCode, playerId]);

  return {
    roomCode,
    roomData,
    isHost,
    status,
    error,
    playerId,
    playerName,
    createRoom,
    joinRoom,
    startGame,
    changeDuration,
    reportScore,
    leaveRoom,
  };
}
