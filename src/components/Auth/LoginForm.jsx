import { useState } from 'react'

export default function LoginForm({ onLogin, onSwitch, onForgot }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await onLogin(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to continue your journey</p>

      {error && <div className="auth-error">{error}</div>}

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
