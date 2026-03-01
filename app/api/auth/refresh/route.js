export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const ACCESS_TOKEN_MAX_AGE = 60 * 60 // 1h (Supabase JWT expiry)

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const refreshCookie =
      typeof cookieStore.get === 'function' ? cookieStore.get('sb-refresh-token') : null
    const refreshToken = refreshCookie?.value || null
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data?.session) {
      return NextResponse.json({ error: error?.message || 'Refresh failed' }, { status: 401 })
    }

    const session = data.session
    const secure = process.env.NODE_ENV === 'production'
    const cookieDomain = process.env.SITE_COOKIE_DOMAIN
    const sameSiteSetting = 'lax'
    const baseCookieOptions = {
      httpOnly: true,
      path: '/',
      sameSite: sameSiteSetting,
      secure,
    }
    const cookieOptions = cookieDomain ? { ...baseCookieOptions, domain: cookieDomain } : baseCookieOptions

    const res = NextResponse.json({ ok: true }, { status: 200 })
    res.cookies.set('sb-access-token', session.access_token, {
      ...cookieOptions,
      maxAge: session.expires_in || ACCESS_TOKEN_MAX_AGE,
    })
    if (session.refresh_token) {
      res.cookies.set('sb-refresh-token', session.refresh_token, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
    }

    return res
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
