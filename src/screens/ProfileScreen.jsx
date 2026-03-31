import { useState } from 'react';
import { signOut } from '../firebase/auth';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

function getLevel(gamesPlayed = 0) {
  return Math.max(1, Math.floor(gamesPlayed / 5) + 1);
}

function getRank(level) {
  if (level >= 21) return 'Math Titan';
  if (level >= 11) return 'Math Wizard';
  if (level >= 6)  return 'Calculator';
  return 'Beginner';
}

export default function ProfileScreen({ user, isGuest, guestName, onSignOut, onGoHome, userData }) {
  const [signingOut, setSigningOut] = useState(false);

  const stats   = userData;
  const loading = user && !userData;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      onSignOut();
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = isGuest ? (guestName || 'Guest') : (user?.displayName || 'Player');
  const level = getLevel(stats?.gamesPlayed);
  const rank  = getRank(level);

  return (
    <div className="screen active">
      <div className="glass-card profile-card">

        {/* Top bar */}
        <div className="profile-topbar">
          <button className="profile-back-btn" onClick={onGoHome}>← Back</button>
          <span className="profile-topbar-title">My Profile</span>
          <span style={{ width: 60 }} />
        </div>

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          {isGuest ? (
            <div className="user-avatar-init profile-avatar">{(guestName || 'G')[0].toUpperCase()}</div>
          ) : user?.photoURL ? (
            <img className="user-avatar profile-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="user-avatar-init profile-avatar">{initials(user?.displayName)}</div>
          )}
        </div>

        <div className="profile-name">{displayName}</div>
        {!isGuest && (
          <div className="profile-rank">Level {level} &bull; {rank}</div>
        )}

        {/* Stats row */}
        <div className="profile-stats-row">
          <div className="ps-cell">
            <div className="ps-v">{loading ? '…' : (stats?.highScore ?? '—')}</div>
            <div className="ps-l">High Score</div>
          </div>
          <div className="ps-cell">
            <div className="ps-v">{loading ? '…' : (stats?.gamesPlayed ?? '—')}</div>
            <div className="ps-l">Games</div>
          </div>
          <div className="ps-cell">
            <div className="ps-v">
              {loading ? '…' : (stats?.bestAccuracy != null ? `${stats.bestAccuracy}%` : '—')}
            </div>
            <div className="ps-l">Accuracy</div>
          </div>
        </div>

        {/* Account Details */}
        {!isGuest && (
          <>
            <div className="profile-section-label">Account Details</div>
            <div className="profile-detail-list">
              <div className="pd-row">
                <span className="pd-key">Display Name</span>
                <span className="pd-val">{user?.displayName || '—'}</span>
              </div>
              <div className="pd-row">
                <span className="pd-key">Email</span>
                <span className="pd-val pd-locked">{user?.email || '—'}</span>
              </div>
              <div className="pd-row pd-disabled">
                <span className="pd-key">Change Password</span>
                <span className="pd-val pd-locked">Coming soon</span>
              </div>
            </div>
          </>
        )}

        {isGuest && (
          <div className="profile-guest-banner">
            Sign in to track your progress and unlock all features
          </div>
        )}

        {/* Sign out / sign in */}
        {!isGuest ? (
          <button className="btn-signout-full" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Log Out'}
          </button>
        ) : (
          <button className="btn-signout-full btn-signin-prompt" onClick={onSignOut}>
            Sign In to Save Progress
          </button>
        )}

      </div>
    </div>
  );
}
