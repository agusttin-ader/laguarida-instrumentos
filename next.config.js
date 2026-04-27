/** @type {import('next').NextConfig} */

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
  images: {
    // Vercel cobra / limita el Image Optimization (`/_next/image`). Sin plan Pro las URLs remotas
    // pueden responder 402. Por defecto `unoptimized: true` (imagen directa; combiná con
    // NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true para pesos más chicos desde Supabase).
    // Con plan Pro / self-hosted: NEXT_ENABLE_IMAGE_OPTIMIZATION=true para redimensionar vía Next.
    unoptimized: process.env.NEXT_ENABLE_IMAGE_OPTIMIZATION === 'true' ? false : true,
    // Allowed quality values used across the app (avoid Next.js warnings in dev/prod).
    qualities: [100, 95, 92, 90, 88, 86, 85, 82, 80, 78, 76, 75, 72, 70, 68, 65, 62, 60],
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

