import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keep users logged in across sessions and app restarts
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
    // Explicit storage key — prevents eviction issues on iOS PWA / Safari
    storageKey: 'faithbuilt-auth-token',
  },
})
