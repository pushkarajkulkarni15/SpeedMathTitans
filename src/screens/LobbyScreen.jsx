import { useEffect, useState } from 'react';

/**
 * LobbyScreen — Waiting room for non-host players.
 * Shows an animated hourglass spinner and the room code.
 * Automatically transitions when the host starts the game
 * (parent watches room.status and navigates to mp-game).
 */
export default function LobbyScreen({ roomCode, onLeave }) {
  // Animate the spinner arc
  const [arc, setArc] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setArc(a => (a + 3) % 360), 30);
    return () => clearInterval(id);
  }, []);

  // SVG circle arc progress (0 → 360)
  const R  = 36;
  const C  = 2 * Math.PI * R;
  const pct = arc / 360;

  return (
    <div className="screen active">
      <div className="mp-lobby-card glass-card">

        {/* Header */}
        <div className="mp-room-header">
          <button className="mp-back-btn" onClick={onLeave}>← Back</button>
          <span className="mp-room-header-title">Lobby</span>
          <span />
        </div>

        <div className="mp-lobby-body">

          {/* Spinner */}
          <div className="mp-lobby-spinner">
            <svg width="90" height="90" viewBox="0 0 90 90">
              {/* Track */}
              <circle cx="45" cy="45" r={R} fill="none" stroke="rgba(124,108,248,0.15)" strokeWidth="5" />
              {/* Arc */}
              <circle
                cx="45" cy="45" r={R}
                fill="none"
                stroke="var(--indigo)"
                strokeWidth="5"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
            </svg>
            <span className="mp-lobby-spinner-icon">⏳</span>
          </div>

          <h2 className="mp-lobby-title">You're in!</h2>

          <div className="mp-lobby-msg">
            Waiting for host to start the game…
          </div>

          <div className="mp-lobby-room-wrap">
            <div className="mp-lobby-room-label">CURRENT ROOM</div>
            <div className="mp-lobby-room-code">{roomCode}</div>
          </div>

        </div>

        <button className="mp-leave-btn" onClick={onLeave}>Leave Room</button>

      </div>
    </div>
  );
}
