import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabase/server'

export async function GET(req) {
  try {
    const supabase = getSupabaseServerClient()
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
    const body = await req.json()
    const { name, slug, brand = null, price = null, image_url = null, images = [], description = null } = body || {}

    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing required fields: name and slug' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const payload = { name, slug, brand, price, image_url, images, description }

    const { data, error } = await supabase.from('products').insert([payload]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing product id in query string (?id=)' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from('products').delete().eq('id', id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 })
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
