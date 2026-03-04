import { useEffect, useRef, useState } from 'react';
import { useGameState } from '../hooks/useGameState';

function timerColor(pct) {
  if (pct > 50) return 'var(--indigo)';
  if (pct > 25) return 'var(--amber)';
  return 'var(--red)';
}

export default function GameScreen({ selectedSecs, onGameEnd }) {
  const { G, startGame, checkAnswer, nextQuestion, quitGame } = useGameState();

  const [answer,   setAnswer]   = useState('');
  const [feedback, setFeedback] = useState({ type: null, text: '' });
  const [shake,    setShake]    = useState(false);
  const [flashOk,  setFlashOk]  = useState(false);
  const [dots,     setDots]     = useState([]);
  const [cardAnim, setCardAnim] = useState(false);

  const inputRef    = useRef(null);
  const gameOverRef = useRef(false);
  const prevProbRef = useRef(null);

  // ── Start ────────────────────────────────────────────────────────────
  useEffect(() => { startGame(selectedSecs); }, []); // eslint-disable-line

  // ── Game over ────────────────────────────────────────────────────────
  useEffect(() => {
    if (G.problem && !G.active && !gameOverRef.current) {
      gameOverRef.current = true;
      onGameEnd({ score: G.score, solved: G.solved, firstTryOk: G.firstTryOk, bestStreak: G.bestStreak, totalTime: G.totalTime });
    }
  }, [G.active]); // eslint-disable-line

  // ── New question ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!G.problem || G.problem === prevProbRef.current) return;
    prevProbRef.current = G.problem;
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
  }, [G.problem]);

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!G.active) return;
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

  const handleQuit = () => {
    if (confirm('Quit? Your current session will end.')) quitGame();
  };

  const pct = G.totalTime > 0 ? (G.timeLeft / G.totalTime) * 100 : 100;

  if (!G.problem) return null;

  return (
    <div className="screen active">

      {/* Hidden input — captures physical keyboard, suppresses mobile keyboard */}
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

      {/* Top bar: quit | score | count | streak (if active) */}
      <div className="gs-topbar">
        <button className="gs-quit-btn" onClick={handleQuit} title="Quit">✕</button>
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

      {/* Timer bar only — no number, colour shifts as time runs out */}
      <div className="gs-timer-track">
        <div className="gs-timer-fill" style={{ width: `${pct}%`, background: timerColor(pct) }} />
      </div>

      {/* Question card */}
      <div className={`gs-card${cardAnim ? ' anim-slide' : ''}`}>

        <div className="gs-cat-badge">{G.problem.cat}</div>
        <div className="gs-question">{G.problem.q}</div>
        {G.problem.hint && <div className="gs-hint">{G.problem.hint}</div>}

        {/* Visible answer display */}
        <div className={`gs-ans-display${flashOk ? ' gs-ans-ok' : ''}${shake ? ' gs-ans-shake' : ''}`}>
          {answer !== '' ? answer : <span className="gs-ans-placeholder">?</span>}
        </div>

        {/* Feedback */}
        {feedback.type ? (
          <div className={`gs-feedback gs-fb-${feedback.type}`}>{feedback.text}</div>
        ) : (
          <div className="gs-feedback" />
        )}

        {/* Attempt dots */}
        <div className="attempt-dots">
          {dots.map((d, i) => <div key={i} className={`a-dot ${d}`} />)}
        </div>

        {/* Keypad: 1–9, C, 0, ⌫ */}
        <div className="gs-keypad">
          {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(key => (
            <button
              key={key}
              className={`gs-key${key === 'C' ? ' gs-key-clear' : ''}${key === '⌫' ? ' gs-key-back' : ''}`}
              onPointerDown={e => {
                e.preventDefault();
                if (key === 'C')  { setAnswer(''); return; }
                if (key === '⌫') { setAnswer(a => a.slice(0, -1)); return; }
                setAnswer(a => a + key);
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button className="gs-submit" onClick={handleSubmit}>
          Submit Answer &nbsp;→
        </button>

      </div>
    </div>
  );
}
