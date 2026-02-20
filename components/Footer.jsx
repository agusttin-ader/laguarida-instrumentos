"use client"

import React from 'react'
import Image from 'next/image'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'

export default function Footer(){
  return (
    <footer className="mt-20 bg-transparent dark:bg-transparent border-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} La Guarida</p>

          <nav className="flex items-center gap-4 text-sm">
            <a href="https://www.instagram.com/laguaridainstrumentos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-pink-600 transition-colors">
              <InstagramLogo size={20} weight="duotone" />
            </a>

            <a href="mailto:leonardo_ruberti@hotmail.com" aria-label="Correo" className="text-gray-600 hover:text-indigo-600 transition-colors">
              <EnvelopeSimple size={20} weight="duotone" />
            </a>

            <a href="https://wa.me/5491154661749" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-600 hover:text-emerald-500 transition-colors">
              <WhatsappLogo size={20} weight="duotone" />
            </a>
          </nav>

          <div className="flex items-center justify-center">
            <div className="footer-logo-wrapper relative w-[140px] h-6 md:w-[200px] md:h-8">
              <Image src="/images/logo/logo-fondo-claro.PNG" alt="La Guarida logo claro" fill style={{objectFit:'contain'}} className="logo-light" quality={100} sizes="(min-width:768px) 200px, 140px" loading="lazy" />
              <Image src="/images/logo/logo-fondo-oscuro.PNG" alt="La Guarida logo oscuro" fill style={{objectFit:'contain'}} className="logo-dark" quality={100} sizes="(min-width:768px) 200px, 140px" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

