"use client"
import React from 'react'
import { layoutShellClassName } from '../lib/layoutShell'
export default function About({ compactTop = false }) {
  const topPadding = compactTop
    ? 'pt-0 sm:pt-1 md:pt-2'
    : 'pt-4 sm:pt-7 md:pt-9 lg:pt-10'

  return (
    <section id="about-section" className="mt-0">
      <div className={`${layoutShellClassName} sm:px-5 md:px-6 lg:px-8 ${topPadding} pb-0 sm:pb-1 md:pb-2 lg:pb-2`}>
          <div className="w-full">
            <p className="section-kicker-minimal section-underline-ocre text-gray-700 dark:text-white/70 mb-2 sm:mb-3">Sobre La Guarida</p>
            <h2 className="section-title-minimal text-[var(--dark-text-primary)] text-2xl sm:text-3xl md:text-[3.2rem] mb-3 md:mb-4 tracking-tight">Una tienda, una historia</h2>
            <p className="mb-5 hidden max-w-3xl text-[14px] leading-relaxed text-gray-700 dark:text-gray-200 sm:text-base md:mb-6 md:block">
              Una tienda, una historia dedicada a las guitarras, a las búsquedas sonoras y a quienes las tocan.
            </p>
            <p className="mb-4 max-w-3xl max-md:max-w-none text-base leading-relaxed text-gray-200 md:hidden">
              Guitarras e instrumentos seleccionados, con trato cercano y asesoramiento real para quienes buscan un sonido propio.
            </p>

            <div className="rounded-xl border border-[var(--dark-border)] bg-white/[0.03] px-4 sm:px-5 py-3 sm:py-4 mb-5 md:mb-6">
              <p className="text-base sm:text-[15px] italic text-[var(--dark-text-secondary)] leading-relaxed">
                Hecho por un músico, para músicos.
              </p>
            </div>

            <div className="prose prose-sm max-w-none text-base text-gray-200 md:hidden [&>p]:mb-0 [&>p]:leading-relaxed [&>p]:text-base">
              <p>
                La Guarida nació como un proyecto personal y creció como un refugio para la música: honestidad,
                instrumentos curados y atención directa. Si tenés dudas, escribinos.
              </p>
            </div>

            <div className="prose prose-sm hidden max-w-none text-[14px] text-gray-700 dark:text-gray-200 sm:text-base lg:prose-base md:block [&>p]:mb-3 md:[&>p]:mb-3.5 [&>p]:leading-[1.86] [&>p:last-child]:mb-1 md:[&>p:last-child]:mb-1.5">
              <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

              <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

              <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento y un espacio para probar y encontrar lo que realmente te inspira.</p>

              <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas o simplemente querés pasar a saludar, mi puerta está abierta.</p>
            </div>

            <div className="mt-2 md:mt-3 flex flex-wrap gap-2.5 sm:gap-3">
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Asesoramiento real</span>
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Instrumentos seleccionados</span>
              <span className="inline-flex items-center rounded-full border border-gray-300/70 dark:border-white/15 px-3 py-1.5 sm:px-3.5 text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5">Atención personalizada</span>
            </div>
          </div>
      </div>
    </section>
  )
}
