"use client"

import React, { useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'
import { scrollToHomeSectionById } from '../lib/homeSectionScroll'
import { SITE_LOGO_SRC } from '../lib/branding/logo'

const COPYRIGHT_YEAR = new Date().getFullYear()

const EXPLORE_LINKS = [
  { label: 'Inicio', href: '/', kind: 'home' },
  { label: 'Catálogo', href: '/catalogo', kind: 'link' },
  { label: 'Favoritos', href: '/favoritos', kind: 'link' },
  { label: 'Sobre nosotros', sectionId: 'about-section', kind: 'section' },
  { label: 'Preguntas frecuentes', sectionId: 'faq-section', kind: 'section' },
]

const footerLinkClass =
  'no-custom-btn inline-flex items-center text-sm text-[var(--dark-muted)] transition-colors duration-200 hover:text-[var(--dark-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] rounded-sm'

const footerKickerClass =
  'section-kicker-minimal mb-3 text-[var(--palette-gold)] tracking-[0.16em]'

const socialBtnClass =
  'no-custom-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--dark-muted)] transition-all duration-200 hover:border-[rgba(var(--palette-gold-rgb),0.32)] hover:bg-[rgba(var(--palette-gold-rgb),0.07)] hover:text-[var(--vintage-gold)] active:scale-[0.97]'

const DEV_CREDIT_URL = 'https://www.agustinaderdev.com/'

function DevCredit() {
  return (
    <a
      href={DEV_CREDIT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Desarrollado por Agustin Ader — agustinaderdev.com (se abre en una pestaña nueva)"
      className="site-footer__dev-credit no-custom-btn inline-flex items-center gap-2.5 shrink-0 rounded-sm transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)]"
    >
      <img
        src="/images/logo-dev/logo-dev.webp"
        alt=""
        width={256}
        height={202}
        loading="lazy"
        decoding="async"
        className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_0_1.5px_rgba(255,255,255,0.85)]"
      />
      <p className="text-xs text-white/65">
        Desarrollado por{' '}
        <span className="text-white/85 font-medium">Agustin Ader</span>
      </p>
    </a>
  )
}

export default function Footer({ compact = false }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/' || pathname === ''
  const isProductPage = typeof pathname === 'string' && /^\/guitars\/[^/]+$/u.test(pathname)
  const waHref = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)

  const footerTop = compact
    ? 'mt-0'
    : isHome
      ? 'mt-0 md:mt-8'
      : isProductPage
        ? 'mt-3 md:mt-10'
        : 'mt-8 md:mt-12'

  const shellPad = compact
    ? 'py-4 md:py-3'
    : isProductPage
      ? 'py-5 sm:py-7'
      : isHome
        ? 'py-4 max-md:pt-2 max-md:pb-5 sm:py-9'
        : 'py-7 sm:py-9'

  const handleHome = useCallback(
    (e) => {
      e.preventDefault()
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      try {
        sessionStorage.setItem('pending-scroll-target', 'home-top')
      } catch {
        /* empty */
      }
      router.push('/')
    },
    [isHome, router]
  )

  const handleSection = useCallback(
    (e, sectionId) => {
      e.preventDefault()
      if (isHome) {
        if (scrollToHomeSectionById(sectionId, { behavior: 'smooth' })) {
          try {
            const path = `${window.location.pathname}${window.location.search || ''}#${sectionId}`
            window.history.replaceState(window.history.state, '', path)
          } catch {
            /* empty */
          }
        }
        return
      }
      try {
        sessionStorage.setItem('pending-scroll-target', sectionId)
      } catch {
        /* empty */
      }
      router.push('/')
    },
    [isHome, router]
  )

  function renderExploreLink(link) {
    if (link.kind === 'home') {
      return (
        <Link key={link.label} href="/" onClick={handleHome} className={footerLinkClass}>
          {link.label}
        </Link>
      )
    }
    if (link.kind === 'section') {
      return (
        <a
          key={link.label}
          href={`/#${link.sectionId}`}
          onClick={(e) => handleSection(e, link.sectionId)}
          className={footerLinkClass}
        >
          {link.label}
        </a>
      )
    }
    return (
      <Link key={link.label} href={link.href} className={footerLinkClass}>
        {link.label}
      </Link>
    )
  }

  return (
    <footer className={`site-footer ${footerTop} bg-transparent dark:bg-transparent border-0 overflow-x-hidden`}>
      <div className={`site-footer__inner ${layoutShellClassName} mobile-gutter-x sm:px-6 lg:px-8 ${shellPad}`}>
        {!compact && (
          <div
            className="site-footer__divider mb-6 sm:mb-8 h-px w-full bg-gradient-to-r from-transparent via-[rgba(var(--palette-gold-rgb),0.28)] to-transparent"
            aria-hidden
          />
        )}

        {compact ? (
          <div className="site-footer__grid grid grid-cols-1 md:grid-cols-3 items-center gap-3 md:gap-2">
            <div className="site-footer__meta text-center md:text-left md:justify-self-start max-md:order-2">
              <p className="text-sm md:text-xs text-[var(--dark-muted)] tracking-[0.01em]">
                © {COPYRIGHT_YEAR} La Guarida Instrumentos
              </p>
            </div>

            <nav
              className="site-footer__social flex items-center gap-4 md:gap-3 justify-center md:justify-self-center max-md:order-1"
              aria-label="Redes y contacto"
            >
              <a
                href="https://www.instagram.com/laguaridainstrumentos/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`${socialBtnClass} md:w-8 md:h-8`}
              >
                <InstagramLogo size={24} weight="duotone" />
              </a>
              <a
                href="mailto:leonardo_ruberti@hotmail.com"
                aria-label="Correo"
                className={`${socialBtnClass} md:w-8 md:h-8`}
              >
                <EnvelopeSimple size={24} weight="duotone" />
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                onClick={trackWhatsAppClick}
                className={`${socialBtnClass} md:w-8 md:h-8`}
              >
                <WhatsappLogo size={24} weight="duotone" />
              </a>
            </nav>

            <div className="flex items-center justify-center md:justify-self-end max-md:order-3">
              <img
                src={SITE_LOGO_SRC}
                alt="La Guarida"
                width={746}
                height={194}
                loading="lazy"
                decoding="async"
                className="site-footer__logo logo-dark block h-[16px] md:h-[18px] w-auto max-w-[130px] object-contain bg-transparent"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="site-footer__main grid grid-cols-1 gap-8 max-md:gap-6 md:grid-cols-3 md:gap-8 lg:gap-12">
              <div className="site-footer__brand md:col-span-1">
                <Link href="/" onClick={handleHome} className="no-custom-btn inline-block" aria-label="Ir al inicio">
                  <img
                    src={SITE_LOGO_SRC}
                    alt="La Guarida"
                    width={746}
                    height={194}
                    loading="lazy"
                    decoding="async"
                    className="site-footer__logo logo-dark block h-[22px] sm:h-[24px] lg:h-[26px] w-auto max-w-[220px] lg:max-w-[260px] object-contain bg-transparent"
                  />
                </Link>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--dark-muted)]">
                  Guitarras e instrumentos seleccionados. Hecho por un músico, para músicos.
                </p>
                <nav className="site-footer__social mt-5 flex items-center gap-3 max-md:hidden" aria-label="Redes sociales">
                  <a
                    href="https://www.instagram.com/laguaridainstrumentos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={socialBtnClass}
                  >
                    <InstagramLogo size={20} weight="duotone" />
                  </a>
                  <a
                    href="mailto:leonardo_ruberti@hotmail.com"
                    aria-label="Correo"
                    className={socialBtnClass}
                  >
                    <EnvelopeSimple size={20} weight="duotone" />
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    onClick={trackWhatsAppClick}
                    className={socialBtnClass}
                  >
                    <WhatsappLogo size={20} weight="duotone" />
                  </a>
                </nav>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:contents">
                <nav
                  className="site-footer__nav min-w-0 md:col-span-1"
                  aria-label="Explorar el sitio"
                >
                  <p className={footerKickerClass}>Explorar</p>
                  <ul className="flex flex-col gap-2.5">
                    {EXPLORE_LINKS.map((link) => (
                      <li key={link.label}>{renderExploreLink(link)}</li>
                    ))}
                  </ul>
                </nav>

                <div className="site-footer__contact min-w-0 md:col-span-1">
                  <p className={footerKickerClass}>Contacto</p>
                  <ul className="flex flex-col gap-2.5">
                    <li>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={trackWhatsAppClick}
                        className={`${footerLinkClass} gap-2`}
                      >
                        <WhatsappLogo size={16} weight="duotone" className="shrink-0 text-[var(--vintage-gold)]" />
                        WhatsApp
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/laguaridainstrumentos/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${footerLinkClass} gap-2`}
                      >
                        <InstagramLogo size={16} weight="duotone" className="shrink-0 text-[var(--vintage-gold)]" />
                        <span className="max-md:hidden">@laguaridainstrumentos</span>
                        <span className="md:hidden">Instagram</span>
                      </a>
                    </li>
                    <li>
                      <a href="mailto:leonardo_ruberti@hotmail.com" className={`${footerLinkClass} gap-2`}>
                        <EnvelopeSimple size={16} weight="duotone" className="shrink-0 text-[var(--vintage-gold)]" />
                        <span className="max-md:hidden">leonardo_ruberti@hotmail.com</span>
                        <span className="md:hidden">Email</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="site-footer__sub mt-6 sm:mt-8 md:mt-10 border-t border-white/[0.08] pt-5 sm:pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="site-footer__meta text-left w-full md:w-auto">
                <p className="text-sm max-md:text-xs text-[var(--dark-muted)] tracking-[0.01em]">
                  © {COPYRIGHT_YEAR} La Guarida Instrumentos
                </p>
                <div className="site-footer__legal mt-1.5 flex flex-wrap items-center justify-start gap-x-3 gap-y-1 text-xs text-[var(--dark-muted)]">
                  <Link href="/privacidad" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">
                    Privacidad
                  </Link>
                  <span aria-hidden className="opacity-50">•</span>
                  <Link href="/terminos" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">
                    Términos
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-auto flex justify-start md:justify-end max-md:pr-[calc(3.75rem+env(safe-area-inset-right,0px))]">
                <DevCredit />
              </div>
            </div>

            <div className="site-footer__disclaimer mt-4 sm:mt-5 flex items-center justify-center px-1">
              <p className="footer-disclaimer text-[9px] sm:text-[10px] font-normal normal-case leading-[1.55] tracking-[0.01em] text-center max-w-2xl lg:max-w-3xl">
                Fender, Gibson, Epiphone, PRS, Ibanez, Squier y las demás marcas mencionadas son marcas registradas de sus respectivos propietarios. Sus logotipos se utilizan únicamente para identificar los productos comercializados por La Guarida Instrumentos. La Guarida Instrumentos no afirma ser distribuidor oficial salvo que se indique expresamente.
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
