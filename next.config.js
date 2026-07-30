/** @type {import('next').NextConfig} */

const { isLocalCatalogEnabled } = require('./lib/supabase/mode')

/** Catálogo en /public → servir directo desde /images/* (evita 402 del Image Optimizer en Vercel). */
function imagesUnoptimized() {
  if (process.env.NEXT_ENABLE_IMAGE_OPTIMIZATION === 'true') return false
  if (process.env.NEXT_ENABLE_IMAGE_OPTIMIZATION === 'false') return true
  // Local: sin /_next/image (en Hobby/Pro sin cuota extra las rutas /public dan 200 directo).
  if (isLocalCatalogEnabled()) return true
  // Supabase remoto: también directo por defecto (transform CDN opcional vía forDisplay).
  return true
}

function supabaseRemotePatternsFromEnv() {
  const rawUrls = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL].filter(Boolean)
  const seen = new Set()
  const patterns = []
  for (const raw of rawUrls) {
    try {
      const u = new URL(raw)
      if (seen.has(u.hostname)) continue
      seen.add(u.hostname)
      patterns.push({
        protocol: u.protocol.replace(':', ''),
        hostname: u.hostname,
        port: u.port || '',
        pathname: '/storage/v1/**',
      })
    } catch {
      /* ignore invalid */
    }
  }
  return patterns
}

const nextConfig = {
  reactStrictMode: true,
  compiler: process.env.NODE_ENV === 'production' ? { removeConsole: { exclude: ['warn', 'error'] } } : undefined,
  experimental: {
    // Importar solo los iconos usados de phosphor-react (menos JS en cliente)
    optimizePackageImports: ['phosphor-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ]
  },
  images: {
    // Siempre unoptimized por defecto: /images/* y variantes WebP estáticas se sirven directo
    // (evita HTTP 402 del Image Optimizer en Vercel). No hace falta activar transformaciones on-demand.
    // Override solo con plan/cuota: NEXT_ENABLE_IMAGE_OPTIMIZATION=true (los componentes de producto
    // siguen pasando unoptimized y no dependen de /_next/image).
    unoptimized: imagesUnoptimized(),
    // Allowed quality values used across the app (avoid Next.js warnings in dev/prod).
    qualities: [100, 95, 92, 90, 88, 86, 85, 82, 80, 78, 76, 75, 74, 72, 70, 68, 65, 62, 60, 58],
    // Prefer modern formats when available to reduce transfer size
    formats: ['image/avif', 'image/webp'],
    // Host explícito desde env (build/deploy) + comodín para cualquier proyecto *.supabase.co
    remotePatterns: [
      ...supabaseRemotePatternsFromEnv(),
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/**',
      },
    ],
  },
}

module.exports = nextConfig

