import '../styles/globals.css'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','600','700','800'], display: 'swap' })

export const metadata = {
  title: 'La Guarida — Catálogo de Instrumentos',
  description: 'Landing editorial para instrumentos musicales',
  metadataBase: new URL('https://laguarida.com'),
  openGraph: {
    images: ['https://laguarida.com/images/logo/og-pick.svg'],
    type: 'website',
    siteName: 'La Guarida'
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://laguarida.com/images/logo/og-pick.svg']
  }
  ,
  icons: {
    icon: '/images/logo/og-pick.svg',
    shortcut: '/images/logo/og-pick.svg',
    apple: '/images/logo/og-pick.svg'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/images/logo/og-pick.svg" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
