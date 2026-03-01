export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '../../../../lib/supabase/server'
import { assertSameOrigin, getAdminUserFromRequest } from '../chat/_server'

function toSafeText(value, maxLen = 2048) {
  if (value == null) return ''
  return String(value).trim().slice(0, maxLen)
}

export async function POST(req) {
  try {
    if (!assertSameOrigin(req)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }
    const user = await getAdminUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const sub = body?.subscription
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const endpoint = toSafeText(sub.endpoint, 2048)
    const p256dh = toSafeText(sub.keys.p256dh, 512)
    const auth = toSafeText(sub.keys.auth, 512)
    const userIdentifier = (user?.email || user?.id || '').toString().slice(0, 256)

    const admin = getSupabaseAdminClient()
    const { error } = await admin
      .from('admin_push_subscriptions')
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_identifier: userIdentifier || null,
        },
        { onConflict: 'endpoint' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
