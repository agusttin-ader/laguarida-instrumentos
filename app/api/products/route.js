export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'

// helper to extract sb-access-token from cookie store or raw header
async function extractAccessToken(req) {
  try {
    const cookieStore = cookies()
    // cookieStore.get returns something like { name, value }
    const at = cookieStore.get && cookieStore.get('sb-access-token')
    if (at && at.value) return at.value

    const session = cookieStore.get && cookieStore.get('sb-session') && cookieStore.get('sb-session').value
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (parsed?.access_token) return parsed.access_token
        if (parsed?.accessToken) return parsed.accessToken
      } catch { /* empty */ }
    }

    // fallback: parse raw Cookie header
    const raw = req.headers.get('cookie') || ''
    if (raw) {
      const pairs = raw.split(/;\s*/).map(p => p.split('='))
      const map = Object.fromEntries(pairs.map(([k, ...v]) => [k, v.join('=')]))
      if (map['sb-access-token']) return map['sb-access-token']
      if (map['sb-session']) {
        try {
          const parsed = JSON.parse(decodeURIComponent(map['sb-session']))
          return parsed?.access_token || parsed?.accessToken || null
        } catch { /* empty */ }
      }
    }
  } catch { /* empty */ }
  return null
}

export async function GET(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { name, slug, brand = null, price = null, image_url = null, images = [], description = null, mics = null, wood = null, model = null } = body || {}

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing required fields: name and slug' }, { status: 400 })
    }

    const payload = { name, slug, brand, price, image_url, images, description, mics, wood, model }

    const { data, error } = await supabase.from('products').insert([payload]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...fields } = body || {}
    if (!id) {
      return NextResponse.json({ error: 'Missing product id for update' }, { status: 400 })
    }

    // Prevent updating id
    delete fields.id

    const { data, error } = await supabase.from('products').update(fields).eq('id', id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const accessToken = await extractAccessToken(req)
    const supabase = await getSupabaseServerClient(accessToken)
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    const user = authData?.user ?? null
    if (authErr || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing product id in query string (?id=)' }, { status: 400 })
    }

    const { data, error } = await supabase.from('products').delete().eq('id', id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
