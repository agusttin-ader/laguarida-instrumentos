export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import {
  getSupabaseServerClient,
  hasSupabasePublicConfig,
  SUPABASE_CONFIG_HINT,
} from '../../../../lib/supabase/server'
import { buildAuthCookieOptions } from '../../../../lib/auth/sessionCookies'

const SIGNIN_RATE_LIMIT = 5
const WINDOW_MS = 60 * 1000
const attemptsByIp = new Map()

function getClientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
}

function isRateLimited(ip) {
  const now = Date.now()
  const entry = attemptsByIp.get(ip)
  if (!entry) return false
  if (now >= entry.resetAt) {
    attemptsByIp.delete(ip)
    return false
  }
  return entry.count >= SIGNIN_RATE_LIMIT
}

function recordAttempt(ip) {
  const now = Date.now()
  const entry = attemptsByIp.get(ip)
  if (!entry || now >= entry.resetAt) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  entry.count++
}

function clearAttempt(ip) {
  attemptsByIp.delete(ip)
}

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

    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 })
    }

    const body = await req.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    if (!hasSupabasePublicConfig()) {
      return NextResponse.json(
        { error: SUPABASE_CONFIG_HINT, code: 'SUPABASE_NOT_CONFIGURED' },
        { status: 503 },
      )
    }

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      recordAttempt(ip)
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: error.status || 401 })
    }

    clearAttempt(ip)

    // On success, set HttpOnly cookies so server-side checks can read the
    // access token (and refresh token) from subsequent requests.
    const session = data?.session || null

    const res = NextResponse.json({ user: data.user ?? null }, { status: 200 })

    if (session) {
      const requestHost = req.headers.get('host')
      const maxAge = session.expires_in || 60 * 60 // fallback 1h
      const cookieOptions = buildAuthCookieOptions(requestHost)

      res.cookies.set('sb-access-token', session.access_token, {
        ...cookieOptions,
        maxAge,
      })

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
