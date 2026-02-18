const SITE_URL = 'https://laguarida.com'

export async function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export default GET
