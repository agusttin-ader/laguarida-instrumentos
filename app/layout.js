import '../styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'La Guarida — Catálogo de Instrumentos',
  description: 'Landing editorial para instrumentos musicales',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  )
}
