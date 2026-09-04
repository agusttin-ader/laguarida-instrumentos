import React from 'react'

export default function About({ compactTop = false }) {
  const topPadding = compactTop
    ? 'pt-0 sm:pt-0 md:pt-1'
    : 'pt-3 sm:pt-5 md:pt-6 lg:pt-7'

  return (
    <section id="about-section" className="mt-0 w-full">
      <div className={`w-full ${topPadding} pb-0 sm:pb-1 md:pb-2 lg:pb-2`}>
        <div className="w-full">
          <p className="section-kicker-minimal section-underline-ocre mb-2 sm:mb-3">
            Sobre La Guarida
          </p>
          <h2 className="section-heading-editorial mb-3 md:mb-4">
            Una tienda, una historia
          </h2>
          <p className="mb-5 hidden max-w-3xl text-[15px] leading-relaxed text-[var(--dark-text-secondary)] sm:text-base md:mb-8 md:block">
            Una tienda, una historia dedicada a las guitarras, a las búsquedas sonoras y a quienes las tocan.
          </p>
          <p className="mb-4 max-w-3xl max-md:max-w-none text-base leading-relaxed text-[var(--dark-text-secondary)] md:hidden">
            Guitarras e instrumentos seleccionados, con trato cercano y asesoramiento real para quienes buscan un sonido propio.
          </p>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] md:gap-10 lg:gap-14 md:items-start">
            <div className="min-w-0">
              <div className="prose prose-sm max-w-none text-base text-[var(--dark-text-secondary)] md:hidden [&>p]:mb-0 [&>p]:leading-relaxed [&>p]:text-base">
                <p>
                  La Guarida nació como un proyecto personal y creció como un refugio para la música: honestidad,
                  instrumentos seleccionados y atención directa. Si tenés dudas, escribinos.
                </p>
              </div>

              <div className="prose prose-sm hidden max-w-none text-[15px] text-[var(--dark-text-secondary)] sm:text-base lg:prose-base md:block [&>p]:mb-3 md:[&>p]:mb-3.5 [&>p]:leading-[1.86] [&>p:last-child]:mb-1 md:[&>p:last-child]:mb-1.5">
                <p>La Guarida nació en el corazón de una ciudad que parecía detenerse durante la pandemia. Lo que comenzó como un pequeño proyecto de compra y venta —mi proyecto personal— se convirtió, paso a paso, en un lugar donde las guitarras encuentran dueño y las voces encuentran su refugio.</p>

                <p>Durante aquellos meses inciertos, la gente vino con historias; me contaban canciones que necesitaban salir. Así, de a poco, La Guarida dejó de ser sólo un negocio y pasó a ser un refugio para la música.</p>

                <p>Hoy mantengo esa filosofía: trabajo con honestidad, priorizo el trato cercano y creo que una buena guitarra no sólo suena mejor, sino que tiene una historia que vale la pena cuidar. Desde instrumentos vintage hasta modelos modernos, ofrezco asesoramiento para que encuentres lo que realmente te inspira.</p>

                <p>Mi compromiso es simple: calidad, transparencia y pasión por la música. Si tenés dudas, escribinos por Instagram o WhatsApp.</p>
              </div>
            </div>

            <aside className="md:sticky md:top-24">
              <p className="text-lg italic leading-relaxed text-[var(--dark-text-secondary)] sm:text-[1.05rem] md:text-xl md:leading-[1.65]">
                Hecho por un músico, para músicos.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
