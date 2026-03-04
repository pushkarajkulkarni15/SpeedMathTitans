import { useState, useEffect } from 'react';
import { onAuthStateChanged } from './firebase/auth';
import { upsertUserDoc } from './firebase/firestore';
import { useRoom } from './hooks/useRoom';

import AuthScreen    from './screens/AuthScreen';
import HomeScreen    from './screens/HomeScreen';
import StatsScreen   from './screens/StatsScreen';
import GameScreen    from './screens/GameScreen';
import ResultScreen  from './screens/ResultScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav     from './components/BottomNav';

import PlayWithFriendsModal    from './screens/PlayWithFriendsModal';
import GameRoomScreen          from './screens/GameRoomScreen';
import JoinRoomScreen          from './screens/JoinRoomScreen';
import LobbyScreen             from './screens/LobbyScreen';
import MultiplayerGameScreen   from './screens/MultiplayerGameScreen';
import MultiplayerResultScreen from './screens/MultiplayerResultScreen';

/**
 * App — top-level screen router.
 * Solo screens:       'auth' | 'home' | 'stats' | 'game' | 'result' | 'profile'
 * Multiplayer screens: 'mp-room' | 'mp-join' | 'mp-lobby' | 'mp-game' | 'mp-result'
 */
export default function App() {
  const [screen,       setScreen]       = useState('auth');
  const [user,         setUser]         = useState(null);
  const [isGuest,      setIsGuest]      = useState(false);
  const [selectedSecs, setSelectedSecs] = useState(120);
  const [gameResult,   setGameResult]   = useState(null);
  const [lastScore,    setLastScore]    = useState(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const room = useRoom(user, isGuest);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(u => {
      setUser(u);
      setIsGuest(false);
      if (u) {
        upsertUserDoc(u);
        setScreen('home');
      } else {
        setScreen('auth');
      }
    });
    return unsubscribe;
  }, []);

  // ── Multiplayer status → auto-navigate ──────────────────────────────────
  useEffect(() => {
    if (room.status === 'playing' && (screen === 'mp-room' || screen === 'mp-lobby')) {
      setScreen('mp-game');
    }
  }, [room.status]); // eslint-disable-line

  // ── Bottom nav body padding ──────────────────────────────────────────────
  const showNav = ['home', 'stats', 'profile'].includes(screen);
  useEffect(() => {
    document.body.style.paddingBottom = showNav ? '72px' : '';
  }, [showNav]);

  // ── Solo game callbacks ──────────────────────────────────────────────────
  const handleSignIn      = () => {};
  const handlePlayAsGuest = () => { setIsGuest(true); setUser(null); setScreen('home'); };
  const handleSignOut     = () => { setUser(null); setIsGuest(false); setScreen('auth'); };
  const handlePlay        = () => { setScreen('game'); };

  const handleGameEnd = (result) => {
    setLastScore(gameResult?.score ?? null);
    setGameResult(result);
    setScreen('result');
  };

  const handlePlayAgain = () => { setScreen('game'); };
  const handleGoHome    = () => { setScreen('home'); };

  const handleTabChange = (tab) => { setScreen(tab); };
  const activeTab = showNav ? screen : 'home';

  // ── Multiplayer callbacks ────────────────────────────────────────────────
  const handleOpenFriendsModal = () => setShowFriendsModal(true);
  const handleCloseFriendsModal = () => setShowFriendsModal(false);

  const handleCreateRoom = async () => {
    try {
      await room.createRoom(selectedSecs);
      setScreen('mp-room');
    } catch {
      // error is stored in room.error — shown by modal/screen
    }
  };

  const handleGoToJoin = () => { setScreen('mp-join'); };

  const handleJoinRoom = async (code) => {
    try {
      await room.joinRoom(code);
      setScreen('mp-lobby');
    } catch {
      // room.error will surface the message in JoinRoomScreen
    }
  };

  const handleLeaveRoom = async () => {
    await room.leaveRoom();
    setScreen('home');
  };

  const handleMpGameEnd = (result) => {
    setScreen('mp-result');
  };

  const handleMpGoHome = async () => {
    await room.leaveRoom();
    setScreen('home');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {screen === 'auth' && (
        <AuthScreen onSignIn={handleSignIn} onPlayAsGuest={handlePlayAsGuest} />
      )}

      {screen === 'home' && (
        <HomeScreen
          user={user} isGuest={isGuest}
          selectedSecs={selectedSecs} onSelectTime={setSelectedSecs}
          onPlay={handlePlay}
          onPlayWithFriends={handleOpenFriendsModal}
        />
      )}

      {screen === 'stats' && (
        <StatsScreen user={user} isGuest={isGuest} />
      )}

      {screen === 'game' && (
        <GameScreen selectedSecs={selectedSecs} onGameEnd={handleGameEnd} />
      )}

      {screen === 'result' && gameResult && (
        <ResultScreen
          result={gameResult}
          user={user} isGuest={isGuest}
          lastScore={lastScore}
          onPlayAgain={handlePlayAgain} onGoHome={handleGoHome}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          user={user} isGuest={isGuest}
          onSignOut={handleSignOut} onGoHome={handleGoHome}
        />
      )}

      {/* ── Multiplayer screens ── */}

      {screen === 'mp-room' && room.roomData && (
        <GameRoomScreen
          roomCode={room.roomCode}
          roomData={room.roomData}
          playerId={room.playerId}
          playerName={room.playerName}
          onStartGame={room.startGame}
          onChangeDuration={room.changeDuration}
          onLeave={handleLeaveRoom}
        />
      )}

      {screen === 'mp-join' && (
        <JoinRoomScreen
          onJoin={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onBack={() => setScreen('home')}
          error={room.error}
          isLoading={room.status === 'joining'}
        />
      )}

      {screen === 'mp-lobby' && (
        <LobbyScreen
          roomCode={room.roomCode}
          onLeave={handleLeaveRoom}
        />
      )}

      {screen === 'mp-game' && room.roomData && (
        <MultiplayerGameScreen
          roomData={room.roomData}
          playerId={room.playerId}
          onGameEnd={handleMpGameEnd}
          reportScore={room.reportScore}
        />
      )}

      {screen === 'mp-result' && room.roomData && (
        <MultiplayerResultScreen
          roomCode={room.roomCode}
          roomData={room.roomData}
          playerId={room.playerId}
          onGoHome={handleMpGoHome}
        />
      )}

      {/* ── Play with Friends modal (overlays home) ── */}
      {showFriendsModal && (
        <PlayWithFriendsModal
          onClose={handleCloseFriendsModal}
          onCreateRoom={() => { handleCloseFriendsModal(); handleCreateRoom(); }}
          onJoinRoom={() => { handleCloseFriendsModal(); handleGoToJoin(); }}
        />
      )}

      {showNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );
}
