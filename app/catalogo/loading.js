import { layoutShellClassName } from '../../lib/layoutShell'

export default function CatalogoLoading() {
  const shellClass = `${layoutShellClassName} mobile-gutter-x sm:px-5 md:px-8 lg:px-10 py-5 max-md:py-4 sm:py-8 md:py-10 min-[1920px]:px-12`

  return (
    <div className={`${shellClass} catalog-page catalog-page--all min-h-screen`}>
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-white/10" aria-hidden />
      <div className="mb-8 space-y-3" aria-hidden>
        <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid w-full min-w-0 grid-cols-2 gap-x-2.5 gap-y-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8" aria-hidden>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={`catalog-skeleton-${idx}`} className="overflow-hidden rounded-xl border border-white/8 bg-[var(--dark-bg-card)] md:rounded-3xl">
            <div className="aspect-square w-full animate-pulse bg-white/[0.05] md:aspect-[3/4]" />
            <div className="space-y-2 p-2.5 md:p-5">
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/15" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--dark-muted)]">Cargando catálogo…</p>
    </div>
  )
}
