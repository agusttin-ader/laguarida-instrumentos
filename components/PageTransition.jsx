"use client"

import React from 'react'

/**
 * Envuelve el contenido de la página para una transición suave al cambiar de ruta.
 * El padre debe usar key={pathname} para que se re-monte y ejecute la animación.
 */
export default function PageTransition({ children }) {
  return (
    <div className="animate-page-in min-h-0" style={{ animationDuration: '0.35s' }}>
      {children}
    </div>
  )
}
