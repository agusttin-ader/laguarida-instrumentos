'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from './ToastContext'
import { WhatsAppGlyph } from './WhatsAppFloatButton'
import formatPriceDisplay from '../lib/utils/formatPriceDisplay'

/**
 * Barra inferior en móvil cuando el CTA principal sale de vista (patrón sticky ATC habitual en PDP 2025+).
 */
export default function ProductMobileStickyCTA({ price, consultHref, productName }) {
  const [visible, setVisible] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const el = document.getElementById('pdp-primary-cta')
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px 0px -12px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!consultHref) return null

  function handleClick(e) {
    e.preventDefault()
    toast('Abriendo WhatsApp…', 'default')
    window.open(consultHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`fixed inset-x-0 z-[var(--z-bottom-nav)] md:hidden border-t border-white/[0.1] bg-[var(--dark-bg-elevated)] shadow-[0_-12px_40px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-300 ease-out motion-reduce:duration-150 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 pt-2.5">
        {price ? (
          <p className="price-highlight shrink-0 text-lg font-bold leading-tight tracking-tight text-[var(--dark-text-primary)]">
            {formatPriceDisplay(price)}
          </p>
        ) : (
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--dark-muted)]">
            {productName || 'Consultar'}
          </span>
        )}
        <a
          href={consultHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${productName || 'este producto'}`}
          onClick={handleClick}
          className="no-custom-btn inline-flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[15px] font-semibold text-white shadow-[0_2px_14px_rgba(37,211,102,0.4)] transition-colors hover:bg-[#20bd5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-elevated)]"
        >
          <WhatsAppGlyph className="h-5 w-5 shrink-0" />
          <span className="truncate">WhatsApp</span>
        </a>
      </div>
    </div>
  )
}
