import { useState } from 'react'
import LoginForm from '../components/Auth/LoginForm'
import SignupForm from '../components/Auth/SignupForm'
import ForgotPassword from '../components/Auth/ForgotPassword'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const { signIn, signUp, forgotPassword, resendConfirmation } = useAuth()

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo-mark">✦</div>
        <h1 className="logo-text">FaithBuilt</h1>
        <p className="logo-tagline">Discipline. Devotion. Daily.</p>
      </div>

      <div className="auth-card">
        {mode === 'login' && (
          <LoginForm
            onLogin={signIn}
            onSwitch={() => setMode('signup')}
            onForgot={() => setMode('forgot')}
            onResend={resendConfirmation}
          />
        )}
        {mode === 'signup' && (
          <SignupForm
            onSignup={signUp}
            onResend={resendConfirmation}
            onSwitch={() => setMode('login')}
          />
        )}
        {mode === 'forgot' && (
          <ForgotPassword
            onForgotPassword={forgotPassword}
            onBack={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}
