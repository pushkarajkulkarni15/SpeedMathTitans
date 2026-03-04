import { useState } from 'react';
import { signInWithGoogle } from '../firebase/auth';

export default function AuthScreen({ onSignIn, onPlayAsGuest }) {
  const [tab,      setTab]      = useState('login'); // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const switchTab = (t) => { setTab(t); setError(''); };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in App.jsx fires and routes to home
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = (e) => {
    e.preventDefault();
    setError('Email/password auth coming soon. Please use Google sign-in.');
  };

  return (
    <div className="screen active">
      <div className="glass-card auth-card">

        <div className="logo-icon">⚡</div>
        <div className="logo-title">SpeedMath Titans</div>
        <p className="logo-sub">Race the clock. Master the math.</p>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login'  ? ' active' : ''}`} onClick={() => switchTab('login')}>Login</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
        </div>

        {/* Email/password form */}
        <form className="auth-form" onSubmit={handleEmailAuth}>
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Your display name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-pwd-wrap">
              <input
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {tab === 'login' && (
            <div className="auth-forgot-wrap">
              <button type="button" className="auth-forgot-btn">Forgot Password?</button>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-start auth-submit-btn" disabled={loading}>
            {tab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider"><span>Or continue with</span></div>

        {/* Google */}
        <button className="btn-google" onClick={handleGoogleSignIn} disabled={loading}>
          <svg className="g-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p className="auth-terms">
          By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>
        </p>

        <button className="btn-guest" onClick={onPlayAsGuest}>
          Play as Guest
        </button>

      </div>
    </div>
  );
}
