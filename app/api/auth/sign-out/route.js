export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'

export async function POST(req) {
  try {
    const h = await headers()
    const origin = h.get('origin')
    const host = h.get('host')
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

    // Try to read token from cookie or Authorization header
    let token = null
    try {
      const cookieStore = await cookies()
      const tokenCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-access-token') : null
      token = tokenCookie?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null
    } catch { /* empty */ }

    // If we have a token, try to notify Supabase to sign out (best-effort)
    if (token) {
      try {
        const supabase = getSupabaseServerClient(token)
        await supabase.auth.signOut()
      } catch { /* empty */ }
    }

    const res = NextResponse.json({ signedOut: true })
    const secure = process.env.NODE_ENV === 'production'
    const cookieDomain = process.env.SITE_COOKIE_DOMAIN
    const sameSite = 'lax'
    const baseCookieOptions = { httpOnly: true, path: '/', maxAge: 0, secure, sameSite }
    const cookieOptions = cookieDomain ? { ...baseCookieOptions, domain: cookieDomain } : baseCookieOptions

    // Clear cookies set by sign-in
    res.cookies.set('sb-access-token', '', cookieOptions)
    res.cookies.set('sb-refresh-token', '', cookieOptions)

    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
