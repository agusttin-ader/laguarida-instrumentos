import { getPublicCatalogRows } from '../lib/data/publicCatalog'
import { absoluteUrl } from '../lib/siteUrl'

export const revalidate = 3600

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const entries = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/catalogo'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  const catalog = await getPublicCatalogRows({ includeReserved: false })
  const productEntries = catalog
    .filter((p) => p?.slug)
    .map((p) => ({
      url: absoluteUrl(`/guitars/${p.slug}`),
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  return [...entries, ...productEntries]
}
