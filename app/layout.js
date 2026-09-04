import '../styles/motion.css'
import '../styles/globals.css'
import React from 'react'
import { GeistSans } from 'geist/font/sans'
import { Fraunces } from 'next/font/google'
import SiteShell from '../components/SiteShell'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'
import DisableZoomInApp from '../components/DisableZoomInApp'
import { ToastProvider } from '../components/ToastContext'
import { FavoritesProvider } from '../components/ProductShareAndFavorite'
import { absoluteUrl, getSiteUrl } from '../lib/siteUrl'
import { Analytics } from '@vercel/analytics/react'
import { shouldReadCatalogFromBackup } from '../lib/catalog/readSource'

const displayFont = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif']
})

const siteUrl = getSiteUrl()

const supabaseOrigin = !shouldReadCatalogFromBackup() && process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin } catch { return null } })()
  : null

export const metadata = {
  title: {
    default: 'La Guarida — Guitarras e Instrumentos en Argentina',
    template: '%s | La Guarida',
  },
  description:
    'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
  metadataBase: new URL(siteUrl),
  robots: { index: true, follow: true },
  keywords: [
    'guitarras Argentina',
    'instrumentos musicales',
    'tienda de guitarras',
    'guitarras eléctricas',
    'bajos',
    'La Guarida',
    'La Guarida Instrumentos',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'La Guarida — Guitarras e Instrumentos en Argentina',
    description:
      'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
    url: siteUrl,
    locale: 'es_AR',
    type: 'website',
    siteName: 'La Guarida',
    images: [{ url: '/images/icons/og-image.png', width: 1200, height: 630, alt: 'La Guarida Instrumentos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Guarida — Guitarras e Instrumentos en Argentina',
    description:
      'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
    images: ['/images/icons/og-image.png'],
  },
  icons: {
    icon: '/images/icons/icon-192.png',
    shortcut: '/images/icons/icon-192.png',
    apple: '/images/icons/apple-touch-icon.png',
  },
  category: 'shopping',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1A1B22'
}

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicStore',
    '@id': `${siteUrl}/#organization`,
    name: 'La Guarida',
    alternateName: 'La Guarida Instrumentos',
    description:
      'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
    url: siteUrl,
    logo: absoluteUrl('/images/icons/icon-512.png'),
    image: absoluteUrl('/images/icons/og-image.png'),
    address: { '@type': 'PostalAddress', addressCountry: 'AR' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'leonardo_ruberti@hotmail.com',
      availableLanguage: 'Spanish',
      areaServed: 'AR',
    },
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'La Guarida',
    alternateName: 'La Guarida Instrumentos',
    url: siteUrl,
    description:
      'Tienda de guitarras e instrumentos musicales en Argentina. Stock real, asesoramiento profesional y atención personalizada.',
    inLanguage: 'es-AR',
    publisher: { '@id': `${siteUrl}/#organization` },
  }

  return (
    <html
      lang="es"
      className={`dark ${GeistSans.variable} ${displayFont.variable}`}
    >
      <head>
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} />}
        {supabaseOrigin && <link rel="dns-prefetch" href={supabaseOrigin} />}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
      </head>
      <body className={`min-h-screen ${GeistSans.className}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <DisableZoomInApp />
        <ToastProvider>
          <FavoritesProvider>
            <SiteShell>{children}</SiteShell>
            <ServiceWorkerRegister />
            <Analytics />
          </FavoritesProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
