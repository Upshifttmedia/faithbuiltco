const TABS = [
  {
    key: 'today',
    label: 'Today',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {active
          ? <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor" stroke="none" />
          : <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        }
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill={active ? 'currentColor' : 'none'} />
        <line x1="16" y1="2" x2="16" y2="6" stroke={active ? '#0F0D0A' : 'currentColor'} />
        <line x1="8" y1="2" x2="8" y2="6" stroke={active ? '#0F0D0A' : 'currentColor'} />
        <line x1="3" y1="10" x2="21" y2="10" stroke={active ? '#0F0D0A' : 'currentColor'} />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={active ? 'currentColor' : 'none'} />
        <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
      </svg>
    ),
  },
]

export default function BottomNav({ activeTab, onTab }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`nav-tab ${activeTab === tab.key ? 'nav-tab--active' : ''}`}
          onClick={() => onTab(tab.key)}
          aria-label={tab.label}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          <span className="nav-icon">{tab.icon(activeTab === tab.key)}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
