const TABS = [
  { id: 'home',    label: 'Home',    icon: '⚡' },
  { id: 'stats',   label: 'Stats',   icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`bnav-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="bnav-icon">{t.icon}</span>
          <span className="bnav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
