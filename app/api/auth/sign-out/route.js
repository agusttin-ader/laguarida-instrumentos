export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'

export async function POST(req) {
  try {
    // Try to read token from cookie or Authorization header
    let token = null
    try {
      const cookieStore = await cookies()
      const tokenCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-access-token') : null
      token = tokenCookie?.value || headers().get('authorization')?.replace(/^Bearer\s+/i, '') || null
    } catch (e) {
      // ignore
    }

    // If we have a token, try to notify Supabase to sign out (best-effort)
    if (token) {
      try {
        const supabase = getSupabaseServerClient(token)
        await supabase.auth.signOut()
      } catch (e) {
        // swallow errors — signOut on server is best-effort
      }
    }

    const res = NextResponse.json({ signedOut: true })

    // Clear cookies set by sign-in
    res.cookies.set('sb-access-token', '', { httpOnly: true, path: '/', maxAge: 0 })
    res.cookies.set('sb-refresh-token', '', { httpOnly: true, path: '/', maxAge: 0 })

    return res
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
