import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import DailyCheckIn from './pages/DailyCheckIn'
import History from './pages/History'
import Profile from './pages/Profile'
import BottomNav from './components/Nav/BottomNav'

// Pages that belong to the "Today" tab
const TODAY_PAGES = ['dashboard', 'checkin']

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  function navigate(to) {
    setPage(to)
  }

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
        {page === 'profile'   && <Profile navigate={navigate} />}
      </div>
      <BottomNav activeTab={activeTab} onTab={handleTabPress} />
    </div>
  )
}
