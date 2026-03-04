import { useEffect, useRef, useState } from 'react';
import { calcAccuracy, calcGrade } from '../game/scoring';
import { saveGameResult } from '../firebase/firestore';

export default function EndScreen({ result, user, isGuest, onPlayAgain, onGoHome }) {
  const [accFill, setAccFill]     = useState(0);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'guest' | 'error'
  const savedRef = useRef(false);

  const { score, solved, firstTryOk, bestStreak, totalTime } = result;
  const acc   = calcAccuracy(firstTryOk, solved);
  const grade = calcGrade(acc, solved);

  // Animate accuracy bar
  useEffect(() => {
    const t = setTimeout(() => setAccFill(acc), 200);
    return () => clearTimeout(t);
  }, [acc]);

  // Save result
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    if (!user || isGuest) {
      setSaveStatus('guest');
      return;
    }

    setSaveStatus('saving');
    saveGameResult(user.uid, { score, solved, accuracy: acc, bestStreak, duration: totalTime })
      .then(() => setSaveStatus('saved'))
      .catch((err) => { console.error(err); setSaveStatus('error'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen active">
      <div className="glass-card end-card">

        <div className="trophy-wrap">
          <span className="trophy">{grade.trophy}</span>
        </div>
        <div className={`grade-badge grade-${grade.grade}`}>Grade {grade.grade}</div>
        <div className="end-title">{grade.title}</div>
        <p className="end-msg">{grade.msg}</p>

        <div className="end-stats">
          <div className="end-stat">
            <div className="esv">{score}</div>
            <div className="esl">Total Score</div>
          </div>
          <div className="end-stat">
            <div className="esv">{solved}</div>
            <div className="esl">Questions Solved</div>
          </div>
          <div className="end-stat">
            <div className="esv">{acc}%</div>
            <div className="esl">First-try Accuracy</div>
          </div>
          <div className="end-stat">
            <div className="esv">{bestStreak}</div>
            <div className="esl">Best Streak</div>
          </div>
        </div>

        <div className="acc-label-row">
          <span>First-try accuracy</span>
          <span>{acc}%</span>
        </div>
        <div className="acc-track">
          <div className="acc-fill" style={{ width: `${accFill}%` }} />
        </div>

        {/* Save status banner */}
        {saveStatus === 'saving' && (
          <div className="save-status is-saving">⏳ &nbsp;Saving…</div>
        )}
        {saveStatus === 'saved' && (
          <div className="save-status is-saved">✓ &nbsp;Result saved</div>
        )}
        {saveStatus === 'guest' && (
          <div className="save-status is-guest">💡 &nbsp;Sign in to save your progress</div>
        )}
        {saveStatus === 'error' && (
          <div className="save-status is-error">⚠ &nbsp;Could not save result</div>
        )}

        <div className="end-btns">
          <button className="btn-home"  onClick={onGoHome}>Dashboard</button>
          <button className="btn-again" onClick={onPlayAgain}>⚡ &nbsp;Play Again</button>
        </div>

      </div>
    </div>
  );
}
