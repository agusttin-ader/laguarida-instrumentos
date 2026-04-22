"use client"

import React from 'react'
import { useToast } from './ToastContext'

export default function ProductPageCTA({ price, consultHref, productName, children, showPrice = true }) {
  const { toast } = useToast()

  function handleWhatsAppClick(e) {
    e.preventDefault()
    toast('Abriendo WhatsApp…', 'default')
    window.open(consultHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="product-cta-entrance">
      {showPrice && price != null && (
        <p className="text-2xl sm:text-[28px] font-bold text-[var(--vintage-gold)] mb-5 sm:mb-6 tracking-tight">{price}</p>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <a
          href={consultHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${productName || 'este producto'}`}
          onClick={handleWhatsAppClick}
          className="no-custom-btn inline-flex items-center justify-center gap-2.5 min-h-[44px] py-3 px-5 sm:px-6 rounded-xl border-2 border-[var(--vintage-gold)]/50 bg-[var(--vintage-gold-soft)] text-white font-semibold text-sm transition-all duration-200 hover:bg-[var(--vintage-gold-soft-hover)] hover:border-[var(--vintage-gold)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(255,195,8,0.22)] active:translate-y-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
          </svg>
          <span>Consultar por WhatsApp</span>
        </a>
        {children}
      </div>
    </div>
  )
}
