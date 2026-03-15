import { useState } from 'react'
import LoginForm from '../components/Auth/LoginForm'
import SignupForm from '../components/Auth/SignupForm'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const { signIn, signUp } = useAuth()

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo-mark">✦</div>
        <h1 className="logo-text">FaithBuilt</h1>
        <p className="logo-tagline">Discipline. Devotion. Daily.</p>
      </div>

      <div className="auth-card">
        {mode === 'login' ? (
          <LoginForm
            onLogin={signIn}
            onSwitch={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSignup={signUp}
            onSwitch={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}
