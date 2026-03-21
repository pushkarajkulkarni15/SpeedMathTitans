import { useState } from 'react';

/**
 * GameRoomScreen — Host lobby.
 * Shows the room code, duration picker (host settings), live player list,
 * and a "Start Game" button.
 */

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

const DURATION_OPTIONS = [
  { secs: 60,  label: '1 Min',  sub: 'BLITZ' },
  { secs: 120, label: '2 Min',  sub: 'STANDARD' },
  { secs: 180, label: '3 Min',  sub: 'ENDURANCE' },
];

export default function GameRoomScreen({
  roomCode, roomData, playerId, playerName,
  onStartGame, onChangeDuration, onLeave,
}) {
  const [copied,  setCopied]  = useState(false);
  const [starting, setStarting] = useState(false);

  if (!roomData) return (
    <div className="screen active">
      <div className="mp-room-card glass-card">
        <div className="mp-room-header">
          <button className="mp-back-btn" onClick={onLeave}>← Back</button>
          <span className="mp-room-header-title">Game Room</span>
          <span style={{ width: 32 }} />
        </div>
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--t3)' }}>
          Setting up room…
        </div>
      </div>
    </div>
  );

  const duration = roomData?.duration ?? 120;
  const players  = roomData?.players  ?? {};
  const entries  = Object.entries(players).sort(
    ([aid, a], [bid, b]) => a.joinedAt - b.joinedAt
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'SpeedMath Titans', text: `Join my room with code: ${roomCode}` }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try { await onStartGame(); } catch { setStarting(false); }
  };

  return (
    <div className="screen active">
      <div className="mp-room-card glass-card">

        {/* Header */}
        <div className="mp-room-header">
          <button className="mp-back-btn" onClick={onLeave}>← Back</button>
          <span className="mp-room-header-title">Game Room</span>
          <button className="mp-share-btn" onClick={handleShare} title="Share">⬆</button>
        </div>

        {/* Room code */}
        <div className="mp-code-section">
          <div className="mp-code-label">ROOM CODE</div>
          <div className="mp-code-display">{roomCode}</div>
          <div className="mp-code-hint">Share this code with friends to join</div>
          <button className="mp-copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        {/* Duration — host settings */}
        <div className="mp-section-row">
          <span className="mp-section-label">Duration</span>
          <span className="mp-host-badge">Host Settings</span>
        </div>
        <div className="mp-duration-options">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt.secs}
              className={`mp-dur-btn${duration === opt.secs ? ' selected' : ''}`}
              onClick={() => onChangeDuration(opt.secs)}
            >
              <span className="mp-dur-label">{opt.label}</span>
              <span className="mp-dur-sub">{opt.sub}</span>
            </button>
          ))}
        </div>

        {/* Players */}
        <div className="mp-section-row mp-players-header">
          <span className="mp-section-label">Players</span>
          <span className="mp-waiting-dot">● Waiting…</span>
        </div>
        <div className="mp-player-list">
          {entries.map(([pid, p]) => (
            <div key={pid} className="mp-player-row">
              <div className="mp-player-avatar">{initials(p.name)}</div>
              <div className="mp-player-info">
                <span className="mp-player-name">
                  {p.name}
                  {pid === playerId && <span className="mp-you-badge">You</span>}
                </span>
                <span className="mp-player-status">
                  {pid === roomData?.hostId ? 'Ready to start' : 'Joined'}
                </span>
              </div>
              <span className="mp-player-check">✓</span>
            </div>
          ))}
          {/* Ghost row */}
          <div className="mp-player-row mp-player-ghost">
            <div className="mp-player-avatar mp-avatar-ghost">?</div>
            <span className="mp-ghost-text">Waiting for players…</span>
          </div>
        </div>

        {/* Start */}
        <button
          className="btn-start mp-start-btn"
          onClick={handleStart}
          disabled={starting}
        >
          {starting ? 'Starting…' : '▶  Start Game'}
        </button>

      </div>
    </div>
  );
}
