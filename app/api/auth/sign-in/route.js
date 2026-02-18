export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // minimal: rely on supabase response; avoid verbose debug logs in production

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.log('DEBUG /api/auth/sign-in supabase signIn error', error.message || String(error))
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: error.status || 401 })
    }

    // no extra cookie inspection here

    // On success, set HttpOnly cookies so server-side checks can read the
    // access token (and refresh token) from subsequent requests.
    const session = data?.session || null

    const res = NextResponse.json({ user: data.user ?? null }, { status: 200 })

    if (session) {
      const secure = process.env.NODE_ENV === 'production'
      const maxAge = session.expires_in || 60 * 60 // fallback 1h
      const cookieDomain = process.env.SITE_COOKIE_DOMAIN || '.laguaridainstrumentos.com'
      const sameSiteSetting = secure ? 'none' : 'lax'

      // Access token cookie (used by server-side helpers)
      res.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        path: '/',
        sameSite: sameSiteSetting,
        secure,
        domain: cookieDomain,
        maxAge,
      })

      // Refresh token cookie (optional, helpful for later refresh flows)
      if (session.refresh_token) {
        res.cookies.set('sb-refresh-token', session.refresh_token, {
          httpOnly: true,
          path: '/',
          sameSite: sameSiteSetting,
          secure,
          domain: cookieDomain,
          // keep refresh token longer (7 days) as a reasonable default
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    }

    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
