export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const user = await getUserFromRequest().catch(() => null)
    if (user) {
      return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email || null } })
    }

    // If no user, return cookie names we can inspect for debugging (no values)
    let cookieNames = []
    try {
      const cookieStore = cookies()
      if (cookieStore && typeof cookieStore.getAll === 'function') {
        const all = await cookieStore.getAll()
        cookieNames = all.map(c => c.name)
      } else if (cookieStore && typeof cookieStore.get === 'function') {
        // best-effort: list common Supabase cookie names
        cookieNames = ['sb-access-token', 'sb-refresh-token', 'sb-session']
      }
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ authenticated: false, cookies: cookieNames }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
