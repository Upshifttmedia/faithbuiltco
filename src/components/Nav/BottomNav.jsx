const TABS = [
  {
    key: 'today',
    label: 'Today',
    icon: active => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon
          points="12,3 2,9 12,15 22,9"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
        />
        <polyline points="2,14 12,20 22,14" stroke="currentColor" />
        <polyline points="2,17 12,23 22,17" stroke="currentColor" />
      </svg>
    ),
  },
  {
    key: 'community',
    label: 'Community',
    icon: active => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9"  cy="7"  r="4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
        <circle cx="17" cy="9"  r="3" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
        <path d="M1 21v-1a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v1" stroke="currentColor" fill="none" />
        <path d="M17 21v-1a5 5 0 0 0-2-4" stroke="currentColor" fill="none" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    icon: active => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
        <line x1="16" y1="2" x2="16" y2="6" stroke={active ? '#0F0D0A' : 'currentColor'} />
        <line x1="8"  y1="2" x2="8"  y2="6" stroke={active ? '#0F0D0A' : 'currentColor'} />
        <line x1="3"  y1="10" x2="21" y2="10" stroke={active ? '#0F0D0A' : 'currentColor'} />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: active => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
        <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" />
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
