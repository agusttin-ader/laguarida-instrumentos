import Button from './Button'
import { layoutShellClassName } from '../lib/layoutShell'
import { getHomeHeroPhotoSources } from '../lib/homeHeroImage'

export { HOME_HERO_BACKGROUND, HOME_HERO_SOURCE, getHomeHeroPhotoSources } from '../lib/homeHeroImage'

function HeroPhotoLayer({ layerClass, imgClass, sources, fetchPriority = 'high' }) {
  return (
    <picture className={`${layerClass} absolute inset-0 block h-full w-full`}>
      <source media="(min-width: 768px)" srcSet={sources.desktop} type="image/webp" />
      <source media="(max-width: 767px)" srcSet={sources.mobile} type="image/webp" />
      <img
        src={sources.fallback}
        alt=""
        width={2560}
        height={1707}
        decoding="async"
        loading="eager"
        fetchPriority={fetchPriority}
        className={imgClass}
      />
    </picture>
  )
}

export default function HeroHomeEditorial() {
  const sources = getHomeHeroPhotoSources()

  return (
    <div className="home-hero relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden border-b border-white/[0.06] text-[var(--dark-text-primary)]">
      <div className="home-hero__photo pointer-events-none absolute inset-0" aria-hidden>
        <HeroPhotoLayer
          layerClass="home-hero__picture home-hero__picture--blur"
          imgClass="home-hero__photo-blur h-full w-full object-cover object-[center_42%] sm:object-center"
          sources={sources}
          fetchPriority="high"
        />
        <HeroPhotoLayer
          layerClass="home-hero__picture home-hero__picture--sharp"
          imgClass="home-hero__photo-sharp h-full w-full object-cover object-[center_42%] sm:object-center"
          sources={sources}
          fetchPriority="high"
        />
      </div>

      <div
        className={`${layoutShellClassName} home-hero__content relative z-[1] flex min-h-[100svh] min-h-[100dvh] w-full flex-col justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(var(--site-header-h,var(--mobile-header-h,4rem))+0.75rem)] sm:px-5 md:px-8 lg:px-10 xl:px-12`}
      >
        <p className="hero-kicker mb-2.5 sm:mb-3">La Guarida</p>
        <h1
          id="home-hero"
          className="max-w-3xl font-display text-[clamp(1.95rem,5.8vw,3.35rem)] font-bold leading-[1.1] tracking-tight text-white"
        >
          Tu refugio del buen sonido
        </h1>
        <p className="hero-lead mt-4 max-w-lg sm:mt-5">
          Guitarras, bajos y accesorios con stock actualizado y asesoramiento directo.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9">
          <Button href="/catalogo">
            Ver catálogo
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
          <Button href="#seleccion-destacada" variant="editorial">
            Novedades
          </Button>
        </div>
      </div>
    </div>
  )
}
