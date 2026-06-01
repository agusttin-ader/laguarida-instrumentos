import { createClient } from '@supabase/supabase-js'
import { isSupabaseFullyBlocked } from './mode'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function ensureConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase config in environment')
  }
}

function ensureAdminConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase admin config (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
}

export function getSupabaseServerClient(accessToken = null) {
  if (isSupabaseFullyBlocked()) {
    throw new Error('Supabase blocked by contingency mode')
  }
  ensureConfig()

  const clientOptions = {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  }

  if (accessToken) {
    clientOptions.global = { headers: { Authorization: `Bearer ${accessToken}` } }
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions)
}

export function getSupabaseAdminClient() {
  if (isSupabaseFullyBlocked()) {
    throw new Error('Supabase blocked by contingency mode')
  }
  ensureAdminConfig()
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  })
}
