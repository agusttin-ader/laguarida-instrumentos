export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'
import { cookies, headers } from 'next/headers'

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 365
const ACCESS_TOKEN_MAX_AGE = 60 * 60

export async function GET() {
  try {
    const requestHeaders = await headers()
    const cookieStore = await cookies()
    const tokenCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-access-token') : null
    const accessToken = tokenCookie?.value || requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '') || null
    const refreshCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-refresh-token') : null
    const refreshToken = refreshCookie?.value || null

    let user = null
    if (accessToken) {
      try {
        const supabase = getSupabaseServerClient(accessToken)
        const { data, error } = await supabase.auth.getUser()
        if (!error && data?.user) user = data.user
      } catch {
        // ignore
      }
    }

    if (!user && refreshToken) {
      try {
        const supabase = getSupabaseServerClient()
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
        if (!error && data?.session?.user) {
          user = data.session.user
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
          const res = NextResponse.json({
            authenticated: true,
            user: { id: user.id, email: user.email || null },
          })
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
        }
      } catch {
        // ignore
      }
    }

    if (user) {
      return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email || null } })
    }

    // If no user, return cookie names we can inspect for debugging (no values)
    let cookieNames = []
    try {
      const cookieStore = await cookies()
      if (cookieStore && typeof cookieStore.getAll === 'function') {
        const all = cookieStore.getAll()
        cookieNames = all.map(c => c.name)
      } else if (cookieStore && typeof cookieStore.get === 'function') {
        // best-effort: list common Supabase cookie names
        cookieNames = ['sb-access-token', 'sb-refresh-token', 'sb-session']
      }
    } catch { /* empty */ }

    return NextResponse.json({ authenticated: false, cookies: cookieNames }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
