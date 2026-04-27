"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'
import { layoutShellClassName } from '../lib/layoutShell'
import { buildWaMeHref, WHATSAPP_DEFAULT_WEB_MESSAGE } from '../lib/whatsappWeb'

export default function Footer({ compact = false }){
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  const waHref = buildWaMeHref(WHATSAPP_DEFAULT_WEB_MESSAGE)
  const footerTop = compact ? 'mt-0' : isHome ? 'mt-4 md:mt-8' : 'mt-8 md:mt-12'

  return (
    <footer className={`${footerTop} bg-transparent dark:bg-transparent border-0 overflow-x-hidden`}>
      <div className={`${layoutShellClassName} px-4 sm:px-6 lg:px-8 ${compact ? 'py-4 md:py-3' : 'py-6 sm:py-8'}`}>
        {!compact && <div className="mb-4 sm:mb-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />}
        <div className={`grid grid-cols-1 md:grid-cols-3 items-center ${compact ? 'gap-3 md:gap-2' : 'gap-4 sm:gap-6'}`}>
          <div className="text-center md:text-left md:justify-self-start">
            <p className={`${compact ? 'text-sm md:text-xs' : 'text-sm'} text-[var(--dark-muted)] tracking-[0.01em]`}>© {new Date().getFullYear()} La Guarida Instrumentos</p>
            {!compact && (
              <div className="mt-1.5 flex items-center justify-center md:justify-start gap-3 text-xs text-[var(--dark-muted)]">
                <Link href="/privacidad" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors">Privacidad</Link>
                <span aria-hidden className="opacity-50">•</span>
                <Link href="/terminos" className="no-custom-btn hover:text-[var(--dark-text-secondary)] transition-colors">Términos</Link>
              </div>
            )}
          </div>

          <nav className={`flex items-center ${compact ? 'gap-4 md:gap-3' : 'gap-4'} justify-center md:justify-self-center`} aria-label="Redes y contacto">
            <a href="https://www.instagram.com/laguaridainstrumentos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : 'flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
              <InstagramLogo size={compact ? 24 : 20} weight="duotone" />
            </a>

            <a href="mailto:leonardo_ruberti@hotmail.com" aria-label="Correo" className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : 'flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
              <EnvelopeSimple size={compact ? 24 : 20} weight="duotone" />
            </a>

            <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={`no-custom-btn !text-[var(--dark-muted)] hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : 'flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
              <WhatsappLogo size={compact ? 24 : 20} weight="duotone" />
            </a>
          </nav>

          <div className="flex items-center justify-center md:justify-self-end">
            <div className={`footer-logo-wrapper relative ${compact ? 'w-[130px] h-6 md:w-[130px] md:h-6' : 'w-[140px] h-6 md:w-[200px] md:h-8'}`}>
              <Image src="/images/logo/logo-fondo-oscuro.PNG" alt="La Guarida" fill className={compact ? 'scale-[1.28] md:scale-[1.34]' : 'scale-[1.5] md:scale-[1.6]'} style={{ objectFit: 'contain' }} quality={68} sizes="(min-width:768px) 200px, 140px" loading="lazy" />
            </div>
          </div>
        </div>
        {!compact && (
          <div className="mt-5 sm:mt-6 flex items-center justify-center">
            <p className="footer-credit text-[11px] sm:text-xs tracking-[0.08em] uppercase">
              Diseñada por <span className="footer-credit-name">Agustín Ader</span>
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}

