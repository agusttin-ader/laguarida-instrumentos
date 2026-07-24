'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from './ToastContext'
import { WhatsAppGlyph } from './WhatsAppFloatButton'
import Button from './Button'

const MOBILE_MQ = '(max-width: 767px)'
const PRIMARY_CTA_ID = 'pdp-primary-cta'

/**
 * Barra sticky inferior (solo ≤767px): aparece cuando el CTA principal
 * deja de estar visible y se oculta al volver a verse.
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

    const target = document.getElementById(PRIMARY_CTA_ID)
    if (!target) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBar(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px' }
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
          className="pdp-mobile-sticky-bar__cta w-full"
        >
          <WhatsAppGlyph className="h-5 w-5 shrink-0" />
          <span>Consultar por WhatsApp</span>
        </Button>
      </div>
    </aside>
  )
}
