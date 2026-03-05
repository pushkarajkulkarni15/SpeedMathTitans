import { useEffect, useState } from 'react';
import { loadUserData, loadGameHistory } from '../firebase/firestore';

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60)     return 'Just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString();
}

function durLabel(secs) { return `${Math.round(secs / 60)} min`; }

const CHART_W = 300, CHART_H = 90, BAR_PAD = 6;

export default function StatsScreen({ user, isGuest }) {
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([loadUserData(user.uid), loadGameHistory(user.uid)])
      .then(([ud, gh]) => { setStats(ud); setHistory(gh); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const scoreGames = history.slice(0, 5).reverse(); // oldest → newest
  const maxScore   = Math.max(...scoreGames.map(g => g.score), 1);

  return (
    <div className="screen active">
      <div className="stats-page glass-card">

        <div className="sp-header">
          <h1 className="sp-title">Your Stats</h1>
        </div>

        {/* Hero card */}
        <div className="sp-hero">
          <div className="sp-hero-label">All-Time High Score</div>
          <div className="sp-hero-value">{loading ? '…' : (stats?.highScore ?? '—')}</div>
        </div>

        {/* 2×2 grid */}
        <div className="sp-grid">
          <div className="sp-cell sp-cell-gold">
            <div className="spc-v">{loading ? '…' : (stats?.highScore ?? '—')}</div>
            <div className="spc-l">High Score</div>
          </div>
          <div className="sp-cell">
            <div className="spc-v">{loading ? '…' : (stats?.gamesPlayed ?? '—')}</div>
            <div className="spc-l">Total Games</div>
          </div>
          <div className="sp-cell sp-cell-green">
            <div className="spc-v">
              {loading ? '…' : (stats?.bestAccuracy != null ? `${stats.bestAccuracy}%` : '—')}
            </div>
            <div className="spc-l">Best Accuracy</div>
          </div>
          <div className="sp-cell">
            <div className="spc-v">{loading ? '…' : (stats?.bestStreak ?? '—')}</div>
            <div className="spc-l">Best Streak</div>
          </div>
        </div>

        {/* Last 5 games score chart */}
        <div className="sp-chart-label">Last 5 Games — Score</div>
        {isGuest ? (
          <div className="sp-guest-msg">Sign in to see your score history</div>
        ) : !loading && scoreGames.length === 0 ? (
          <div className="sp-guest-msg">Play some games to see your scores here</div>
        ) : (
          <div className="sp-chart-wrap">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
              preserveAspectRatio="none"
              className="sp-chart-svg"
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#a78bfa" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7c6cf8" stopOpacity="1" />
                </linearGradient>
              </defs>
              {scoreGames.map((game, i) => {
                const n       = scoreGames.length;
                const barW    = (CHART_W - BAR_PAD * (n + 1)) / n;
                const x       = BAR_PAD + i * (barW + BAR_PAD);
                const barH    = Math.max((game.score / maxScore) * (CHART_H - 18), 4);
                const y       = CHART_H - barH;
                const labelX  = x + barW / 2;
                return (
                  <g key={game.id ?? i}>
                    <rect x={x} y={y} width={barW} height={barH}
                      fill="url(#barGrad)" rx="4" ry="4" />
                    <text x={labelX} y={y - 4} textAnchor="middle"
                      fontSize="9" fill="#a78bfa" fontWeight="600">
                      {game.score}
                    </text>
                    <text x={labelX} y={CHART_H + 13} textAnchor="middle"
                      fontSize="9" fill="#6b7280">
                      G{i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Recent games */}
        <div className="sp-section-label">Recent Games</div>
        {isGuest && <div className="sp-guest-msg">Sign in to see your game history</div>}
        {!isGuest && !loading && history.length === 0 && (
          <div className="sp-guest-msg">No games yet — play your first!</div>
        )}
        {!isGuest && history.map(game => {
          const ts = game.timestamp?.toDate?.() ?? (game.timestamp ? new Date(game.timestamp) : null);
          return (
            <div key={game.id} className="hist-row">
              <span className="hist-when">{ts ? timeAgo(ts) : '—'}</span>
              <span className="hist-dur">{durLabel(game.duration)}</span>
              <span className="hist-info">
                <span className="hist-score">{game.score} pts</span>
                &nbsp;·&nbsp;{game.solved} solved&nbsp;·&nbsp;{game.accuracy}%
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
