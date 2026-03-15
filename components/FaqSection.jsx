"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown, CaretUp, InstagramLogo, WhatsappLogo, EnvelopeSimple } from 'phosphor-react'

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
  const waNumber = '5491154661749'
  const waMessage = encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`
  const mail = 'leonardo_ruberti@hotmail.com'
  const insta = 'https://www.instagram.com/laguaridainstrumentos/'

  return (
    <section
      id="faq-section"
      className="mt-6 sm:mt-10 md:mt-12 rounded-2xl border border-[var(--dark-border)] bg-gradient-to-b from-[var(--dark-bg-card)] to-[var(--dark-bg-page)] shadow-[0_18px_48px_rgba(0,0,0,0.25)]"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-10 md:py-12 lg:py-14 pb-20 md:pb-14 lg:pb-14">
        <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-2 sm:mb-3">Preguntas frecuentes</p>
        <h2 id="faq-heading" className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[2.5rem] mb-4 sm:mb-6 md:mb-8">
          Envíos, pagos, permutas y más
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-2 space-y-2 order-1">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--dark-border)] bg-[var(--dark-bg-elevated)] overflow-hidden"
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
                      {isOpen ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 sm:pb-5">
                        <p className="text-[13px] sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="lg:col-span-1 order-2 bg-[var(--dark-bg-elevated)] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--dark-border)] shadow-[0_10px_26px_rgba(0,0,0,0.2)] lg:sticky lg:top-6 mt-2 sm:mt-0 pt-5 sm:pt-4 border-t border-[var(--dark-border)] sm:border-t-0 sm:pt-6">
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
            <p className="section-subtitle-minimal text-gray-800 dark:text-white/80 mb-1.5 md:mb-2">Síguenos</p>
            <nav className="flex items-center gap-3" aria-label="Redes sociales">
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-700 dark:text-gray-200 hover:text-pink-600 transition-colors"
              >
                <InstagramLogo size={20} weight="duotone" />
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-gray-700 dark:text-gray-200 hover:text-emerald-500 transition-colors"
              >
                <WhatsappLogo size={20} weight="duotone" />
              </a>
              <a
                href={`mailto:${mail}`}
                aria-label="Email"
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-colors"
              >
                <EnvelopeSimple size={20} weight="duotone" />
              </a>
            </nav>
          </aside>
        </div>
        <div className="mt-6 sm:mt-9 md:mt-10 flex justify-center">
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
