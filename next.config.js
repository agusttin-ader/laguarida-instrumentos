/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow common quality presets including 100; keep array under the 20-element limit.
    qualities: [100, 90, 80, 75, 70],
    // Prefer modern formats when available to reduce transfer size
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig

