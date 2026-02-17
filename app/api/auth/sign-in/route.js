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

    // Debug: inspect incoming cookies and raw Cookie header
    try {
      const cookieStore = cookies()
      if (cookieStore && typeof cookieStore.getAll === 'function') {
        const all = await cookieStore.getAll()
        console.log('DEBUG /api/auth/sign-in before signin cookies.getAll length=', Array.isArray(all) ? all.length : String(all))
      } else if (cookieStore && typeof cookieStore.get === 'function') {
        console.log('DEBUG /api/auth/sign-in before signin cookieStore has get/set keys')
      } else {
        console.log('DEBUG /api/auth/sign-in before signin cookies() shape=', cookieStore ? Object.keys(cookieStore) : 'no-cookie-store')
      }
    } catch (e) {
      console.log('DEBUG /api/auth/sign-in cookies error', String(e))
    }
    console.log('DEBUG /api/auth/sign-in request Cookie header=', req.headers.get('cookie'))

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.log('DEBUG /api/auth/sign-in supabase signIn error', error.message || String(error))
      return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: error.status || 401 })
    }

    // After sign-in attempt, log cookies again to see if auth-helpers applied storage
    try {
      const cookieStore2 = cookies()
      if (cookieStore2 && typeof cookieStore2.getAll === 'function') {
        const all2 = await cookieStore2.getAll()
        console.log('DEBUG /api/auth/sign-in after signin cookies.getAll length=', Array.isArray(all2) ? all2.length : String(all2))
      } else {
        console.log('DEBUG /api/auth/sign-in after signin cookieStore shape=', cookieStore2 ? Object.keys(cookieStore2) : 'no-cookie-store')
      }
    } catch (e) {
      console.log('DEBUG /api/auth/sign-in cookies after error', String(e))
    }

    // On success, set HttpOnly cookies so server-side checks can read the
    // access token (and refresh token) from subsequent requests.
    const session = data?.session || null

    const res = NextResponse.json({ user: data.user ?? null }, { status: 200 })

    if (session) {
      const secure = process.env.NODE_ENV === 'production'
      const maxAge = session.expires_in || 60 * 60 // fallback 1h

      // Access token cookie (used by server-side helpers)
      res.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure,
        maxAge,
      })

      // Refresh token cookie (optional, helpful for later refresh flows)
      if (session.refresh_token) {
        res.cookies.set('sb-refresh-token', session.refresh_token, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure,
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
