"use client"
import React from 'react'

export default function About(){
  return (
    <section id="about-section" className="mt-6 sm:mt-14 md:mt-20 rounded-2xl border border-[var(--dark-border)] bg-gradient-to-b from-[var(--dark-bg-card)] to-[var(--dark-bg-page)] shadow-[0_18px_48px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-7 md:py-9 lg:py-10">
        <div className="w-full">
          <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-2 sm:mb-3">Sobre La Guarida</p>
          <h2 className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[3.2rem] mb-3 md:mb-4">Una tienda, una historia</h2>
          <p className="text-[14px] sm:text-base text-gray-700 dark:text-gray-200 mb-4 md:mb-5 leading-relaxed">Una tienda, una historia dedicada a las guitarras, a las busquedas sonoras y a quienes las tocan.</p>

          <h3 className="text-[1rem] sm:text-xl font-semibold tracking-[0.01em] text-[var(--dark-text-primary)] mb-2 md:mb-3">Hecho por un músico, para músicos</h3>

          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200 text-[14px] sm:text-base lg:prose-base [&>p]:leading-[1.78] [&>p]:mb-2.5 md:[&>p]:mb-3">
            <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

            <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

            <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

            <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
          </div>

          <div className="mt-4 md:mt-5 flex flex-wrap gap-2 sm:gap-2.5">
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Asesoramiento real</span>
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Instrumentos seleccionados</span>
            <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Atención personalizada</span>
          </div>
        </div>
      </div>
    </section>
  )
}
