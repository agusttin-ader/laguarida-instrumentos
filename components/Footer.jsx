"use client"

import React from 'react'
import Image from 'next/image'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'

export default function Footer({ compact = false }){
  const waHref = `https://wa.me/5491154661749?text=${encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')}`

  return (
    <footer className={`${compact ? 'mt-0' : 'mt-8 md:mt-20'} bg-transparent dark:bg-transparent border-0 overflow-x-hidden`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-4 md:py-3' : 'py-6 sm:py-8'}`}>
        <div className={`grid grid-cols-1 md:grid-cols-3 items-center ${compact ? 'gap-3 md:gap-2' : 'gap-4 sm:gap-6'}`}>
          <p className={`${compact ? 'text-sm md:text-xs' : 'text-sm'} text-gray-400 text-center md:text-left md:justify-self-start`}>© {new Date().getFullYear()} La Guarida</p>

          <nav className={`flex items-center ${compact ? 'gap-4 md:gap-3' : 'gap-4'} justify-center md:justify-self-center`}>
            <a href="https://www.instagram.com/laguaridainstrumentos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={`!text-gray-400 hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : ''}`}>
              <InstagramLogo size={compact ? 24 : 20} weight="duotone" />
            </a>

            <a href="mailto:leonardo_ruberti@hotmail.com" aria-label="Correo" className={`!text-gray-400 hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : ''}`}>
              <EnvelopeSimple size={compact ? 24 : 20} weight="duotone" />
            </a>

            <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={`!text-gray-400 hover:!text-[var(--vintage-gold)] transition-colors duration-300 ${compact ? 'flex items-center justify-center w-10 h-10 md:w-8 md:h-8' : ''}`}>
              <WhatsappLogo size={compact ? 24 : 20} weight="duotone" />
            </a>
          </nav>

          <div className="flex items-center justify-center md:justify-self-center">
            <div className={`footer-logo-wrapper relative ${compact ? 'w-[130px] h-6 md:w-[130px] md:h-6' : 'w-[140px] h-6 md:w-[200px] md:h-8'}`}>
              <Image src="/images/logo/logo-fondo-oscuro.PNG" alt="La Guarida" fill className={compact ? 'scale-[1.28] md:scale-[1.34]' : 'scale-[1.5] md:scale-[1.6]'} style={{ objectFit: 'contain' }} quality={100} sizes="(min-width:768px) 200px, 140px" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

