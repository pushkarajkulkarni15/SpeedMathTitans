import { useEffect, useRef, useState, useCallback } from 'react';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';

function timerColor(pct) {
  if (pct > 50) return 'var(--indigo)';
  if (pct > 25) return 'var(--amber)';
  return 'var(--red)';
}

/**
 * MultiplayerGameScreen
 *
 * Identical UI to GameScreen but:
 *  - Timer synced to server's startAt timestamp (no clock drift between clients)
 *  - Questions pre-generated from roomData.questionSeed (same for all players)
 *  - Shows a 3-second countdown before the game begins
 *  - Live score reported to RTDB via reportScore (throttled)
 */
export default function MultiplayerGameScreen({ roomData, playerId, onGameEnd, reportScore }) {
  const { questionSeed, duration, startAt, players } = roomData;

  const [answer,   setAnswer]   = useState('');
  const [feedback, setFeedback] = useState({ type: null, text: '' });
  const [shake,    setShake]    = useState(false);
  const [flashOk,  setFlashOk]  = useState(false);
  const [dots,     setDots]     = useState([]);
  const [cardAnim, setCardAnim] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3…2…1 before game

  const inputRef   = useRef(null);
  const prevProbRef = useRef(null);
  const reportThrottleRef = useRef(null);

  // Throttled RTDB score reporting (at most once per second)
  const throttledReport = useCallback((score, solved, accuracy) => {
    clearTimeout(reportThrottleRef.current);
    reportThrottleRef.current = setTimeout(() => reportScore(score, solved, accuracy), 1000);
  }, [reportScore]);

  const { G, problem, checkAnswer, nextQuestion } = useMultiplayerGame({
    questionSeed,
    duration,
    startAt,
    onGameEnd,
    onScoreChange: throttledReport,
  });

  // ── Countdown overlay (while Date.now() < startAt) ───────────────────
  useEffect(() => {
    const update = () => {
      const remaining = startAt - Date.now();
      if (remaining <= 0) { setCountdown(null); return; }
      setCountdown(Math.ceil(remaining / 1000));
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [startAt]);

  // ── New question animation ────────────────────────────────────────────
  useEffect(() => {
    if (!problem || problem === prevProbRef.current) return;
    prevProbRef.current = problem;
    setDots([]);
    setFeedback({ type: null, text: '' });
    setShake(false);
    setFlashOk(false);
    setAnswer('');
    setCardAnim(false);
    requestAnimationFrame(() => {
      setCardAnim(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    });
  }, [problem]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (countdown !== null) return; // game hasn't started yet
    const raw = answer.trim();
    if (!raw) { inputRef.current?.focus(); return; }

    const outcome = checkAnswer(parseFloat(raw));
    if (!outcome) return;

    const { result, pts, attemptNum } = outcome;

    if (result === 'correct') {
      setDots(d => [...d, 'ok']);
      setFlashOk(true);
      setFeedback({ type: 'ok', text: attemptNum === 1 ? `✓  Perfect! +${pts} pts` : `✓  Correct! +${pts} pts` });
      setAnswer('');
      setTimeout(() => nextQuestion(), 400);
    } else {
      setDots(d => [...d, 'bad']);
      setShake(true);
      setFeedback({ type: 'bad', text: attemptNum >= 3 ? '✗  Still wrong — keep trying!' : '✗  Not quite — try again!' });
      setAnswer('');
      setTimeout(() => { setShake(false); inputRef.current?.focus(); }, 400);
    }
  };

  const playerCount = Object.keys(players || {}).length;
  const pct = duration > 0 ? (G.timeLeft / duration) * 100 : 100;

  if (!problem) return null;

  return (
    <div className="screen active">

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="mp-countdown-overlay">
          <div className="mp-countdown-num">{countdown}</div>
          <div className="mp-countdown-label">Get ready…</div>
        </div>
      )}

      {/* Hidden keyboard input */}
      <input
        ref={inputRef}
        className="gs-hidden-input"
        type="text"
        inputMode="none"
        autoComplete="off"
        value={answer}
        onChange={e => setAnswer(e.target.value.replace(/[^0-9.-]/g, ''))}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />

      {/* Top bar */}
      <div className="gs-topbar">
        <div className="gs-pill gs-pill-mp">
          <span>👥</span>
          <span className="gs-pill-val">{playerCount}</span>
        </div>
        <div className="gs-pill">
          <span>🏆</span>
          <span className="gs-pill-val">{G.score}</span>
          <span className="gs-pill-unit">pts</span>
        </div>
        <div className="gs-pill">
          <span>📋</span>
          <span className="gs-pill-val">{G.solved}</span>
          <span className="gs-pill-unit">solved</span>
        </div>
        {G.streak >= 3 && (
          <div className="gs-pill gs-pill-streak">
            <span className="gs-pill-val">{G.streak}</span>
            <span>🔥</span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      <div className="gs-timer-track">
        <div className="gs-timer-fill" style={{ width: `${pct}%`, background: timerColor(pct) }} />
      </div>

      {/* Question card */}
      <div className={`gs-card${cardAnim ? ' anim-slide' : ''}`}>
        <div className="gs-cat-badge">{problem.cat}</div>
        <div className="gs-question">{problem.q}</div>
        {problem.hint && <div className="gs-hint">{problem.hint}</div>}

        <div className={`gs-ans-display${flashOk ? ' gs-ans-ok' : ''}${shake ? ' gs-ans-shake' : ''}`}>
          {answer !== '' ? answer : <span className="gs-ans-placeholder">?</span>}
        </div>

        {feedback.type ? (
          <div className={`gs-feedback gs-fb-${feedback.type}`}>{feedback.text}</div>
        ) : (
          <div className="gs-feedback" />
        )}

        <div className="attempt-dots">
          {dots.map((d, i) => <div key={i} className={`a-dot ${d}`} />)}
        </div>

        <div className="gs-keypad">
          {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(key => (
            <button
              key={key}
              className={`gs-key${key === 'C' ? ' gs-key-clear' : ''}${key === '⌫' ? ' gs-key-back' : ''}`}
              onPointerDown={e => {
                e.preventDefault();
                if (countdown !== null) return;
                if (key === 'C')  { setAnswer(''); return; }
                if (key === '⌫') { setAnswer(a => a.slice(0, -1)); return; }
                setAnswer(a => a + key);
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          className="gs-submit"
          onClick={handleSubmit}
          disabled={countdown !== null}
        >
          Submit Answer &nbsp;→
        </button>
      </div>
    </div>
  );
}
