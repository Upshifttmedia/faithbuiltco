/**
 * Toast — top-of-screen notification banner.
 *
 * Props:
 *   message   string   Text to display
 *   type      'error' | 'success'   Controls border colour
 *   onDismiss fn       Called after 3 s (auto) or immediately on tap
 *
 * Usage:
 *   const [toast, setToast] = useState(null)
 *   // show:    setToast({ message: 'Oops!', type: 'error' })
 *   // dismiss: setToast(null)
 *   {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
 */
import { useEffect } from 'react'

const BORDER = {
  error:   '#C9A84C',   // gold
  success: '#4DD9C0',   // teal
}

const CSS = `
  @keyframes toast-slide-down {
    from { transform: translateY(-110%); opacity: 0 }
    to   { transform: translateY(0);     opacity: 1 }
  }
`

export default function Toast({ message, type = 'error', onDismiss }) {
  // Auto-dismiss after 3 s
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <>
      <style>{CSS}</style>
      <div
        onClick={onDismiss}
        role="alert"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9999,
          padding: '16px 20px',
          background: '#1a1a1a',
          borderBottom: `2px solid ${BORDER[type] ?? BORDER.error}`,
          color: '#fff',
          fontSize: 14,
          lineHeight: 1.5,
          textAlign: 'center',
          animation: 'toast-slide-down 0.25s ease both',
          boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {message}
      </div>
    </>
  )
}
