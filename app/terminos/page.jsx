import React from 'react'

export const metadata = {
  title: 'Términos y condiciones — La Guarida',
  description: 'Condiciones de uso del sitio y pautas comerciales de La Guarida Instrumentos.',
}

export default function TerminosPage() {
  return (
    <main className="container-tight py-8 sm:py-10 md:py-14">
      <article className="max-w-4xl mx-auto rounded-2xl border border-white/16 bg-[#161920] px-5 sm:px-7 md:px-10 py-6 sm:py-8 md:py-10 shadow-[0_18px_46px_rgba(0,0,0,0.34)]">
        <p className="section-kicker-minimal text-[var(--dark-muted)] mb-2">Legal</p>
        <h1 className="text-[1.85rem] sm:text-[2.2rem] md:text-[2.5rem] font-bold tracking-tight text-[var(--dark-text-primary)] leading-[1.08]">
          Términos y condiciones
        </h1>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </p>
        <p className="mt-4 text-[14px] sm:text-[15px] md:text-base text-[var(--dark-text-secondary)] max-w-3xl leading-relaxed">
          Estas condiciones regulan el uso del sitio y las pautas generales de nuestras operaciones comerciales.
        </p>

        <div className="mt-7 space-y-0 text-[14px] sm:text-[15px] md:text-base leading-relaxed text-[var(--dark-text-secondary)]">
          <section className="px-2 sm:px-3 py-4 sm:py-5 border-t border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">01. Uso del sitio</h2>
            <p className="mt-1.5">
              El uso de este sitio implica la aceptación de estos términos. El contenido se ofrece con fines informativos
              y comerciales sobre productos y servicios de La Guarida Instrumentos.
            </p>
          </section>

          <section className="px-2 sm:px-3 py-4 sm:py-5 border-t border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">02. Productos y disponibilidad</h2>
            <p className="mt-1.5">
              La disponibilidad, descripciones e imágenes de productos pueden variar sin previo aviso. Publicaciones y
              detalles técnicos están sujetos a actualización.
            </p>
          </section>

          <section className="px-2 sm:px-3 py-4 sm:py-5 border-t border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">03. Precios y medios de pago</h2>
            <p className="mt-1.5">
              Los precios informados pueden modificarse. Las condiciones de pago se confirman al momento de la operación
              por los canales oficiales de contacto.
            </p>
          </section>

          <section className="px-2 sm:px-3 py-4 sm:py-5 border-t border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">04. Envíos y entregas</h2>
            <p className="mt-1.5">
              Los tiempos y costos de envío dependen del destino y del operador logístico. La coordinación final se realiza
              con el cliente antes del cierre de cada venta.
            </p>
          </section>

          <section className="px-2 sm:px-3 py-4 sm:py-5 border-t border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">05. Responsabilidad</h2>
            <p className="mt-1.5">
              Hacemos esfuerzos razonables para mantener información actualizada y exacta, pero no garantizamos ausencia de
              errores tipográficos o interrupciones temporales del servicio.
            </p>
          </section>

          <section className="px-2 sm:px-3 py-4 sm:py-5 border-y border-[var(--dark-border)]">
            <h2 className="text-[15px] sm:text-[1.02rem] md:text-[1.08rem] font-semibold text-[var(--dark-text-primary)]">06. Contacto</h2>
            <p className="mt-1.5">
              Para consultas sobre estos términos o una operación puntual, podés comunicarte por WhatsApp o correo desde
              los canales publicados en el sitio.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
