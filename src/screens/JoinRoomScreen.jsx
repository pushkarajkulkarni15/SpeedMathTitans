import { useState, useRef } from 'react';

/**
 * JoinRoomScreen — Enter a 6-character room code.
 * Individual letter boxes with auto-advance, paste support.
 */
export default function JoinRoomScreen({ onJoin, onCreateRoom, onBack, error, isLoading }) {
  const [chars, setChars] = useState(Array(6).fill(''));
  const boxRefs = useRef([]);

  const code = chars.join('').toUpperCase();

  const updateChar = (index, value) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    const next  = [...chars];
    next[index] = clean;
    setChars(next);
    if (clean && index < 5) {
      boxRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (chars[index]) {
        updateChar(index, '');
      } else if (index > 0) {
        const prev = [...chars];
        prev[index - 1] = '';
        setChars(prev);
        boxRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      boxRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      boxRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
      const next = Array(6).fill('');
      [...clean].forEach((c, i) => { next[i] = c; });
      setChars(next);
      boxRefs.current[Math.min(clean.length, 5)]?.focus();
    } catch {
      // Clipboard read denied — user can type manually
    }
  };

  const handleJoin = () => {
    if (code.length === 6 && !isLoading) onJoin(code);
  };

  return (
    <div className="screen active">
      <div className="mp-join-card glass-card">

        {/* Header */}
        <div className="mp-room-header">
          <button className="mp-back-btn" onClick={onBack}>← Back</button>
          <span className="mp-room-header-title">Join Game</span>
          <span />
        </div>

        <div className="mp-join-body">
          <h2 className="mp-join-title">Enter Room Code</h2>
          <p className="mp-join-sub">Ask your friend for the 6-digit game ID to start the battle.</p>

          {/* 6 individual boxes */}
          <div className="mp-code-boxes">
            {chars.map((ch, i) => (
              <input
                key={i}
                ref={el => (boxRefs.current[i] = el)}
                className={`mp-code-box${ch ? ' filled' : ''}`}
                type="text"
                inputMode="text"
                maxLength={2}
                value={ch}
                onChange={e => updateChar(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => e.target.select()}
                autoCapitalize="characters"
                autoComplete="off"
              />
            ))}
          </div>

          <button className="mp-paste-btn" onClick={handlePaste}>
            📋 Paste Code
          </button>

          {error && <div className="mp-error-msg">{error}</div>}

          <button
            className="btn-start mp-join-btn"
            onClick={handleJoin}
            disabled={code.length < 6 || isLoading}
          >
            {isLoading ? 'Joining…' : 'Join Room →'}
          </button>

          <div className="mp-create-link">
            Don't have a code?{' '}
            <button className="mp-link-btn" onClick={onCreateRoom}>Create a Room</button>
          </div>
        </div>

      </div>
    </div>
  );
}
