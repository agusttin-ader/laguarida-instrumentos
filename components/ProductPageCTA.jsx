"use client"

import React from 'react'
import { useToast } from './ToastContext'
import { WhatsAppGlyph } from './WhatsAppFloatButton'

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
        <p className="price-highlight text-2xl sm:text-[28px] font-bold mb-5 sm:mb-6 tracking-tight">{price}</p>
      )}
      <div className="flex flex-col max-md:w-full max-md:gap-3 md:flex-row md:flex-wrap md:items-center gap-3">
        <a
          href={consultHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${productName || 'este producto'}`}
          onClick={handleWhatsAppClick}
          className="no-custom-btn inline-flex w-full max-md:min-h-[52px] md:w-auto items-center justify-center gap-2.5 min-h-[48px] py-3.5 px-6 sm:px-8 rounded-full bg-[#25D366] text-white font-medium text-[16px] sm:text-[17px] md:text-[15px] lg:text-base xl:text-lg min-[1920px]:text-[1.125rem] tracking-tight shadow-[0_2px_12px_rgba(37,211,102,0.35)] transition-all duration-200 hover:bg-[#20bd5a] hover:shadow-[0_4px_18px_rgba(37,211,102,0.45)] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-card)]"
        >
          <WhatsAppGlyph className="h-[24px] w-[24px] sm:h-[26px] sm:w-[26px] shrink-0" />
          <span>Consultar por WhatsApp</span>
        </a>
        {children}
      </div>
    </div>
  )
}
