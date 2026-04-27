/**
 * Supabase Storage Image Transform API — reduce peso y acelera la carga.
 * Activar en el proyecto (Dashboard → Storage → Image transformations) y en env:
 *   NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true
 *
 * Sin la variable (o sin el feature en Supabase) las URLs no se modifican.
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const ENABLED = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === 'true'

/** object/public → render/image/public */
const OBJECT_PUBLIC_RE =
  /^(https:\/\/[^/]+\.supabase\.co)\/storage\/v1\/object\/public\/([^?#]+)/i

export function withSupabaseImageTransform(url, options = {}) {
  if (!ENABLED || !url || typeof url !== 'string') return url
  const trimmed = url.trim()
  if (!trimmed) return url
  if (trimmed.includes('/render/image/')) return url
  if (trimmed.includes('/object/sign/')) return url
  if (/[?&](token|Signature)=/i.test(trimmed)) return url

  const m = trimmed.match(OBJECT_PUBLIC_RE)
  if (!m) return url

  const width = Math.min(Math.max(Number(options.width) || 960, 64), 4096)
  const quality = Math.min(Math.max(Number(options.quality) ?? 72, 30), 95)
  const resize = options.resize === 'contain' ? 'contain' : 'cover'

  const origin = m[1]
  const pathRest = m[2]
  const qs = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    resize,
  })
  return `${origin}/storage/v1/render/image/public/${pathRest}?${qs}`
}
