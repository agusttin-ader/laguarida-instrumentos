export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServerClient, getSupabaseAdminClient } from '../../../../lib/supabase/server'
import { isSupabaseFullyBlocked } from '../../../../lib/supabase/mode'

async function extractAccessToken(req) {
  try {
    const cookieStore = await cookies()
    const at = cookieStore.get && cookieStore.get('sb-access-token')
    if (at && at.value) return at.value
    const session = cookieStore.get && cookieStore.get('sb-session') && cookieStore.get('sb-session').value
    if (session) {
      try {
        const parsed = JSON.parse(session)
        return parsed?.access_token || parsed?.accessToken || null
      } catch { /* empty */ }
    }
    const raw = req.headers.get('cookie') || ''
    const pairs = raw.split(/;\s*/).map((p) => p.split('='))
    const map = Object.fromEntries(pairs.map(([k, ...v]) => [k, v.join('=')]))
    if (map['sb-access-token']) return map['sb-access-token']
    if (map['sb-session']) {
      try {
        const parsed = JSON.parse(decodeURIComponent(map['sb-session']))
        return parsed?.access_token || parsed?.accessToken || null
      } catch { /* empty */ }
    }
  } catch { /* empty */ }
  return null
}

export async function GET(req) {
  try {
    if (isSupabaseFullyBlocked()) {
      return NextResponse.json({ error: 'Supabase blocked' }, { status: 503 })
    }

    const accessToken = await extractAccessToken(req)
    const supabase = getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const admin = getSupabaseAdminClient()
    const { data, error } = await admin
      .from('whatsapp_clicks')
      .select('created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    const rows = Array.isArray(data) ? data : []
    const byMonthMap = new Map()
    for (const row of rows) {
      const d = new Date(row.created_at)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      byMonthMap.set(key, (byMonthMap.get(key) || 0) + 1)
    }

    const byMonth = [...byMonthMap.entries()]
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0))

    return NextResponse.json(
      { total: rows.length, byMonth },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
