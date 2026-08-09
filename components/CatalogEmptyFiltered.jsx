'use client'

import Link from 'next/link'
import Button from './Button'
import { buildWaMeHref } from '../lib/whatsappWeb'
import { catalogHref } from '../lib/catalog/catalogFilters'
import { trackWhatsAppClick } from '../lib/trackWhatsAppClick'

const WA_HREF = buildWaMeHref(
  'Hola, vengo de la web de La Guarida. Estoy buscando un instrumento en el catálogo y no encontré resultados con mis filtros. ¿Me podrías orientar?'
)

export default function CatalogEmptyFiltered({
  marcaParam = '',
  modeloParam = '',
  onClear,
}) {
  const clearHref = catalogHref({
    marca: marcaParam || undefined,
    modelo: modeloParam || undefined,
  })

  function handleWhatsAppClick() {
    trackWhatsAppClick()
  }

  return (
    <div className="catalog-empty-filtered rounded-2xl border border-[var(--dark-border)] bg-[var(--dark-bg-card)] px-5 py-10 text-center sm:px-8">
      <h3 className="text-lg font-semibold text-[var(--dark-text-primary)]">
        No hay instrumentos con estos filtros
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--dark-muted)]">
        Probá ampliar el rango de precio, cambiar el tipo o limpiar los filtros. También podés escribirnos por WhatsApp.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {typeof onClear === 'function' ? (
          <Button
            type="button"
            variant="ghost-subtle"
            className="min-h-11 w-full sm:w-auto"
            onClick={onClear}
          >
            Limpiar filtros
          </Button>
        ) : (
          <Button href={clearHref} variant="ghost-subtle" className="min-h-11 w-full sm:w-auto">
            Limpiar filtros
          </Button>
        )}
        <Button
          href={WA_HREF}
          variant="whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="min-h-11 w-full sm:w-auto"
        >
          Consultar por WhatsApp
        </Button>
      </div>
      <p className="mt-4 text-xs text-[var(--dark-muted)]">
        <Link
          href="/catalogo"
          className="no-custom-btn inline-flex min-h-11 items-center underline-offset-4 hover:underline hover:text-[var(--dark-text-primary)]"
        >
          Ver todo el catálogo
        </Link>
      </p>
    </div>
  )
}
