import { useRef, useReducer, useEffect, useCallback } from 'react';
import { generateSeededQuestions } from '../game/generators';
import { calcPoints } from '../game/scoring';

/**
 * Game state for a synchronized multiplayer game.
 *
 * Key differences vs useGameState:
 *  - Questions are pre-generated from questionSeed (same for all clients)
 *  - Timer is driven by startAt (server epoch ms) not a local countdown
 *  - Score is reported externally via onScoreChange for RTDB sync
 *
 * The timer ticks every 250 ms for a smooth progress bar while keeping
 * CPU usage low.
 */
export function useMultiplayerGame({ questionSeed, duration, startAt, onGameEnd, onScoreChange }) {
  const [, forceUpdate] = useReducer(n => n + 1, 0);

  // Pre-generate the shared question list once (same seed → same questions on all clients)
  const questionsRef = useRef(null);
  if (!questionsRef.current) {
    questionsRef.current = generateSeededQuestions(questionSeed, 300);
  }

  const gRef = useRef({
    qIndex:      0,
    score:       0,
    solved:      0,
    firstTryOk:  0,
    streak:      0,
    bestStreak:  0,
    curAttempts: 0,
    timeLeft:    duration,
  });

  const gameOverRef  = useRef(false);
  const tickRef      = useRef(null);
  // Keep a ref to latest onGameEnd/onScoreChange so the timer callback always
  // has a fresh reference without needing them in the dependency array.
  const cbRef        = useRef({ onGameEnd, onScoreChange });
  useEffect(() => { cbRef.current = { onGameEnd, onScoreChange }; });

  const endTime = startAt + duration * 1000;

  // ── Synchronized timer ──────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const timeLeft  = Math.ceil(remaining / 1000);
      gRef.current    = { ...gRef.current, timeLeft };
      forceUpdate();

      if (remaining <= 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        clearInterval(tickRef.current);
        const g = gRef.current;
        cbRef.current.onGameEnd({
          score:      g.score,
          solved:     g.solved,
          firstTryOk: g.firstTryOk,
          bestStreak: g.bestStreak,
          totalTime:  duration,
        });
      }
    };

    tick(); // run immediately so timer shows right away
    tickRef.current = setInterval(tick, 250);
    return () => clearInterval(tickRef.current);
  }, [endTime, duration]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => () => clearInterval(tickRef.current), []);

  // ── Check answer ────────────────────────────────────────────────────────
  const checkAnswer = useCallback((userAns) => {
    if (gameOverRef.current) return null;
    const g = gRef.current;
    const question = questionsRef.current[g.qIndex];
    if (!question) return null;

    const attemptNum = g.curAttempts + 1;

    if (userAns === question.ans) {
      const pts       = calcPoints(attemptNum);
      const newStreak = g.streak + 1;
      gRef.current = {
        ...g,
        score:       g.score + pts,
        solved:      g.solved + 1,
        firstTryOk:  attemptNum === 1 ? g.firstTryOk + 1 : g.firstTryOk,
        streak:      newStreak,
        bestStreak:  Math.max(g.bestStreak, newStreak),
        curAttempts: attemptNum,
      };
      forceUpdate();
      // Notify parent to throttle-report score to RTDB
      cbRef.current.onScoreChange?.(
        gRef.current.score,
        gRef.current.solved,
        gRef.current.solved > 0 ? Math.round(gRef.current.firstTryOk / gRef.current.solved * 100) : 0
      );
      return { result: 'correct', pts, attemptNum };
    } else {
      gRef.current = { ...g, streak: 0, curAttempts: attemptNum };
      forceUpdate();
      return { result: 'wrong', attemptNum };
    }
  }, []);

  // ── Next question ───────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    gRef.current = { ...gRef.current, qIndex: gRef.current.qIndex + 1, curAttempts: 0 };
    forceUpdate();
  }, []);

  const G       = gRef.current;
  const problem = questionsRef.current[G.qIndex] ?? null;

  return { G, problem, checkAnswer, nextQuestion };
}
