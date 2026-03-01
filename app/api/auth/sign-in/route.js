export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'

export async function POST(req) {
  try {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      try {
        const o = new URL(origin)
        if (o.host !== host) {
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      }
    }

    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // minimal: rely on supabase response; avoid verbose debug logs in production

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
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
      const cookieDomain = process.env.SITE_COOKIE_DOMAIN
      const sameSiteSetting = 'lax'
      const baseCookieOptions = {
        httpOnly: true,
        path: '/',
        sameSite: sameSiteSetting,
        secure,
      }
      const cookieOptions = cookieDomain ? { ...baseCookieOptions, domain: cookieDomain } : baseCookieOptions

      // Access token cookie (used by server-side helpers)
      res.cookies.set('sb-access-token', session.access_token, {
        ...cookieOptions,
        maxAge,
      })

      // Refresh token cookie: 1 year so session only ends when admin clicks "Cerrar sesión"
      if (session.refresh_token) {
        res.cookies.set('sb-refresh-token', session.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 365,
        })
      }
    }

    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
