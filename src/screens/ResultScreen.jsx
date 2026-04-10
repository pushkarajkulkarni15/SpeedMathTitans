import { useEffect, useRef, useState } from 'react';
import { calcAccuracy, calcGrade } from '../game/scoring';
import { saveGameResult } from '../firebase/firestore';

export default function ResultScreen({ result, user, isGuest, lastScore, onPlayAgain, onGoHome, onSaved }) {
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'guest' | 'error'
  const savedRef = useRef(false);

  const { score, solved, firstTryOk, bestStreak, totalTime } = result;
  const acc   = calcAccuracy(firstTryOk, solved);
  const grade = calcGrade(acc, solved);

  const scoreDelta = lastScore != null ? score - lastScore : null;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    if (!user || isGuest) { setSaveStatus('guest'); return; }

    setSaveStatus('saving');
    saveGameResult(user.uid, { score, solved, accuracy: acc, bestStreak, duration: totalTime })
      .then(() => { setSaveStatus('saved'); onSaved?.(); })
      .catch(err => { console.error(err); setSaveStatus('error'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen active">
      <div className="glass-card result-card">

        {/* Header */}
        <div className="result-header">
          <span className="result-icon">⏱</span>
          <div className="result-title">Time's Up!</div>
          <div className="result-sub">{grade.msg}</div>
        </div>

        {/* Score blob */}
        <div className="score-blob-wrap">
          <div className="score-blob">
            <div className="sb-trophy">{grade.trophy}</div>
            <div className="sb-label">Total Score</div>
            <div className="sb-value">{score}</div>
            <div className="sb-grade">Grade {grade.grade}</div>
          </div>
          {scoreDelta != null && (
            <div className={`score-delta ${scoreDelta >= 0 ? 'pos' : 'neg'}`}>
              {scoreDelta >= 0 ? '+' : ''}{scoreDelta} vs last game
            </div>
          )}
        </div>

        {/* 3 stat cards */}
        <div className="result-stats">
          <div className="rs-card">
            <div className="rs-v">{acc}%</div>
            <div className="rs-l">Accuracy</div>
          </div>
          <div className="rs-card rs-highlight">
            <div className="rs-v">{solved}</div>
            <div className="rs-l">Solved</div>
          </div>
          <div className="rs-card">
            <div className="rs-v">{bestStreak}</div>
            <div className="rs-l">Best Streak</div>
          </div>
        </div>

        {/* Save status */}
        {saveStatus === 'saving' && <div className="save-status is-saving">⏳ &nbsp;Saving…</div>}
        {saveStatus === 'saved'  && <div className="save-status is-saved">✓ &nbsp;Result saved</div>}
        {saveStatus === 'guest'  && <div className="save-status is-guest">💡 &nbsp;Sign in to save your progress</div>}
        {saveStatus === 'error'  && <div className="save-status is-error">⚠ &nbsp;Could not save result</div>}

        {/* Buttons */}
        <div className="result-btns">
          <button className="result-play-again" onClick={onPlayAgain}>⚡ &nbsp;Play Again</button>
          <button className="result-go-home"    onClick={onGoHome}>Back to Home</button>
        </div>

      </div>
    </div>
  );
}
