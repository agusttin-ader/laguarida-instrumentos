export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laguarida.com'

export async function GET(req) {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export default GET
