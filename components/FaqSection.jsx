"use client"

import React, { useState } from 'react'
import Button from './Button'
import { usePathname } from 'next/navigation'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'

const FAQ_ITEMS = [
  {
    id: 'envios',
    question: 'Envíos',
    answer: 'Tenemos envíos a todo el país. Coordinamos costos y tiempos según destino para darte una opción segura.',
  },
  {
    id: 'medios-pago',
    question: 'Medios de pago',
    answer: 'Aceptamos USD, USDT o pesos argentinos al cambio del día en dólar blue.',
  },
  {
    id: 'permutas',
    question: 'Permutas',
    answer: 'Sí, evaluamos permutas. Compartinos fotos, modelo y estado del instrumento por WhatsApp y te orientamos.',
  },
  {
    id: 'disponibilidad',
    question: 'Disponibilidad',
    answer: 'Todos los productos que están en el catálogo visibles están disponibles.',
  },
]

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconMinus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M5 12h14" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

export default function FaqSection() {
  const [openId, setOpenId] = useState(null)
  const pathname = usePathname()

  function handleVolverAlHome(e) {
    if (pathname === '/' || pathname === '') {
      e.preventDefault()
      if (typeof window !== 'undefined' && window.location.hash) {
        const path = `${window.location.pathname}${window.location.search || ''}`
        window.history.replaceState(window.history.state, '', path)
      }
      const el = document.getElementById('home-top')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    try {
      sessionStorage.setItem('pending-scroll-target', 'home-top')
    } catch { /* empty */ }
  }

  const phone = '+5491154661749'
  const waLink = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)
  const mail = 'leonardo_ruberti@hotmail.com'
  const insta = 'https://www.instagram.com/laguaridainstrumentos/'

  return (
    <section
      id="faq-section"
      className="mt-1 max-md:mt-0 sm:mt-2 md:mt-3"
      aria-labelledby="faq-heading"
    >
      <div
        className={`${layoutShellClassName} sm:px-5 md:px-6 lg:px-8 pt-1 max-md:pt-0 sm:pt-3 md:pt-4 lg:pt-5 pb-2 max-md:pb-0 sm:pb-4 md:pb-5 lg:pb-6`}
      >
        <p className="section-kicker-minimal section-underline-ocre mb-2 text-[var(--palette-gold)] sm:mb-3">
          Preguntas frecuentes
        </p>
        <h2 id="faq-heading" className="section-heading-editorial mb-3 sm:mb-4 md:mb-5">
          Envíos, pagos, permutas y más
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 order-1 divide-y divide-white/[0.08] border-t border-white/[0.08]">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id
              return (
                <div key={item.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="no-custom-btn no-custom-btn--rect w-full flex items-center justify-between gap-3 py-4 min-h-[48px] sm:py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] hover:text-[var(--palette-gold)] active:text-[var(--palette-gold)] transition-colors touch-manipulation"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                  >
                    <span className="text-[0.95rem] sm:text-base font-semibold tracking-tight text-[var(--dark-text-primary)]">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 text-[var(--dark-text-primary)]/60" aria-hidden>
                      {isOpen ? <IconMinus /> : <IconPlus />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div
                      id={`faq-answer-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-question-${item.id}`}
                      className="pb-4 sm:pb-5"
                    >
                      <p className="max-w-[70ch] text-[13px] leading-relaxed text-[var(--dark-text-secondary)] sm:text-sm">
                        {item.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <aside className="order-2 mt-2 pt-6 border-t border-white/[0.08] sm:mt-0 sm:pt-0 sm:border-t-0 lg:sticky lg:top-24 lg:col-span-1 lg:pl-8 lg:border-l lg:border-white/[0.08]">
            <p className="section-kicker-minimal mb-2 text-[var(--palette-gold)]">Contacto</p>
            <h3 className="mb-3 text-lg font-semibold tracking-tight text-[var(--dark-text-primary)] md:mb-4 md:text-xl">
              Contacto rápido
            </h3>
            <ul className="mb-4 space-y-2.5 text-[13px] text-[var(--dark-text-secondary)] sm:space-y-3 sm:text-sm md:mb-5">
              <li>
                <strong className="text-[var(--dark-text-primary)]">Teléfono:</strong>{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className="text-[var(--palette-gold)] hover:underline">
                  {phone}
                </a>
              </li>
              <li>
                <strong className="text-[var(--dark-text-primary)]">WhatsApp:</strong>{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className="text-[var(--palette-gold)] hover:underline">
                  Iniciar chat
                </a>
              </li>
              <li>
                <strong className="text-[var(--dark-text-primary)]">Email:</strong>{' '}
                <a href={`mailto:${mail}`} className="text-[var(--palette-gold)] hover:underline">
                  {mail}
                </a>
              </li>
            </ul>
            <p className="section-subtitle-minimal mb-2 text-[var(--dark-muted)] md:mb-2.5">Síguenos</p>
            <nav className="flex items-center gap-4" aria-label="Redes sociales">
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="no-custom-btn flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-[var(--dark-text-secondary)] transition-colors hover:text-[var(--palette-gold)]"
              >
                <IconInstagram />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                onClick={trackWhatsAppClick}
                className="no-custom-btn flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-[var(--dark-text-secondary)] transition-colors hover:text-[var(--palette-gold)]"
              >
                <IconWhatsApp />
              </a>
              <a
                href={`mailto:${mail}`}
                aria-label="Email"
                className="no-custom-btn flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-[var(--dark-text-secondary)] transition-colors hover:text-[var(--palette-gold)]"
              >
                <IconMail />
              </a>
            </nav>
          </aside>
        </div>
        <div className="mt-3 sm:mt-5 md:mt-6 flex justify-center">
          <Button href="/" onClick={handleVolverAlHome} size="full" className="max-w-[280px] sm:max-w-none sm:w-auto">
            Volver al home
          </Button>
        </div>
      </div>
    </section>
  )
}
