export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'
import { cookies, headers } from 'next/headers'

export async function GET() {
  try {
    const requestHeaders = await headers()

    async function getUserFromRequest() {
      // Try cookie-based token first (common when client includes credentials)
      try {
        const cookieStore = await cookies()
        // cookieStore may be a RequestCookies-like API; prefer .get when available
        const tokenCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-access-token') : null
        const token = tokenCookie?.value || requestHeaders.get('authorization')?.replace(/^Bearer\s+/i, '') || null
        if (!token) return null

        const supabase = getSupabaseServerClient(token)
        const { data, error } = await supabase.auth.getUser()
        if (error) return null
        return data?.user || null
      } catch {
        return null
      }
    }

    const user = await getUserFromRequest()
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
