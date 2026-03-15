import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useNotifications } from './hooks/useNotifications'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import DailyCheckIn from './pages/DailyCheckIn'
import History from './pages/History'
import Profile from './pages/Profile'
import CommunityFeed from './pages/CommunityFeed'
import BottomNav from './components/Nav/BottomNav'
import NotificationPrompt from './components/Community/NotificationPrompt'

// Pages that belong to the "Today" tab
const TODAY_PAGES = ['dashboard', 'checkin']

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  const { showPrompt, reminderTime, requestAndSave, dismissPrompt } =
    useNotifications(user?.id)

  function navigate(to) { setPage(to) }

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-icon">✦</div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  const activeTab = TODAY_PAGES.includes(page) ? 'today' : page

  function handleTabPress(tab) {
    if (tab === 'today') navigate('dashboard')
    else navigate(tab)
  }

  return (
    <div className="app-root">
      <div className="page-area">
        {page === 'dashboard' && <Dashboard navigate={navigate} userId={user.id} />}
        {page === 'checkin'   && <DailyCheckIn navigate={navigate} userId={user.id} />}
        {page === 'history'   && <History userId={user.id} />}
        {page === 'community' && <CommunityFeed />}
        {page === 'profile'   && <Profile navigate={navigate} />}
      </div>

      <BottomNav activeTab={activeTab} onTab={handleTabPress} />

      {/* First-time notification setup prompt */}
      {showPrompt && (
        <NotificationPrompt
          reminderTime={reminderTime}
          onSave={requestAndSave}
          onDismiss={dismissPrompt}
        />
      )}
    </div>
  )
}
