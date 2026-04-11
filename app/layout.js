import '../styles/globals.css'
import React from 'react'
import { Syne } from 'next/font/google'
import SiteShell from '../components/SiteShell'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'
import DisableZoomInApp from '../components/DisableZoomInApp'
import { ToastProvider } from '../components/ToastContext'
import { HomeHeroImageProvider } from '../context/HomeHeroImageContext'

const syne = Syne({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-syne',
  display: 'swap'
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laguarida.com'

// Preconnect to Supabase Storage so first product images load faster
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin } catch { return null } })()
  : null

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicStore',
  name: 'La Guarida',
  description: 'Tienda de guitarras e instrumentos musicales en Argentina. Catálogo curado, asesoramiento profesional y atención personalizada.',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/og-pick-icon.PNG`,
  image: `${SITE_URL}/images/logo/og-pick-icon.PNG`,
  address: { '@type': 'PostalAddress', addressCountry: 'AR' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Spanish',
    areaServed: 'AR'
  }
}

export const metadata = {
  title: 'La Guarida — Catálogo de Instrumentos',
  description: 'Tienda de guitarras e instrumentos musicales en Argentina. Catálogo curado, asesoramiento profesional y atención personalizada.',
  metadataBase: new URL('https://laguarida.com'),
  openGraph: {
    images: ['https://laguarida.com/images/logo/og-pick-icon.PNG'],
    type: 'website',
    siteName: 'La Guarida'
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://laguarida.com/images/logo/og-pick-icon.PNG']
  },
  icons: {
    icon: '/images/logo/og-pick-icon.PNG',
    shortcut: '/images/logo/og-pick-icon.PNG',
    apple: '/images/logo/og-pick-icon.PNG'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} />}
        {supabaseOrigin && <link rel="dns-prefetch" href={supabaseOrigin} />}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick-icon.PNG" />
      </head>
      <body className={`min-h-screen ${syne.variable} ${syne.className}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <DisableZoomInApp />
        <ToastProvider>
          <HomeHeroImageProvider>
            <SiteShell>{children}</SiteShell>
          </HomeHeroImageProvider>
          <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  )
}
