import { getSiteUrl } from '../lib/siteUrl'

/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  const base = getSiteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
