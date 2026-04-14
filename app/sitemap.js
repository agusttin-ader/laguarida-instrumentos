import fs from 'fs'
import path from 'path'
import { getSupabaseServerClient } from '../lib/supabase/server'
import { absoluteUrl } from '../lib/siteUrl'

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const entries = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  let productEntries = []

  try {
    const supabase = getSupabaseServerClient()
    const { data } = await supabase
      .from('products')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
    if (Array.isArray(data) && data.length) {
      productEntries = data
        .filter((p) => p?.slug)
        .map((p) => ({
          url: absoluteUrl(`/guitars/${p.slug}`),
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
    }
  } catch {
    /* empty */
  }

  if (!productEntries.length) {
    const guitarsDir = path.join(process.cwd(), 'data', 'guitars')
    try {
      const files = fs.readdirSync(guitarsDir)
      productEntries = files
        .filter((f) => f.endsWith('.md'))
        .map((f) => ({
          url: absoluteUrl(`/guitars/${f.replace(/\.md$/, '')}`),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
    } catch {
      /* empty */
    }
  }

  return [...entries, ...productEntries]
}
