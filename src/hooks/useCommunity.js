import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCommunity(userId, userEmail) {
  const [posts, setPosts] = useState([])
  const [myReactions, setMyReactions] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const authorName = userEmail?.split('@')[0] ?? 'Anonymous'

  const fetchPosts = useCallback(async () => {
    if (!userId) return

    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*')
      .eq('post_date', today)
      .order('fire_count', { ascending: false })
      .order('created_at', { ascending: false })

    if (postsData) {
      setPosts(postsData)

      const ids = postsData.map(p => p.id)
      if (ids.length > 0) {
        const { data: reactions } = await supabase
          .from('post_reactions')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', ids)

        setMyReactions(new Set(reactions?.map(r => r.post_id) || []))
      } else {
        setMyReactions(new Set())
      }
    }
    setLoading(false)
  }, [userId, today])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  async function addPost(content) {
    if (!content.trim() || posting) return
    setPosting(true)

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        author_name: authorName,
        content: content.trim().slice(0, 200),
        post_date: today,
        fire_count: 0,
      })
      .select()
      .single()

    if (!error && data) {
      setPosts(prev => [data, ...prev])
    }
    setPosting(false)
    return !error
  }

  async function toggleReaction(postId) {
    const hasReacted = myReactions.has(postId)

    // Optimistic update
    setMyReactions(prev => {
      const next = new Set(prev)
      hasReacted ? next.delete(postId) : next.add(postId)
      return next
    })
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, fire_count: p.fire_count + (hasReacted ? -1 : 1) }
          : p
      )
    )

    if (hasReacted) {
      // Remove reaction
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
      await supabase
        .from('community_posts')
        .update({ fire_count: posts.find(p => p.id === postId)?.fire_count - 1 })
        .eq('id', postId)
    } else {
      // Add reaction
      await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: userId })
      await supabase
        .from('community_posts')
        .update({ fire_count: posts.find(p => p.id === postId)?.fire_count + 1 })
        .eq('id', postId)
    }
  }

  return { posts, myReactions, loading, posting, addPost, toggleReaction, refetch: fetchPosts }
}
