/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: process.env.NODE_ENV === 'production' ? { removeConsole: { exclude: ['warn', 'error'] } } : undefined,
  images: {
    // Máxima calidad posible; el proyecto usa quality 100 en imágenes de producto y hero.
    qualities: [100, 95, 90, 85],
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

