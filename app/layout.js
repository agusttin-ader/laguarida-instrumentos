import '../styles/globals.css'
import React from 'react'
import SiteShell from '../components/SiteShell'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'
import DisableZoomInApp from '../components/DisableZoomInApp'
import { ToastProvider, ChatIntroToastTrigger } from '../components/ToastContext'

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
  themeColor: '#2a2b2e'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick-icon.PNG" />
      </head>
      <body className="min-h-screen">
        <DisableZoomInApp />
        <ToastProvider>
          <SiteShell>{children}</SiteShell>
          <ChatIntroToastTrigger />
          <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  )
}
