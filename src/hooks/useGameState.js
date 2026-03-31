import { useRef, useReducer, useEffect, useCallback } from 'react';
import { pickProblem } from '../game/generators';
import { calcPoints } from '../game/scoring';

/**
 * Manages all game state using a mutable ref (gRef) for timer callbacks
 * and a forceUpdate counter to trigger React re-renders.
 *
 * This avoids stale-closure issues with setInterval while keeping
 * the component code clean.
 */

const INITIAL_G = {
  totalTime:     120,
  timeLeft:      120,
  score:         0,
  solved:        0,
  firstTryOk:    0,
  totalAttempts: 0,
  curAttempts:   0,  // attempts on the current question
  streak:        0,
  bestStreak:    0,
  problem:       null,
  active:        false,
  prevCat:       '',
};

export function useGameState() {
  // Canonical game state lives here — always fresh inside interval callbacks
  const gRef = useRef(INITIAL_G);

  // Incrementing this triggers a re-render so components see gRef.current
  const [, forceUpdate] = useReducer(n => n + 1, 0);

  const timerRef = useRef(null);

  // Convenience: mutate gRef and schedule a re-render
  const setG = useCallback((updater) => {
    gRef.current = typeof updater === 'function'
      ? updater(gRef.current)
      : updater;
    forceUpdate();
  }, []);

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Start (or restart) a game with the given duration in seconds.
   */
  const startGame = useCallback((secs) => {
    clearInterval(timerRef.current);

    const usedQs = new Set();
    const sqKeys = new Set();
    const cuKeys = new Set();
    const firstProblem = pickProblem('', 0, { usedQs, sqKeys, cuKeys });
    usedQs.add(firstProblem.q);
    if (firstProblem.cat === 'Squares'    || firstProblem.cat === 'Square Roots') sqKeys.add(firstProblem.key);
    if (firstProblem.cat === 'Cubes'      || firstProblem.cat === 'Cube Roots')   cuKeys.add(firstProblem.key);

    gRef.current = {
      ...INITIAL_G,
      totalTime: secs,
      timeLeft:  secs,
      problem:   firstProblem,
      prevCat:   firstProblem.cat,
      active:    true,
      usedQs,
      sqKeys,
      cuKeys,
    };
    forceUpdate();

    timerRef.current = setInterval(() => {
      const g = gRef.current;
      if (!g.active) { clearInterval(timerRef.current); return; }

      const timeLeft = g.timeLeft - 1;
      if (timeLeft <= 0) {
        gRef.current = { ...g, timeLeft: 0, active: false };
        clearInterval(timerRef.current);
      } else {
        gRef.current = { ...g, timeLeft };
      }
      forceUpdate();
    }, 1000);
  }, []);

  /**
   * Check the player's answer.
   * Returns { result: 'correct'|'wrong', pts: number, attemptNum: number }
   */
  const checkAnswer = useCallback((userAns) => {
    const g = gRef.current;
    if (!g.active || !g.problem) return null;

    const attemptNum = g.curAttempts + 1;

    if (userAns === g.problem.ans) {
      const pts       = calcPoints(attemptNum);
      const newStreak = g.streak + 1;
      gRef.current = {
        ...g,
        score:        g.score + pts,
        solved:       g.solved + 1,
        firstTryOk:   attemptNum === 1 ? g.firstTryOk + 1 : g.firstTryOk,
        streak:       newStreak,
        bestStreak:   Math.max(g.bestStreak, newStreak),
        curAttempts:  attemptNum,
        totalAttempts: g.totalAttempts + 1,
      };
      forceUpdate();
      return { result: 'correct', pts, attemptNum };
    } else {
      gRef.current = {
        ...g,
        streak:       0,
        curAttempts:  attemptNum,
        totalAttempts: g.totalAttempts + 1,
      };
      forceUpdate();
      return { result: 'wrong', attemptNum };
    }
  }, []);

  /**
   * Advance to the next question (call after showing correct-answer feedback).
   */
  const nextQuestion = useCallback(() => {
    const g = gRef.current;
    const sessionCtx = { usedQs: g.usedQs, sqKeys: g.sqKeys, cuKeys: g.cuKeys };
    const prob = pickProblem(g.prevCat, g.solved, sessionCtx);
    // mutate sets in place — same references are kept in gRef spread below
    g.usedQs?.add(prob.q);
    if (prob.cat === 'Squares'    || prob.cat === 'Square Roots') g.sqKeys?.add(prob.key);
    if (prob.cat === 'Cubes'      || prob.cat === 'Cube Roots')   g.cuKeys?.add(prob.key);
    gRef.current = { ...g, problem: prob, prevCat: prob.cat, curAttempts: 0 };
    forceUpdate();
  }, []);

  /**
   * Quit the current game early (transitions to game-over state).
   */
  const quitGame = useCallback(() => {
    clearInterval(timerRef.current);
    setG(g => ({ ...g, active: false }));
  }, [setG]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  return {
    G:            gRef.current,
    startGame,
    checkAnswer,
    nextQuestion,
    quitGame,
  };
}
