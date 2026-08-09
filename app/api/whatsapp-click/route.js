export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '../../../lib/supabase/server'
import { isSupabaseFullyBlocked } from '../../../lib/supabase/mode'

export async function POST() {
  try {
    if (isSupabaseFullyBlocked()) {
      return new NextResponse(null, { status: 204 })
    }
    const admin = getSupabaseAdminClient()
    const { error } = await admin.from('whatsapp_clicks').insert([{}])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
