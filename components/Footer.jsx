"use client"

import React from 'react'
import { InstagramLogo, EnvelopeSimple, WhatsappLogo } from 'phosphor-react'

export default function Footer(){
  return (
    <footer className="mt-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} La Guarida</p>

          <nav className="flex items-center gap-4 text-sm">
            <a href="https://instagram.com/example" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-pink-600 transition-colors">
              <InstagramLogo size={20} weight="duotone" />
            </a>

            <a href="mailto:info@example.com" aria-label="Correo" className="text-gray-600 hover:text-indigo-600 transition-colors">
              <EnvelopeSimple size={20} weight="duotone" />
            </a>

            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-600 hover:text-emerald-500 transition-colors">
              <WhatsappLogo size={20} weight="duotone" />
            </a>
          </nav>

          <p className="text-sm text-gray-500">Edición · Catálogo editorial</p>
        </div>
      </div>
    </footer>
  )
}

