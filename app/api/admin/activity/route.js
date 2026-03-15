export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabase/server'
import { cookies } from 'next/headers'

const LIMIT = 30

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
    const pairs = raw.split(/;\s*/).map(p => p.split('='))
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
    const accessToken = await extractAccessToken(req)
    const supabase = getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const { data, error } = await supabase
      .from('admin_activity')
      .select('id, type, product_id, label, created_at')
      .order('created_at', { ascending: false })
      .limit(LIMIT)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
    const list = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      label: row.label,
      product_id: row.product_id,
      ts: new Date(row.created_at).getTime(),
      time: new Date(row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    }))
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const body = await req.json().catch(() => ({}))
    const type = body.type === 'create' || body.type === 'update' || body.type === 'delete' ? body.type : null
    const label = typeof body.label === 'string' ? body.label.trim().slice(0, 500) : ''
    if (!type || !label) {
      return NextResponse.json({ error: 'Missing or invalid type/label' }, { status: 400 })
    }
    const product_id = body.product_id || null
    const { data, error } = await supabase
      .from('admin_activity')
      .insert([{ type, label, product_id }])
      .select('id, type, label, created_at')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }
    return NextResponse.json({
      id: data.id,
      type: data.type,
      label: data.label,
      ts: new Date(data.created_at).getTime(),
      time: new Date(data.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
