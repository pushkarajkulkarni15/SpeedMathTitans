function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const MODE_CARDS = [
  { secs: 60,  label: 'Blitz',    sub: '1 minute',  tag: 'FAST',      cls: 'orange' },
  { secs: 120, label: 'Standard', sub: '2 minutes', tag: 'CLASSIC',   cls: 'indigo' },
  { secs: 180, label: 'Marathon', sub: '3 minutes', tag: 'ENDURANCE', cls: 'purple' },
  { secs: 300, label: 'Pro Mode', sub: '5 minutes', tag: 'PRO',       cls: 'gold'   },
];

export default function HomeScreen({ user, isGuest, selectedSecs, onSelectTime, onPlay, onPlayWithFriends, userData }) {
  const stats   = userData;
  const loading = user && !userData;

  const displayName = isGuest ? 'Guest' : (user?.displayName || 'Challenger');
  const firstName   = displayName.split(' ')[0];

  return (
    <div className="screen active">
      <div className="home-card glass-card">

        {/* Header */}
        <div className="home-header">
          <div className="home-greeting">
            <div className="home-sub">{greeting()},</div>
            <div className="home-name">{firstName} 👋</div>
          </div>
          {isGuest ? (
            <div className="user-avatar-init home-avatar">?</div>
          ) : user?.photoURL ? (
            <img className="user-avatar home-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="user-avatar-init home-avatar">{initials(user?.displayName)}</div>
          )}
        </div>

        {/* High score card */}
        <div className="home-score-card">
          <div className="hsc-label">All-Time High Score</div>
          <div className="hsc-value">{loading ? '…' : (stats?.highScore ?? '—')}</div>
          <div className="hsc-sub">
            {loading ? '' : (stats?.gamesPlayed ? `${stats.gamesPlayed} games played` : 'Play your first game!')}
          </div>
        </div>

        {/* Guest banner */}
        {isGuest && (
          <div className="home-guest-banner">
            Sign in to save your progress and track your stats
          </div>
        )}

        {/* Mode selector */}
        <div className="home-section-label">Select Duration</div>
        <div className="mode-cards">
          {MODE_CARDS.map(m => (
            <div
              key={m.secs}
              className={`mode-card mc-${m.cls}${selectedSecs === m.secs ? ' selected' : ''}`}
              onClick={() => onSelectTime(m.secs)}
            >
              <div className="mc-tag">{m.tag}</div>
              <div className="mc-label">{m.label}</div>
              <div className="mc-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Play */}
        <button className="btn-start home-play-btn" onClick={onPlay}>
          ⚡ &nbsp;Play Now
        </button>

        {/* Play with Friends */}
        <button className="btn-friends btn-friends-active" onClick={onPlayWithFriends}>
          👥 &nbsp;Play with Friends
        </button>

      </div>
    </div>
  );
}
