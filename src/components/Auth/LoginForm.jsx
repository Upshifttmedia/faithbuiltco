import { useState } from 'react'

// Supabase returns this exact string when email hasn't been confirmed yet
const UNCONFIRMED_MSG = 'Email not confirmed'

export default function LoginForm({ onLogin, onSwitch, onForgot, onResend }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm]   = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNeedsConfirm(false)
    setLoading(true)
    const { error } = await onLogin(email, password)
    if (error) {
      if (error.message.includes(UNCONFIRMED_MSG)) {
        setNeedsConfirm(true)
      } else {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  async function handleResend() {
    setResendLoading(true)
    await onResend?.(email)
    setResendLoading(false)
    setResendSent(true)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to continue your journey</p>

      {error && <div className="auth-error">{error}</div>}

      {needsConfirm && (
        <div className="auth-confirm-notice">
          <p>
            <strong>Your email isn't confirmed yet.</strong> Check your inbox for the
            confirmation link we sent when you signed up.
          </p>
          {resendSent ? (
            <p className="auth-confirm-resent">
              ✓ Resent! Check your inbox (and spam folder).
            </p>
          ) : (
            <button
              type="button"
              className="link-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'Resend confirmation email'}
            </button>
          )}
        </div>
      )}

      <div className="field-group">
        <label className="field-label">Email</label>
        <input
          type="email"
          className="field-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="field-group">
        <label className="field-label">Password</label>
        <input
          type="password"
          className="field-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <button type="button" className="link-btn forgot-link" onClick={onForgot}>
          Forgot password?
        </button>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="auth-switch">
        No account?{' '}
        <button type="button" className="link-btn" onClick={onSwitch}>
          Create one
        </button>
      </p>
    </form>
  )
}
