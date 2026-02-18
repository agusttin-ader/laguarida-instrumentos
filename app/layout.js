import '../styles/globals.css'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-sans">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
