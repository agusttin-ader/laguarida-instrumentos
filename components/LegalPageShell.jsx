import Link from 'next/link'
import { homeSectionShellClass } from '../lib/layoutShell'

export default function LegalPageShell({
  title,
  intro,
  updatedLabel = `Última actualización: ${new Date().toLocaleDateString('es-AR')}`,
  children,
}) {
  return (
    <main className={`legal-page ${homeSectionShellClass} py-8 max-md:py-7 sm:py-10 md:py-14`}>
      <article className="legal-page__article mx-auto w-full max-w-3xl">
        <nav aria-label="Breadcrumb" className="legal-page__breadcrumb mb-4 text-xs text-[var(--dark-muted)] sm:text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="no-custom-btn inline-flex min-h-11 items-center hover:text-[var(--dark-text-primary)] transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden className="opacity-50">/</li>
            <li className="text-[var(--dark-text-secondary)]" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        <p className="section-kicker-minimal section-underline-ocre mb-2">Legal</p>
        <h1 className="section-heading-editorial max-md:text-[1.65rem]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--dark-muted)]">{updatedLabel}</p>
        {intro ? (
          <p className="legal-page__intro mt-4 max-w-2xl text-sm leading-relaxed text-[var(--dark-text-secondary)] sm:text-[15px] md:text-base">
            {intro}
          </p>
        ) : null}

        <div className="legal-page__content mt-8 space-y-8 sm:mt-10 md:mt-12">{children}</div>
      </article>
    </main>
  )
}

export function LegalSection({ title, children }) {
  return (
    <section className="legal-page__section">
      <h2 className="legal-page__section-title">{title}</h2>
      <div className="legal-page__section-body">{children}</div>
    </section>
  )
}
