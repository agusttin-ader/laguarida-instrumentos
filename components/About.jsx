"use client"
import React from 'react'

export default function About(){
  return (
    <section id="about-section" className="mt-6 sm:mt-14 md:mt-20 rounded-2xl border border-[var(--dark-border)] bg-gradient-to-b from-[var(--dark-bg-card)] to-[var(--dark-bg-page)] shadow-[0_18px_48px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-11">
        <div className="w-full">
          <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-2 sm:mb-3">Sobre La Guarida</p>
          <h2 className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[3.2rem] mb-3 md:mb-4 tracking-tight">Una tienda, una historia</h2>
          <p className="text-[14px] sm:text-base text-gray-700 dark:text-gray-200 mb-5 md:mb-6 leading-relaxed max-w-3xl">Una tienda, una historia dedicada a las guitarras, a las búsquedas sonoras y a quienes las tocan.</p>

          <div className="rounded-xl border border-[var(--dark-border)] bg-white/[0.03] px-4 sm:px-5 py-3 sm:py-4 mb-5 md:mb-6">
            <p className="text-[13px] sm:text-[15px] italic text-[var(--dark-text-secondary)] leading-relaxed">Hecho por un músico, para músicos.</p>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 text-[14px] sm:text-base lg:prose-base [&>p]:leading-[1.86] [&>p]:mb-3 md:[&>p]:mb-3.5">
            <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

            <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

            <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

            <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
          </div>

          <div className="mt-5 md:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Asesoramiento real</span>
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Instrumentos seleccionados</span>
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Atención personalizada</span>
          </div>
        </div>
      </div>
    </section>
  )
}
