"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'
import { SITE_LOGO_SRC } from '../lib/branding/logo'

export default function Footer({ compact = false }){
  const pathname = usePathname()
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
      ? 'py-4 sm:py-7'
      : isHome
        ? 'py-3 max-md:pt-2 max-md:pb-4 sm:py-8'
        : 'py-6 sm:py-8'

  const socialBtnClass = compact
    ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8'
    : 'flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.97]'

  return (
    <footer className={`site-footer ${footerTop} bg-transparent dark:bg-transparent border-0 overflow-x-hidden`}>
      <div className={`site-footer__inner ${layoutShellClassName} mobile-gutter-x sm:px-6 lg:px-8 ${shellPad}`}>
        {!compact && (
          <div className="site-footer__divider mb-4 sm:mb-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />
        )}
        <div className={`site-footer__grid grid grid-cols-1 md:grid-cols-3 items-center ${compact ? 'gap-3 md:gap-2' : 'gap-4 sm:gap-6'}`}>
          <div className="site-footer__meta text-center md:text-left md:justify-self-start max-md:order-2">
            <p className={`${compact ? 'text-sm md:text-xs' : 'text-sm max-md:text-xs'} text-[var(--dark-muted)] tracking-[0.01em]`}>
              © {new Date().getFullYear()} La Guarida Instrumentos
            </p>
            {!compact && (
              <div className="site-footer__legal mt-1.5 flex items-center justify-center md:justify-start gap-3 text-xs text-[var(--dark-muted)]">
                <Link href="/privacidad" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">Privacidad</Link>
                <span aria-hidden className="opacity-50">•</span>
                <Link href="/terminos" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors duration-200">Términos</Link>
              </div>
            )}
          </div>

          <nav className={`site-footer__social flex items-center ${compact ? 'gap-4 md:gap-3' : 'gap-3.5 md:gap-4'} justify-center md:justify-self-center max-md:order-1`} aria-label="Redes y contacto">
            <a href="https://www.instagram.com/laguaridainstrumentos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-200 ${socialBtnClass}`}>
              <InstagramLogo size={compact ? 24 : 20} weight="duotone" />
            </a>
            <a href="mailto:leonardo_ruberti@hotmail.com" aria-label="Correo" className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-200 ${socialBtnClass}`}>
              <EnvelopeSimple size={compact ? 24 : 20} weight="duotone" />
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" onClick={trackWhatsAppClick} className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-200 ${socialBtnClass}`}>
              <WhatsappLogo size={compact ? 24 : 20} weight="duotone" />
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
              className={`site-footer__logo logo-dark block w-auto object-contain bg-transparent ${
                compact
                  ? 'h-[16px] md:h-[18px] max-w-[130px]'
                  : 'h-[18px] md:h-[22px] lg:h-[24px] xl:h-[26px] max-w-[200px] lg:max-w-[240px]'
              }`}
            />
          </div>
        </div>
        {!compact && (
          <>
            <div className="site-footer__disclaimer mt-3 sm:mt-4 flex items-center justify-center px-1">
              <p className="footer-disclaimer text-[9px] sm:text-[10px] font-normal normal-case leading-[1.55] tracking-[0.01em] text-center max-w-2xl lg:max-w-3xl">
                Fender, Gibson, Epiphone, PRS, Ibanez, Squier y las demás marcas mencionadas son marcas registradas de sus respectivos propietarios. Sus logotipos se utilizan únicamente para identificar los productos comercializados por La Guarida Instrumentos. La Guarida Instrumentos no afirma ser distribuidor oficial salvo que se indique expresamente.
              </p>
            </div>
            <div className="site-footer__credit mt-3 sm:mt-4 flex items-center justify-center">
              <p className="footer-credit text-[10px] sm:text-[11px] font-normal normal-case tracking-[0.02em] text-center max-w-md">
                Diseño e interfaz — Agustín Ader
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
