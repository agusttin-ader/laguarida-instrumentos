import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }

  // Use the anon key on the server side (do NOT use the service_role key here).
  // This client is safe for server components and route handlers where
  // you do not need elevated privileges.
  // Rely on the global `fetch` available on Node 18 / Next.js runtime.
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Get user info from an access token on the server. The token should be
// an access token issued by Supabase (not the service role key). This helper
// is safe to call in route handlers and server components, provided the
// token is supplied by the client (e.g. via Authorization header or cookie).
export async function getUserByAccessToken(accessToken) {
  if (!accessToken) return null
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(accessToken)
  if (error) throw error
  return data?.user ?? null
}

// Extract a token from a Request-like object (supports Next.js App Router
// Request or plain Node request objects). Tries `Authorization: Bearer` first
// then falls back to a couple cookie name conventions (see docs).
export async function getUserFromRequest(req) {
  let token

  try {
    // Try Authorization header (NextRequest or standard Request)
    const authHeader = req?.headers?.get ? req.headers.get('authorization') : req?.headers?.authorization || req?.headers?.Authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }

    // Fallback to cookie parsing (if cookies are present on the request)
    if (!token) {
      const cookieHeader = req?.headers?.get ? req.headers.get('cookie') : req?.headers?.cookie
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|; )supabaseAccessToken=([^;]+)/) || cookieHeader.match(/(?:^|; )sb-access-token=([^;]+)/)
        if (match) token = decodeURIComponent(match[1])
      }
    }
  } catch (err) {
    // ignore parsing errors
  }

  if (!token) return null
  return getUserByAccessToken(token)
}

export async function requireAuthFromRequest(req) {
  const user = await getUserFromRequest(req)
  if (!user) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  return user
}
