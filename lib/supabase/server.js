import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function ensureConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase config in environment')
  }
}

// Server Supabase client factory. Accepts an optional access token and
// returns a `@supabase/supabase-js` client configured for server usage.
export function getSupabaseServerClient(accessToken = null) {
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
