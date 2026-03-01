export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '../../../../lib/supabase/server'
import { assertSameOrigin, getAdminUserFromRequest } from '../_server'

function toSafeText(value, maxLen = 1000) {
  if (value == null) return ''
  return String(value).trim().slice(0, maxLen)
}

async function ensureSessionForVisitor(admin, sessionId, visitorId) {
  const { data, error } = await admin
    .from('chat_sessions')
    .select('id, visitor_id, status')
    .eq('id', sessionId)
    .maybeSingle()
  if (error) return { error: error.message, status: error.status || 500 }
  if (!data) return { error: 'Session not found', status: 404 }
  if (data.visitor_id !== visitorId) return { error: 'Forbidden', status: 403 }
  return { session: data }
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const sessionId = toSafeText(url.searchParams.get('sessionId'), 120)
    const visitorId = toSafeText(url.searchParams.get('visitorId'), 120)
    const adminUser = await getAdminUserFromRequest(req)

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()

    let sessionStatus = null
    if (!adminUser) {
      if (!visitorId) {
        return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 })
      }
      const check = await ensureSessionForVisitor(admin, sessionId, visitorId)
      if (check.error) return NextResponse.json({ error: check.error }, { status: check.status })
      sessionStatus = check.session?.status
    }

    const { data, error } = await admin
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    const body = { messages: data || [] }
    if (sessionStatus === 'closed') body.sessionClosed = true
    return NextResponse.json(body, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const sessionId = toSafeText(body?.sessionId, 120)
    const sender = toSafeText(body?.sender, 16)
    const text = toSafeText(body?.body, 1000)
    const visitorId = toSafeText(body?.visitorId, 120)

    if (!sessionId || !sender || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (sender !== 'user' && sender !== 'admin') {
      return NextResponse.json({ error: 'Invalid sender' }, { status: 400 })
    }

    const admin = getSupabaseAdminClient()
    const adminUser = await getAdminUserFromRequest(req)

    if (sender === 'admin') {
      if (!adminUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    } else {
      if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 })
      const check = await ensureSessionForVisitor(admin, sessionId, visitorId)
      if (check.error) return NextResponse.json({ error: check.error }, { status: check.status })
      if (check.session?.status === 'closed') {
        return NextResponse.json(
          { error: 'Conversación cerrada. Escribí abajo para abrir una nueva.', code: 'SESSION_CLOSED' },
          { status: 410 }
        )
      }
    }

    const { data, error } = await admin
      .from('chat_messages')
      .insert([{ session_id: sessionId, sender, body: text }])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    await admin
      .from('chat_sessions')
      .update({
        last_message_preview: text.slice(0, 140),
        last_message_at: new Date().toISOString(),
        status: 'open',
      })
      .eq('id', sessionId)

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
