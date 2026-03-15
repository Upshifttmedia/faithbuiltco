import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCommunity } from '../hooks/useCommunity'

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function CommunityFeed() {
  const { user } = useAuth()
  const { posts, myReactions, loading, posting, addPost, toggleReaction } = useCommunity(
    user?.id,
    user?.email
  )
  const [draft, setDraft] = useState('')
  const [charErr, setCharErr] = useState(false)
  const textRef = useRef(null)

  async function handlePost(e) {
    e.preventDefault()
    if (!draft.trim()) return
    if (draft.length > 200) { setCharErr(true); return }
    const ok = await addPost(draft)
    if (ok) setDraft('')
  }

  function handleDraftChange(e) {
    setDraft(e.target.value)
    setCharErr(false)
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Community</span>
        </div>
      </header>

      <main className="main-content">
        {/* Date */}
        <p className="today-date" style={{ marginBottom: 4 }}>{todayLabel}</p>
        <p className="section-heading" style={{ marginBottom: 0 }}>Today's Wins</p>

        {/* Post composer */}
        <form onSubmit={handlePost} className="post-composer">
          <div className="composer-inner">
            <div className="composer-avatar">
              {(user?.email?.split('@')[0] ?? 'A').slice(0, 1).toUpperCase()}
            </div>
            <textarea
              ref={textRef}
              className="composer-input"
              value={draft}
              onChange={handleDraftChange}
              placeholder="Share a win from today…"
              maxLength={200}
              rows={2}
              aria-label="Share a win"
            />
          </div>
          <div className="composer-footer">
            <span className={`composer-count ${draft.length > 180 ? 'composer-count--warn' : ''}`}>
              {draft.length}/200
            </span>
            {charErr && <span className="composer-err">Max 200 characters</span>}
            <button
              type="submit"
              className="btn-primary composer-post-btn"
              disabled={posting || !draft.trim()}
            >
              {posting ? '…' : 'Post'}
            </button>
          </div>
        </form>

        {/* Feed */}
        {loading ? (
          <div className="feed-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="feed-skeleton-card" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">🔥</p>
            <p className="feed-empty-title">Be the first today</p>
            <p className="feed-empty-body">No wins posted yet. Share yours and inspire the community.</p>
          </div>
        ) : (
          <div className="feed-list">
            {posts.map(post => {
              const reacted = myReactions.has(post.id)
              const isOwn = post.user_id === user?.id
              return (
                <div key={post.id} className={`post-card ${isOwn ? 'post-card--own' : ''}`}>
                  <div className="post-header">
                    <div className="post-avatar">
                      {post.author_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="post-meta">
                      <span className="post-author">
                        {post.author_name}
                        {isOwn && <span className="post-you"> · you</span>}
                      </span>
                      <span className="post-time">{timeAgo(post.created_at)}</span>
                    </div>
                  </div>

                  <p className="post-content">{post.content}</p>

                  <div className="post-footer">
                    <button
                      className={`react-btn ${reacted ? 'react-btn--active' : ''}`}
                      onClick={() => toggleReaction(post.id)}
                      aria-pressed={reacted}
                      aria-label={reacted ? 'Remove fire reaction' : 'React with fire'}
                    >
                      🔥
                      <span className="react-count">{post.fire_count > 0 ? post.fire_count : ''}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
