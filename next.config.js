/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: process.env.NODE_ENV === 'production' ? { removeConsole: { exclude: ['warn', 'error'] } } : undefined,
  images: {
    // Allow common quality presets; ProductCard and others use 95.
    qualities: [100, 95, 85],
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

