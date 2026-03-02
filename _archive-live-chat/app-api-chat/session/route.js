export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '../../../../lib/supabase/server'
import { assertSameOrigin } from '../_server'

function toSafeText(value, maxLen = 120) {
  if (value == null) return ''
  return String(value).trim().slice(0, maxLen)
}

export async function POST(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const visitorId = toSafeText(body?.visitorId, 120)
    const productName = toSafeText(body?.productName, 180)

    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()

    const { data: existing, error: findErr } = await admin
      .from('chat_sessions')
      .select('*')
      .eq('visitor_id', visitorId)
      .in('status', ['open', 'pending'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: findErr.status || 500 })
    }

    if (existing) {
      return NextResponse.json({ session: existing }, { status: 200 })
    }

    const payload = {
      visitor_id: visitorId,
      status: 'open',
      source: productName ? 'product' : 'site',
      context_product: productName || null,
    }

    const { data: created, error: createErr } = await admin
      .from('chat_sessions')
      .insert([payload])
      .select('*')
      .single()

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: createErr.status || 500 })
    }

    return NextResponse.json({ session: created }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
