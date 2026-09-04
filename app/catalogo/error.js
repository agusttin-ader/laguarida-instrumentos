'use client'

import Button from '../../components/Button'
import { layoutShellClassName } from '../../lib/layoutShell'

export default function CatalogoError({ reset }) {
  const shellClass = `${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 py-10`

  return (
    <div className={`${shellClass} min-h-[60vh] flex flex-col items-center justify-center text-center`}>
      <p className="text-accent-gold text-[10px] font-semibold uppercase tracking-[0.2em]">
        Catálogo
      </p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-[var(--dark-text-primary)] sm:text-3xl">
        No pudimos cargar el catálogo
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--dark-muted)] sm:text-base">
        Puede ser un problema temporal de conexión o de caché del navegador. Probá recargar la página.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="gold" onClick={() => reset()}>
          Reintentar
        </Button>
        <Button href="/" variant="ghost-subtle">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
