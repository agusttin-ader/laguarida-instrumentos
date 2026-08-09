'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from './ToastContext'
import { WhatsAppGlyph } from './WhatsAppFloatButton'
import Button from './Button'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'

const MOBILE_MQ = '(max-width: 767px)'
/** Bloque principal de compra (precio, confianza, CTA). */
const PRIMARY_BLOCK_ID = 'pdp-primary-block'

/**
 * Barra fija inferior (solo ≤767px): aparece al scrollear más allá
 * del bloque principal del producto. Refuerza el CTA de WhatsApp;
 * no reemplaza el CTA en página.
 */
export default function ProductMobileStickyBar({
  productName,
  priceLabel,
  consultHref,
}) {
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mq = window.matchMedia(MOBILE_MQ)
    const syncMobile = () => setIsMobile(mq.matches)
    syncMobile()
    mq.addEventListener('change', syncMobile)
    return () => mq.removeEventListener('change', syncMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setShowBar(false)
      return undefined
    }

    const target =
      document.getElementById(PRIMARY_BLOCK_ID) ||
      document.getElementById('pdp-primary-cta')
    if (!target) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible cuando el bloque principal ya no intersecta el viewport.
        setShowBar(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [isMobile])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const active = isMobile && showBar
    document.body.classList.toggle('pdp-sticky-cta-visible', active)
    return () => {
      document.body.classList.remove('pdp-sticky-cta-visible')
    }
  }, [isMobile, showBar])

  function handleWhatsAppClick(e) {
    e.preventDefault()
    trackWhatsAppClick()
    toast('Abriendo WhatsApp…', 'default')
    window.open(consultHref, '_blank', 'noopener,noreferrer')
  }

  const visible = isMobile && showBar
  const shortName = String(productName || '').trim() || 'Instrumento'

  return (
    <aside
      className={`pdp-mobile-sticky-bar md:hidden${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
      aria-label="Consulta rápida del producto"
    >
      <div className="pdp-mobile-sticky-bar__inner">
        <div className="pdp-mobile-sticky-bar__meta">
          <span className="pdp-mobile-sticky-bar__name">{shortName}</span>
          {priceLabel ? (
            <span className="pdp-mobile-sticky-bar__price price-highlight">{priceLabel}</span>
          ) : null}
        </div>
        <Button
          href={consultHref}
          variant="whatsapp"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          aria-label={`Consultar por WhatsApp sobre ${shortName}`}
          onClick={handleWhatsAppClick}
          className="pdp-mobile-sticky-bar__cta w-full min-h-11"
        >
          <WhatsAppGlyph className="h-5 w-5 shrink-0" />
          <span>Consultar por WhatsApp</span>
        </Button>
      </div>
    </aside>
  )
}
