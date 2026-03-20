/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: process.env.NODE_ENV === 'production' ? { removeConsole: { exclude: ['warn', 'error'] } } : undefined,
  images: {
    // Allowed quality values used across the app (avoid Next.js warnings in dev/prod).
    qualities: [100, 95, 90, 88, 86, 85, 82, 80, 78, 76],
    // Prefer modern formats when available to reduce transfer size
    formats: ['image/avif', 'image/webp'],
    // Allow Supabase Storage public URLs (project-specific hostnames under supabase.co)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig

