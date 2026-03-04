/**
 * PlayWithFriendsModal
 * Bottom-sheet modal that appears when the user taps "Play with Friends".
 * Offers: Create a Room | Join a Room.
 */
export default function PlayWithFriendsModal({ onClose, onCreateRoom, onJoinRoom }) {
  return (
    <div className="mp-overlay" onClick={onClose}>
      <div className="mp-modal glass-card" onClick={e => e.stopPropagation()}>

        <button className="mp-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="mp-modal-icon">👥</div>
        <h2 className="mp-modal-title">Play with Friends</h2>
        <p className="mp-modal-sub">
          Challenge your friends to a speed math battle!<br />
          Create a private room or join an existing one.
        </p>

        <button className="btn-start mp-modal-create" onClick={onCreateRoom}>
          ＋ &nbsp;Create a room
        </button>

        <button className="mp-modal-join" onClick={onJoinRoom}>
          →&nbsp; Join a room
        </button>

      </div>
    </div>
  );
}
