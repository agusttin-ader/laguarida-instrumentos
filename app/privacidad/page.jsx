import React from 'react'
import { absoluteUrl } from '../../lib/siteUrl'

export const metadata = {
  title: 'Política de privacidad',
  description: 'Cómo recopilamos, usamos y protegemos tus datos en La Guarida Instrumentos.',
  alternates: {
    canonical: absoluteUrl('/privacidad'),
  },
}

export const dynamic = 'force-dynamic'

export default function PrivacidadPage() {
  return (
    <main className="legal-page container-tight py-8 sm:py-10 md:py-14">
      <article className="max-w-4xl mx-auto bg-transparent">
        <p className="section-kicker-minimal text-[var(--dark-muted)] mb-2">Legal</p>
        <h1 className="text-[1.85rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold tracking-tight text-[var(--dark-text-primary)] leading-[1.08]">
          Política de privacidad
        </h1>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </p>
        <p className="mt-4 text-[14px] sm:text-[15px] md:text-base text-[var(--dark-text-secondary)] max-w-3xl leading-relaxed">
          En esta página explicamos de forma clara cómo tratamos tu información cuando navegás el sitio o te contactás con nosotros.
        </p>

        <div className="mt-10 space-y-8 text-[14px] sm:text-[15px] md:text-base leading-relaxed text-[var(--dark-text-secondary)]">
          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">01. Información que recopilamos</h2>
            <p className="mt-1.5">
              Podemos recopilar datos de contacto que nos compartís voluntariamente (por ejemplo, por WhatsApp o correo),
              datos técnicos básicos de navegación y consultas relacionadas con productos.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">02. Uso de la información</h2>
            <p className="mt-1.5">
              Utilizamos la información para responder consultas, brindar asesoramiento comercial, mejorar la experiencia
              del sitio y mantener la seguridad de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">03. Conservación y protección de datos</h2>
            <p className="mt-1.5">
              Aplicamos medidas razonables para proteger la información. Conservamos los datos durante el tiempo necesario
              para cumplir las finalidades descriptas o requerimientos legales aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">04. Compartición con terceros</h2>
            <p className="mt-1.5">
              No vendemos datos personales. Podemos usar servicios de terceros para operar el sitio (por ejemplo, hosting,
              mensajería o analítica), bajo condiciones de confidencialidad y seguridad.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">05. Derechos del usuario</h2>
            <p className="mt-1.5">
              Podés solicitar acceso, actualización o eliminación de tus datos escribiendo a nuestros canales de contacto.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">06. Cambios en esta política</h2>
            <p className="mt-1.5">
              Esta política puede actualizarse para reflejar mejoras del servicio o cambios normativos. La versión vigente
              es la publicada en esta página.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
