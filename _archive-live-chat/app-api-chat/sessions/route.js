export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '../../../../lib/supabase/server'
import { assertSameOrigin, getAdminUserFromRequest } from '../_server'

function toSafeText(value, maxLen = 24) {
  if (value == null) return ''
  return String(value).trim().slice(0, maxLen)
}

export async function GET(req) {
  try {
    const adminUser = await getAdminUserFromRequest(req)
    if (!adminUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const url = new URL(req.url)
    const status = toSafeText(url.searchParams.get('status'), 24)
    const admin = getSupabaseAdminClient()

    let query = admin
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .limit(100)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
    return NextResponse.json({ sessions: data || [] }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }
    const adminUser = await getAdminUserFromRequest(req)
    if (!adminUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const id = toSafeText(body?.id, 120)
    const status = toSafeText(body?.status, 24)
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }
    if (!['open', 'pending', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const { data, error } = await admin
      .from('chat_sessions')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
    return NextResponse.json({ session: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
