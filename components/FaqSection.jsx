"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Minus, InstagramLogo, WhatsappLogo, EnvelopeSimple } from 'phosphor-react'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
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
      className="mt-2 max-md:mt-1 sm:mt-4 md:mt-5"
      aria-labelledby="faq-heading"
    >
      <div
        className={`${layoutShellClassName} sm:px-5 md:px-6 lg:px-8 pt-2 max-md:pt-1 sm:pt-5 md:pt-7 lg:pt-8 pb-2 max-md:pb-0 sm:pb-6 md:pb-7 lg:pb-8`}
      >
          <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-2 sm:mb-3">Preguntas frecuentes</p>
          <h2 id="faq-heading" className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[2.5rem] mb-3 sm:mb-6 md:mb-8">
            Envíos, pagos, permutas y más
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-2 space-y-2 order-1">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg-elevated)] overflow-hidden transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isOpen ? 'faq-item-open shadow-[0_10px_24px_rgba(0,0,0,0.18)]' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 min-h-[48px] sm:min-h-0 sm:py-4 text-left no-custom-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] rounded-xl hover:bg-white/5 active:bg-white/5 transition-colors touch-manipulation"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                  >
                    <span className="section-title-minimal text-[var(--dark-text-primary)] text-[0.95rem] sm:text-[1.05rem] font-semibold">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 text-[var(--dark-text-primary)]/70" aria-hidden>
                      {isOpen ? <Minus size={22} weight="bold" /> : <Plus size={22} weight="bold" />}
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className={`px-4 sm:px-5 pt-4 sm:pt-5 pb-4 sm:pb-5 transition-opacity duration-200 ease-out motion-reduce:transition-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-[13px] sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed max-w-[70ch]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="order-2 mt-4 rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg-elevated)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.2)] sm:mt-0 sm:rounded-2xl sm:p-5 md:p-6 lg:sticky lg:top-6 lg:col-span-1">
            <h3 className="section-title-minimal text-[var(--dark-text-primary)] text-[1.05rem] sm:text-[1.2rem] mb-3 md:mb-4">
              Contacto rápido
            </h3>
            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm text-gray-700 dark:text-gray-200 mb-4 md:mb-5">
              <li>
                <strong>Teléfono:</strong>{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-orange hover:underline">
                  {phone}
                </a>
              </li>
              <li>
                <strong>WhatsApp:</strong>{' '}
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-orange hover:underline">
                  Iniciar chat
                </a>
              </li>
              <li>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${mail}`} className="contact-orange hover:underline">
                  {mail}
                </a>
              </li>
            </ul>
            <p className="section-subtitle-minimal text-gray-800 dark:text-white/80 mb-2 md:mb-2.5">Síguenos</p>
            <nav className="flex items-center gap-3" aria-label="Redes sociales">
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="no-custom-btn text-gray-700 dark:text-gray-200 hover:text-pink-600 transition-colors"
              >
                <InstagramLogo size={20} weight="duotone" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="no-custom-btn text-gray-700 dark:text-gray-200 hover:text-emerald-500 transition-colors"
              >
                <WhatsappLogo size={20} weight="duotone" />
              </a>
              <a
                href={`mailto:${mail}`}
                aria-label="Email"
                className="no-custom-btn text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-colors"
              >
                <EnvelopeSimple size={20} weight="duotone" />
              </a>
            </nav>
          </aside>
          </div>
          <div className="mt-3 sm:mt-5 md:mt-6 flex justify-center">
            <Link
              href="/"
              onClick={handleVolverAlHome}
              className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[44px] py-3 sm:py-3 px-6 sm:px-7 rounded-xl border border-white/15 bg-[var(--dark-cta-bg)] text-[var(--dark-cta-text)] text-[13px] sm:text-sm font-semibold hover:bg-[var(--dark-cta-hover)] active:opacity-90 transition-colors no-custom-btn touch-manipulation w-full max-w-[280px] sm:max-w-none"
            >
              Volver al home
            </Link>
          </div>
      </div>
    </section>
  )
}
