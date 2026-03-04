/**
 * MultiplayerResultScreen — Match Results with leaderboard.
 *
 * Shows the winner, ranked player list (accuracy breaks ties),
 * and a "Go to Home" button.
 */

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function rankSuffix(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// Avatar accent colours cycling through brand palette
const AVATAR_COLORS = [
  'linear-gradient(135deg,#7c6cf8,#a78bfa)',
  'linear-gradient(135deg,#34d399,#10b981)',
  'linear-gradient(135deg,#f97316,#fb923c)',
  'linear-gradient(135deg,#c084fc,#a855f7)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#f87171,#ef4444)',
];

export default function MultiplayerResultScreen({ roomCode, roomData, playerId, onGoHome }) {
  const players = roomData?.players ?? {};

  // Sort by score desc, accuracy as tiebreaker
  const ranked = Object.entries(players)
    .map(([pid, p]) => ({ pid, ...p }))
    .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);

  const winner = ranked[0];
  const myRank = ranked.findIndex(p => p.pid === playerId) + 1;

  // Find highest accuracy player (first in accuracy-sorted list)
  const topAccPid = [...ranked].sort((a, b) => b.accuracy - a.accuracy)[0]?.pid ?? null;

  const handleShare = () => {
    const text = `I ranked #${myRank} in SpeedMath Titans with ${players[playerId]?.score ?? 0} pts! Room: ${roomCode}`;
    navigator.share?.({ title: 'SpeedMath Titans', text }).catch(() => {});
  };

  return (
    <div className="screen active">
      <div className="mp-result-card glass-card">

        {/* Header */}
        <div className="mp-result-header">
          <div>
            <div className="mp-result-title">Match Results</div>
            <div className="mp-result-room">Room #{roomCode}</div>
          </div>
          <button className="mp-share-btn" onClick={handleShare} title="Share">⬆</button>
        </div>

        {/* Winner section */}
        {winner && (
          <div className="mp-winner-section">
            <div className="mp-winner-trophy">🏆</div>
            <div
              className="mp-winner-avatar"
              style={{ background: AVATAR_COLORS[0] }}
            >
              {initials(winner.name)}
            </div>
            <div className="mp-winner-badge">Winner</div>
            <div className="mp-winner-name">{winner.name}</div>
            <div className="mp-winner-score">
              <span className="mp-winner-pts">{winner.score.toLocaleString()}</span>
              <span className="mp-winner-pts-label"> PTS</span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mp-lb-header">
          <span className="mp-lb-title">Leaderboard</span>
          <span className="mp-lb-tiebreak">ⓘ Accuracy breaks ties</span>
        </div>

        <div className="mp-leaderboard">
          {ranked.map((p, i) => {
            const rank   = i + 1;
            const isYou  = p.pid === playerId;
            const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const isWinner  = rank === 1;
            const isTopAcc  = p.pid === topAccPid;
            return (
              <div key={p.pid} className={`mp-lb-row${isYou ? ' is-you' : ''}${isWinner ? ' is-winner' : ''}`}>
                <div className={`mp-lb-rank${rank <= 3 ? ` top-${rank}` : ''}`}>
                  {rank}
                </div>
                <div className="mp-lb-avatar" style={{ background: color }}>
                  {initials(p.name)}
                </div>
                <div className="mp-lb-info">
                  <span className="mp-lb-name">
                    {isWinner && <span className="mp-lb-trophy">🏆</span>}
                    {p.name}
                    {isYou && <span className="mp-you-tag"> (You)</span>}
                  </span>
                  <span className="mp-lb-acc">
                    {isTopAcc && <span className="mp-lb-lightning">⚡</span>}
                    ✓ {p.accuracy}%
                  </span>
                </div>
                <div className={`mp-lb-score${isWinner ? ' mp-lb-score-winner' : ''}`}>
                  {p.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer message */}
        {winner && (
          <div className="mp-congrats">
            Congratulate the winner! Outstanding performance, {winner.name}! 🎉
          </div>
        )}

        <button className="btn-start mp-go-home-btn" onClick={onGoHome}>
          Go to Home
        </button>

      </div>
    </div>
  );
}
