import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey, hasSupabasePublicConfig, SUPABASE_CONFIG_HINT } from './config'
import { isSupabaseFullyBlocked } from './mode'

const missingConfigError = new Error(SUPABASE_CONFIG_HINT)

const blockedAuth = {
  signInWithPassword: async () => ({
    data: { user: null, session: null },
    error: isSupabaseFullyBlocked()
      ? new Error('Supabase blocked')
      : missingConfigError,
  }),
  signUp: async () => ({
    data: { user: null, session: null },
    error: isSupabaseFullyBlocked()
      ? new Error('Supabase blocked')
      : missingConfigError,
  }),
  signOut: async () => ({ error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

const supabase =
  isSupabaseFullyBlocked() || !hasSupabasePublicConfig()
    ? { auth: blockedAuth }
    : createClient(getSupabaseUrl(), getSupabaseAnonKey())

export default supabase

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  return session
}