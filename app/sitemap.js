import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laguarida.com'

export async function GET() {
  const pages = [
    '/'
  ]

  const guitarsDir = path.join(process.cwd(), 'data', 'guitars')
  let productUrls = []
  try {
    const files = fs.readdirSync(guitarsDir)
    productUrls = files
      .filter(f => f.endsWith('.md'))
      .map(f => `/guitars/${f.replace(/\.md$/, '')}`)
  } catch {
    /* empty */
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
