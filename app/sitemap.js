import fs from 'fs'
import path from 'path'
import { getSupabaseServerClient } from '../lib/supabase/server'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laguarida.com'

export async function GET() {
  const pages = [
    '/'
  ]

  let productUrls = []

  // Primary source: products in Supabase
  try {
    const supabase = getSupabaseServerClient()
    const { data } = await supabase.from('products').select('slug, updated_at').order('updated_at', { ascending: false })
    if (Array.isArray(data) && data.length) {
      productUrls = data
        .map((p) => p?.slug)
        .filter(Boolean)
        .map((slug) => `/guitars/${slug}`)
    }
  } catch {
    /* empty */
  }

  // Fallback: local markdown catalog when DB is unavailable
  const guitarsDir = path.join(process.cwd(), 'data', 'guitars')
  if (!productUrls.length) {
    try {
      const files = fs.readdirSync(guitarsDir)
      productUrls = files
        .filter(f => f.endsWith('.md'))
        .map(f => `/guitars/${f.replace(/\.md$/, '')}`)
    } catch {
      /* empty */
    }
  }

  const urls = [...pages, ...productUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>\n`).join('') +
    `</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}

export default GET
