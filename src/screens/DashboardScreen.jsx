import { useEffect, useState } from 'react';
import { loadUserData, loadGameHistory } from '../firebase/firestore';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60)     return 'Just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString();
}

function durLabel(secs) {
  return `${Math.round(secs / 60)} min`;
}

const TIME_OPTIONS = [60, 120, 180, 300];

export default function DashboardScreen({
  user,
  selectedSecs,
  onSelectTime,
  onPlay,
  onSignOut,
}) {
  const [stats, setStats]     = useState(null);   // user doc data
  const [history, setHistory] = useState([]);      // game history rows
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      loadUserData(user.uid),
      loadGameHistory(user.uid),
    ]).then(([userData, gameHistory]) => {
      setStats(userData);
      setHistory(gameHistory);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const isGuest = !user;

  return (
    <div className="screen active">
      <div className="glass-card dash-card">

        {/* ── User header ─────────────────────── */}
        <div className="dash-header">
          {isGuest ? (
            <div className="user-avatar-init">?</div>
          ) : user.photoURL ? (
            <img
              className="user-avatar"
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="user-avatar-init">{initials(user.displayName)}</div>
          )}

          <div className="user-info">
            <div className="user-name">{isGuest ? 'Guest' : (user.displayName || 'User')}</div>
            <div className="user-email">{isGuest ? 'Not signed in' : (user.email || '')}</div>
          </div>

          {!isGuest && (
            <button className="btn-logout" onClick={onSignOut}>Sign out</button>
          )}
        </div>

        <div className="dash-body">

          {/* ── Guest banner ─────────────────── */}
          {isGuest && (
            <div className="dash-guest-banner">
              <span>Sign in to save your progress and track stats</span>
            </div>
          )}

          {/* ── Stats ────────────────────────── */}
          <div className="s-label">Your stats</div>
          <div className="dash-stats">
            <div className="dash-stat">
              <div className="dsv">{loading ? '…' : (stats?.highScore ?? '—')}</div>
              <div className="dsl">High Score</div>
            </div>
            <div className="dash-stat">
              <div className="dsv">{loading ? '…' : (stats?.gamesPlayed ?? '—')}</div>
              <div className="dsl">Games</div>
            </div>
            <div className="dash-stat">
              <div className="dsv">
                {loading ? '…' : (stats?.bestAccuracy != null ? `${stats.bestAccuracy}%` : '—')}
              </div>
              <div className="dsl">Best Acc.</div>
            </div>
            <div className="dash-stat">
              <div className="dsv">{loading ? '…' : (stats?.bestStreak ?? '—')}</div>
              <div className="dsl">Best Streak</div>
            </div>
          </div>

          {/* ── Time selector ────────────────── */}
          <div className="s-label">Choose your time limit</div>
          <div className="time-options">
            {TIME_OPTIONS.map(secs => (
              <div
                key={secs}
                className={`time-opt${selectedSecs === secs ? ' selected' : ''}`}
                onClick={() => onSelectTime(secs)}
              >
                <div className="t-val">{secs / 60}</div>
                <div className="t-lbl">min</div>
              </div>
            ))}
          </div>

          {/* ── Play button ──────────────────── */}
          <button className="btn-start" onClick={onPlay}>⚡ &nbsp;Play</button>

          {/* ── Game history ─────────────────── */}
          <div className="s-label" style={{ marginTop: '24px', marginBottom: '8px' }}>
            Recent games
          </div>

          {loading ? (
            <div className="history-empty">Loading…</div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              {isGuest ? 'Sign in to see your game history' : 'No games yet — play your first!'}
            </div>
          ) : (
            history.map((game) => {
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
            })
          )}

        </div>
      </div>
    </div>
  );
}
