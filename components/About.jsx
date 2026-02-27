"use client"
import React from 'react'
import { InstagramLogo, WhatsappLogo, EnvelopeSimple } from 'phosphor-react'

export default function About(){
  const insta = 'https://www.instagram.com/laguaridainstrumentos/'
  const phone = '+5491154661749'
  const waNumber = '5491154661749'
  const waMessage = encodeURIComponent('Hola me gustaria info sobre el catalogo porfavor !')
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`
  const mail = 'leonardo_ruberti@hotmail.com'
  function scrollToTop(e) {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <section id="about-section" className="mt-14 md:mt-24 bg-white dark:bg-[#050506] border border-white/5 rounded-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-[1.7rem] sm:text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3 md:mb-4">Una tienda, una historia</h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 mb-4 md:mb-6">Una tienda, una historia dedicada a las guitarras, a las busquedas sonoras y a quienes las tocan.</p>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">Hecho por un músico, para músicos</h3>

            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 text-[15px] sm:text-base lg:prose-base [&>p]:leading-relaxed [&>p]:mb-3 md:[&>p]:mb-4">
              <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

              <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

              <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

              <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
            </div>
          </div>

          <aside className="md:col-span-1 bg-gray-50 dark:bg-[#1e1e22] p-4 sm:p-6 rounded-xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">Contacto rápido</h4>

            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-3 md:mb-4">
              <li><strong>Teléfono:</strong> <a href={`tel:${phone}`} className="contact-orange hover:underline">{phone}</a></li>
              <li><strong>WhatsApp:</strong> <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-orange hover:underline">Iniciar chat</a></li>
              <li><strong>Email:</strong> <a href={`mailto:${mail}`} className="contact-orange hover:underline">{mail}</a></li>
            </ul>

            <h5 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5 md:mb-2">Nuestro espacio</h5>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-3 md:mb-4">Una sala de escucha: probá guitarras con calma y descubrí modelos únicos traídos por nuestro equipo.</p>

            <h5 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5 md:mb-2">Horarios</h5>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-3 md:mb-4 leading-snug">Lunes a Viernes: 10:00 — 19:00<br/>Sábado: 10:00 — 17:00<br/>Domingo: Cerrado</p>

            <div className="mt-2 md:mt-3">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1.5 md:mb-2">Síguenos</p>
              <nav className="flex items-center gap-3">
                <a href={insta} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-700 dark:text-gray-200 hover:text-pink-600">
                  <InstagramLogo size={20} weight="duotone" />
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-700 dark:text-gray-200 hover:text-emerald-500">
                  <WhatsappLogo size={20} weight="duotone" />
                </a>
                <a href={`mailto:${mail}`} aria-label="Email" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                  <EnvelopeSimple size={20} weight="duotone" />
                </a>
              </nav>
            </div>
          </aside>
        </div>
        <div className="mt-8 md:mt-10 flex justify-center">
          <a
            href="/"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-xl border border-white/25 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Volver al home
          </a>
        </div>
      </div>
    </section>
  )
}
