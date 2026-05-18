import '../styles/globals.css'
import React from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import SiteShell from '../components/SiteShell'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'
import DisableZoomInApp from '../components/DisableZoomInApp'
import { ToastProvider } from '../components/ToastContext'
import { absoluteUrl, getSiteUrl } from '../lib/siteUrl'
import { Analytics } from '@vercel/analytics/react'

const siteUrl = getSiteUrl()

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin } catch { return null } })()
  : null

export const metadata = {
  title: 'La Guarida — Catálogo de Instrumentos',
  description: 'Tienda de guitarras e instrumentos musicales en Argentina. Catálogo curado, asesoramiento profesional y atención personalizada.',
  metadataBase: new URL(siteUrl),
  robots: { index: true, follow: true },
  openGraph: {
    images: ['/images/icons/og-image.png'],
    type: 'website',
    siteName: 'La Guarida'
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/icons/og-image.png']
  },
  icons: {
    icon: '/images/icons/icon-192.png',
    shortcut: '/images/icons/icon-192.png',
    apple: '/images/icons/apple-touch-icon.png'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0D0D0D'
}

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicStore',
    name: 'La Guarida',
    description: 'Tienda de guitarras e instrumentos musicales en Argentina. Catálogo curado, asesoramiento profesional y atención personalizada.',
    url: siteUrl,
    logo: absoluteUrl('/images/icons/icon-512.png'),
    image: absoluteUrl('/images/icons/og-image.png'),
    address: { '@type': 'PostalAddress', addressCountry: 'AR' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
      areaServed: 'AR'
    }
  }

  return (
    <html
      lang="es"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
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
        <DisableZoomInApp />
        <ToastProvider>
          <SiteShell>{children}</SiteShell>
          <ServiceWorkerRegister />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  )
}
