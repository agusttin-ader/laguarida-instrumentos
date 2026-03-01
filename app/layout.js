import '../styles/globals.css'
import React from 'react'
import SiteShell from '../components/SiteShell'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'

export const metadata = {
  title: 'La Guarida — Catálogo de Instrumentos',
  description: 'Tienda de guitarras e instrumentos musicales en Argentina. Catálogo curado, asesoramiento profesional y atención personalizada.',
  metadataBase: new URL('https://laguarida.com'),
  openGraph: {
    images: ['https://laguarida.com/images/logo/og-pick.PNG'],
    type: 'website',
    siteName: 'La Guarida'
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://laguarida.com/images/logo/og-pick.PNG']
  }
  ,
  icons: {
    icon: '/images/logo/og-pick.PNG',
    shortcut: '/images/logo/og-pick.PNG',
    apple: '/images/logo/og-pick.PNG'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a1c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick.PNG" />
      </head>
      <body className="min-h-screen">
        <SiteShell>{children}</SiteShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
