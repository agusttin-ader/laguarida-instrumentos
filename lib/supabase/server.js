import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { headers, cookies } from 'next/headers'

// Create a Supabase client for server components that is aware of the
// incoming request cookies/headers. This lets the client read the
// authenticated session that the browser stored in cookies.
export function getSupabaseServerClient() {
  try {
    return createServerComponentClient({ headers, cookies })
  } catch (err) {
    throw new Error('Failed to create Supabase server client: ' + (err?.message || String(err)))
  }
}

// Get user info for the current session (reads cookies via next/headers).
export async function getUserFromRequest() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    // If no session exists, auth.getUser returns null user with no error in some cases.
    // Throw only if an actual error object is present.
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
