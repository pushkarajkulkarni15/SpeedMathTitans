import { useState, useEffect } from 'react';
import { onAuthStateChanged } from './firebase/auth';
import { upsertUserDoc } from './firebase/firestore';

import AuthScreen    from './screens/AuthScreen';
import HomeScreen    from './screens/HomeScreen';
import StatsScreen   from './screens/StatsScreen';
import GameScreen    from './screens/GameScreen';
import ResultScreen  from './screens/ResultScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav     from './components/BottomNav';

/**
 * App — top-level screen router.
 * Screens: 'auth' | 'home' | 'stats' | 'game' | 'result' | 'profile'
 */
export default function App() {
  const [screen,       setScreen]       = useState('auth');
  const [user,         setUser]         = useState(null);
  const [isGuest,      setIsGuest]      = useState(false);
  const [selectedSecs, setSelectedSecs] = useState(120);
  const [gameResult,   setGameResult]   = useState(null);
  const [lastScore,    setLastScore]    = useState(null);

  // ── Auth state listener ──────────────────────────────────────────────
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

  // ── Bottom nav body padding ──────────────────────────────────────────
  const showNav = ['home', 'stats', 'profile'].includes(screen);
  useEffect(() => {
    document.body.style.paddingBottom = showNav ? '72px' : '';
  }, [showNav]);

  // ── Navigation callbacks ─────────────────────────────────────────────
  const handleSignIn      = () => {};
  const handlePlayAsGuest = () => { setIsGuest(true); setUser(null); setScreen('home'); };
  const handleSignOut     = () => { setUser(null); setIsGuest(false); setScreen('auth'); };
  const handlePlay        = () => { setScreen('game'); };

  const handleGameEnd = (result) => {
    setLastScore(gameResult?.score ?? null); // previous game's score for delta
    setGameResult(result);
    setScreen('result');
  };

  const handlePlayAgain = () => { setScreen('game'); };
  const handleGoHome    = () => { setScreen('home'); };

  const handleTabChange = (tab) => { setScreen(tab); };
  const activeTab = showNav ? screen : 'home';

  // ── Render ───────────────────────────────────────────────────────────
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

      {showNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );
}
