"use client"

import React, { useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'
import { scrollToHomeSectionById } from '../lib/homeSectionScroll'
import { SITE_LOGO_SRC } from '../lib/branding/logo'

const COPYRIGHT_YEAR = new Date().getFullYear()
const INSTAGRAM_HREF = 'https://www.instagram.com/laguaridainstrumentos/'
const MAIL_HREF = 'mailto:leonardo_ruberti@hotmail.com'
const DEV_CREDIT_URL = 'https://www.agustinaderdev.com/'

const EXPLORE_LINKS = [
  { label: 'Inicio', href: '/', kind: 'home' },
  { label: 'Catálogo', href: '/catalogo', kind: 'link' },
  { label: 'Favoritos', href: '/favoritos', kind: 'link' },
  { label: 'Sobre nosotros', sectionId: 'about-section', kind: 'section' },
  { label: 'Preguntas frecuentes', sectionId: 'faq-section', kind: 'section' },
]

const footerLinkClass =
  'no-custom-btn inline-flex items-center text-[13px] leading-snug text-[var(--dark-muted)] transition-colors duration-200 hover:text-[var(--dark-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vintage-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark-bg-page)] rounded-sm'

const footerKickerClass =
  'section-kicker-minimal mb-4 tracking-[0.18em]'

const socialBtnClass =
  'no-custom-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-transparent text-[var(--dark-muted)] transition-colors duration-200 hover:border-[rgba(var(--palette-gold-rgb),0.4)] hover:text-[var(--vintage-gold)]'

function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconWhatsApp({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" />
    </svg>
  )
}

function IconMail({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

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
      ? 'mt-0 md:mt-10'
      : isProductPage
        ? 'mt-4 md:mt-12'
        : 'mt-10 md:mt-14'

  const shellPad = compact
    ? 'py-4 md:py-3'
    : isProductPage
      ? 'py-8 sm:py-10'
      : 'py-8 max-md:pt-6 max-md:pb-8 sm:py-12'

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
    <footer className={`site-footer ${footerTop} overflow-x-hidden border-0 bg-[var(--dark-bg-surface)]`}>
      <div className="footer-accent-rule" aria-hidden />
      <div className={`site-footer__inner ${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 min-[1920px]:px-12 ${shellPad}`}>
        {compact ? (
          <div className="site-footer__grid grid grid-cols-1 md:grid-cols-3 items-center gap-3 md:gap-2">
            <div className="site-footer__meta text-center md:text-left md:justify-self-start max-md:order-2">
              <p className="text-sm md:text-xs text-[var(--dark-muted)] tracking-[0.01em]">
                © {COPYRIGHT_YEAR} La Guarida Instrumentos
              </p>
            </div>

            <nav
              className="site-footer__social flex items-center gap-3 justify-center md:justify-self-center max-md:order-1"
              aria-label="Redes y contacto"
            >
              <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`${socialBtnClass} md:w-8 md:h-8`}>
                <IconInstagram size={20} />
              </a>
              <a href={MAIL_HREF} aria-label="Correo" className={`${socialBtnClass} md:w-8 md:h-8`}>
                <IconMail size={20} />
              </a>
              <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" onClick={trackWhatsAppClick} className={`${socialBtnClass} md:w-8 md:h-8`}>
                <IconWhatsApp size={20} />
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
            <div className="site-footer__main grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
              <div className="site-footer__brand md:col-span-5 lg:col-span-4">
                <Link href="/" onClick={handleHome} className="no-custom-btn inline-block" aria-label="Ir al inicio">
                  <img
                    src={SITE_LOGO_SRC}
                    alt="La Guarida"
                    width={746}
                    height={194}
                    loading="lazy"
                    decoding="async"
                    className="site-footer__logo logo-dark block h-[28px] sm:h-[32px] lg:h-[36px] w-auto max-w-[280px] object-contain object-left bg-transparent"
                  />
                </Link>
                <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-[var(--dark-muted)] sm:text-sm">
                  Guitarras e instrumentos seleccionados. Hecho por un músico, para músicos.
                </p>
                <nav className="site-footer__social mt-6 flex items-center gap-2.5" aria-label="Redes sociales">
                  <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialBtnClass}>
                    <IconInstagram size={18} />
                  </a>
                  <a href={MAIL_HREF} aria-label="Correo" className={socialBtnClass}>
                    <IconMail size={18} />
                  </a>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" onClick={trackWhatsAppClick} className={socialBtnClass}>
                    <IconWhatsApp size={18} />
                  </a>
                </nav>
              </div>

              <div className="grid grid-cols-2 gap-8 md:contents">
              <nav className="site-footer__nav md:col-span-3 lg:col-span-2" aria-label="Explorar el sitio">
                <p className={footerKickerClass}>Explorar</p>
                <ul className="flex flex-col gap-3">
                  {EXPLORE_LINKS.map((link) => (
                    <li key={link.label}>{renderExploreLink(link)}</li>
                  ))}
                </ul>
              </nav>

              <div className="site-footer__contact md:col-span-4 lg:col-span-3">
                <p className={footerKickerClass}>Contacto</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className={`${footerLinkClass} gap-2`}>
                      <span className="shrink-0 text-[var(--vintage-gold)]"><IconWhatsApp size={16} /></span>
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" className={`${footerLinkClass} gap-2`}>
                      <span className="shrink-0 text-[var(--vintage-gold)]"><IconInstagram size={16} /></span>
                      <span className="max-md:hidden">@laguaridainstrumentos</span>
                      <span className="md:hidden">Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a href={MAIL_HREF} className={`${footerLinkClass} gap-2`}>
                      <span className="shrink-0 text-[var(--vintage-gold)]"><IconMail size={16} /></span>
                      <span className="max-md:hidden">leonardo_ruberti@hotmail.com</span>
                      <span className="md:hidden">Email</span>
                    </a>
                  </li>
                </ul>
              </div>
              </div>

              <div className="md:col-span-12 lg:col-span-3">
                <p className={footerKickerClass}>Asesoramiento</p>
                <p className="max-w-xs text-[13px] leading-relaxed text-[var(--dark-muted)]">
                  Stock real y respuesta directa. Escribinos y te orientamos.
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackWhatsAppClick}
                  className="no-custom-btn site-accent-pill site-accent-pill--lg mt-5"
                >
                  Consultar ahora
                </a>
              </div>
            </div>

            <div className="site-footer__sub mt-10 md:mt-12 border-t border-white/[0.07] pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="site-footer__meta text-left w-full md:w-auto">
                <p className="text-xs text-[var(--dark-muted)] tracking-[0.02em]">
                  © {COPYRIGHT_YEAR} La Guarida Instrumentos
                </p>
                <div className="site-footer__legal mt-2 flex flex-wrap items-center justify-start gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-[var(--dark-muted)]">
                  <Link href="/privacidad" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">
                    Privacidad
                  </Link>
                  <span aria-hidden className="opacity-40">·</span>
                  <Link href="/terminos" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">
                    Términos
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-auto flex justify-start md:justify-end max-md:pr-[calc(3.75rem+env(safe-area-inset-right,0px))]">
                <DevCredit />
              </div>
            </div>

            <div className="site-footer__disclaimer mt-5 sm:mt-6 flex items-center justify-center px-1">
              <p className="footer-disclaimer text-[9px] sm:text-[10px] font-normal normal-case leading-[1.6] tracking-[0.01em] text-center max-w-2xl lg:max-w-3xl">
                Fender, Gibson, Epiphone, PRS, Ibanez, Squier y las demás marcas mencionadas son marcas registradas de sus respectivos propietarios. Sus logotipos se utilizan únicamente para identificar los productos comercializados por La Guarida Instrumentos. La Guarida Instrumentos no afirma ser distribuidor oficial salvo que se indique expresamente.
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
