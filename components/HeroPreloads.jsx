import { enrichHeroSlide } from '../lib/utils/heroImageVariants'

export default function HeroPreloads({ slides = [] }) {
  const first = enrichHeroSlide(slides[0])
  if (!first?.mobile || !first?.desktop) return null

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={first.mobile}
        media="(max-width: 767px)"
        type="image/webp"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={first.desktop}
        media="(min-width: 768px)"
        type="image/webp"
        fetchPriority="high"
      />
    </>
  )
}
