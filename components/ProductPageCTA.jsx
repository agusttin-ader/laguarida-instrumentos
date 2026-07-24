"use client"

import React from 'react'
import { useToast } from './ToastContext'
import { WhatsAppGlyph } from './WhatsAppFloatButton'
import Button from './Button'

export default function ProductPageCTA({
  price,
  consultHref,
  productName,
  children,
  showPrice = true,
  ctaId = 'pdp-primary-cta',
  buttonVariant = 'whatsapp',
}) {
  const { toast } = useToast()

  function handleWhatsAppClick(e) {
    e.preventDefault()
    toast('Abriendo WhatsApp…', 'default')
    window.open(consultHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <div id={ctaId || undefined} className="product-cta-entrance">
      {showPrice && price != null && (
        <p className="price-highlight text-2xl sm:text-[28px] font-bold mb-5 sm:mb-6 tracking-tight">{price}</p>
      )}
      <div className="flex flex-col max-md:w-full max-md:gap-3 md:flex-row md:flex-wrap md:items-center gap-3">
        <Button
          href={consultHref}
          variant={buttonVariant}
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${productName || 'este producto'}`}
          onClick={handleWhatsAppClick}
          className="w-full md:w-auto min-h-11"
        >
          <WhatsAppGlyph className="h-6 w-6 shrink-0" />
          <span>Consultar por WhatsApp</span>
        </Button>
        {children}
      </div>
    </div>
  )
}
