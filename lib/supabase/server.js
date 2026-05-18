import { createClient } from '@supabase/supabase-js'
import { SUPABASE_BLOCKED } from './mode'

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

// Server Supabase client factory. Accepts an optional access token and
// returns a `@supabase/supabase-js` client configured for server usage.
export function getSupabaseServerClient(accessToken = null) {
  if (SUPABASE_BLOCKED) {
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

// Service-role client for privileged server-side operations (never expose to client).
export function getSupabaseAdminClient() {
  if (SUPABASE_BLOCKED) {
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
