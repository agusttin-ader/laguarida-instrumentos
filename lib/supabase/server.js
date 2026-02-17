import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { headers, cookies } from 'next/headers'

// Create a Supabase client for server usage that is aware of request
// cookies/headers. We pass server-side env vars to create the client here
// (these keys are not exposed to the browser).
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }

  try {
    return createServerClient(supabaseUrl, supabaseKey, { headers, cookies })
  } catch (err) {
    throw new Error('Failed to create Supabase server client: ' + (err?.message || String(err)))
  }
}

// Get user info for the current session (reads cookies via next/headers).
export async function getUserFromRequest() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw error
  }
  return data?.user ?? null
}

export async function requireAuthFromRequest() {
  const user = await getUserFromRequest()
  if (!user) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  return user
}
