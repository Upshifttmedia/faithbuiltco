import { useState } from 'react'

export default function ResetPassword({ onResetPassword }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await onResetPassword(password)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="reset-overlay">
        <div className="auth-form">
          <div className="auth-success">
            <div className="success-icon">✦</div>
            <h2 className="auth-title">Password Updated</h2>
            <p className="auth-subtitle">Your password has been changed. You're all set.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-overlay">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="success-icon">✦</div>
        <h2 className="auth-title">Set New Password</h2>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="field-group">
          <label className="field-label">New Password</label>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="field-group">
          <label className="field-label">Confirm Password</label>
          <input
            type="password"
            className="field-input"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
