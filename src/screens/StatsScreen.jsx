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

const DUMMY_ACC   = [65, 78, 55, 82, 70, 88, 75];
const CHART_DAYS  = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const W = 300, H = 72, PAD = 4;

function buildPoints(values) {
  const step = (W - PAD * 2) / Math.max(values.length - 1, 1);
  return values.map((v, i) => ({
    x: PAD + i * step,
    y: H - PAD - (v / 100) * (H - PAD * 2),
    v,
  }));
}

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

  const accValues = history.length >= 2
    ? history.slice(0, 7).map(g => g.accuracy).reverse()
    : DUMMY_ACC;
  const pts = buildPoints(accValues);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H + 4} L${pts[0].x.toFixed(1)},${H + 4} Z`;

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

        {/* Accuracy trend chart */}
        <div className="sp-chart-label">Accuracy Trend</div>
        {isGuest ? (
          <div className="sp-guest-msg">Sign in to see your accuracy trend</div>
        ) : (
          <div className="sp-chart-wrap">
            <svg
              viewBox={`0 0 ${W} ${H + 4}`}
              preserveAspectRatio="none"
              className="sp-chart-svg"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#7c6cf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c6cf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#chartGrad)" />
              <path d={line} fill="none" stroke="#7c6cf8" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3"
                  fill="#7c6cf8" stroke="#070710" strokeWidth="1.5" />
              ))}
            </svg>
            <div className="sp-chart-days">
              {CHART_DAYS.slice(0, pts.length).map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
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
