"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { InstagramLogo, WhatsappLogo, EnvelopeSimple } from 'phosphor-react'

export default function About(){
  const pathname = usePathname()
  const insta = 'https://www.instagram.com/laguaridainstrumentos/'
  const phone = '+5491154661749'
  const waNumber = '5491154661749'
  const waMessage = encodeURIComponent('Hola, me interesa La Guarida, me podrias dar informacion?')
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`
  const mail = 'leonardo_ruberti@hotmail.com'

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

  return (
    <section id="about-section" className="mt-10 sm:mt-14 md:mt-20 rounded-2xl border border-[var(--dark-border)] bg-gradient-to-b from-[var(--dark-bg-card)] to-[var(--dark-bg-page)] shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-7 sm:py-10 md:py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 md:gap-10 items-start">
          <div className="md:col-span-2">
            <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-3">Sobre La Guarida</p>
            <h2 className="section-title-minimal text-[var(--dark-text-primary)] sm:text-3xl md:text-[3.2rem] mb-4 md:mb-5">Una tienda, una historia</h2>
            <p className="text-[15px] sm:text-base text-gray-700 dark:text-gray-200 mb-5 md:mb-7 max-w-3xl">Una tienda, una historia dedicada a las guitarras, a las busquedas sonoras y a quienes las tocan.</p>

            <h3 className="text-[1.05rem] sm:text-xl font-semibold tracking-[0.01em] text-[var(--dark-text-primary)] mb-3 md:mb-4">Hecho por un músico, para músicos</h3>

            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 text-[15px] sm:text-base lg:prose-base [&>p]:leading-[1.78] [&>p]:mb-3 md:[&>p]:mb-4">
              <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

              <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

              <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

              <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
            </div>

            <div className="mt-6 md:mt-7 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3.5 py-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Asesoramiento real</span>
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3.5 py-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Instrumentos seleccionados</span>
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3.5 py-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Atención personalizada</span>
            </div>
          </div>

          <aside className="md:col-span-1 bg-[var(--dark-bg-elevated)] p-4 sm:p-5 md:p-6 rounded-2xl border border-[var(--dark-border)] shadow-[0_10px_26px_rgba(0,0,0,0.2)]">
            <h4 className="section-title-minimal text-[var(--dark-text-primary)] text-[1.05rem] sm:text-[1.2rem] mb-3 md:mb-4">Contacto rápido</h4>

            <ul className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm text-gray-700 dark:text-gray-200 mb-4 md:mb-5">
              <li><strong>Teléfono:</strong> <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-orange hover:underline">{phone}</a></li>
              <li><strong>WhatsApp:</strong> <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact-orange hover:underline">Iniciar chat</a></li>
              <li><strong>Email:</strong> <a href={`mailto:${mail}`} className="contact-orange hover:underline">{mail}</a></li>
            </ul>

            <h5 className="section-subtitle-minimal text-gray-800 dark:text-white/80 mb-1.5 md:mb-2">Nuestro espacio</h5>
            <p className="text-[12px] sm:text-sm text-gray-700 dark:text-gray-200 mb-3 md:mb-4 leading-relaxed">Una sala de escucha: probá guitarras con calma y descubrí modelos únicos traídos por nuestro equipo.</p>

            <h5 className="section-subtitle-minimal text-gray-800 dark:text-white/80 mb-1.5 md:mb-2">Horarios</h5>
            <p className="text-[12px] sm:text-sm text-gray-700 dark:text-gray-200 mb-3 md:mb-4 leading-relaxed">Lunes a Viernes: 10:00 — 19:00<br/>Sábado: 10:00 — 17:00<br/>Domingo: Cerrado</p>

            <div className="mt-2 md:mt-3">
              <p className="section-subtitle-minimal text-gray-800 dark:text-white/80 mb-1.5 md:mb-2">Síguenos</p>
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
        <div className="mt-7 sm:mt-9 md:mt-11 flex justify-center">
          <Link
            href="/"
            onClick={handleVolverAlHome}
            className="inline-flex items-center justify-center min-h-[40px] sm:min-h-[44px] py-2.5 sm:py-3 px-5 sm:px-7 rounded-xl border border-white/15 bg-[var(--dark-cta-bg)] text-[var(--dark-cta-text)] text-[13px] sm:text-sm font-semibold hover:bg-[var(--dark-cta-hover)] transition-colors no-custom-btn"
          >
            Volver al home
          </Link>
        </div>
      </div>
    </section>
  )
}
