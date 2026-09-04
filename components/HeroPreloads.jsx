import { enrichHeroSlide } from '../lib/utils/heroImageVariants'

export default function HeroPreloads({ slides = [] }) {
  const enriched = slides.map((slide) => enrichHeroSlide(slide)).filter((slide) => slide?.mobile && slide?.desktop)
  if (!enriched.length) return null

  return (
    <>
      {enriched.map((slide, index) => (
        <link
          key={`${slide.src}-mobile`}
          rel="preload"
          as="image"
          href={slide.mobile}
          media="(max-width: 767px)"
          type="image/webp"
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      ))}
      {enriched.map((slide, index) => (
        <link
          key={`${slide.src}-desktop`}
          rel="preload"
          as="image"
          href={slide.desktop}
          media="(min-width: 768px)"
          type="image/webp"
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      ))}
    </>
  )
}
