import { createClient } from '@supabase/supabase-js'
import { isSupabaseFullyBlocked } from './mode'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const blockedAuth = {
  signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase blocked') }),
  signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase blocked') }),
  signOut: async () => ({ error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

const supabase = isSupabaseFullyBlocked()
  ? { auth: blockedAuth }
  : createClient(supabaseUrl || '', supabaseAnonKey || '')

export default supabase

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password })
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
