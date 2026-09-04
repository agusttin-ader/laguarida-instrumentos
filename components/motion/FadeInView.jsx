'use client'

import { MOTION_VARIANT_CLASS } from '../../lib/motion/presets'
import { useReveal } from '../../hooks/useReveal'

/**
 * Revela contenido al scroll con animación CSS ligera (sin motion/react).
 * SSR: contenido visible; el oculto previo solo aplica fuera del viewport tras hidratar.
 */
export default function FadeInView({
  children,
  className = '',
  as = 'div',
  variant = 'fade-up',
  delay = 0,
  threshold,
  rootMargin,
  disabled = false,
  style,
  ...rest
}) {
  const { ref, phase } = useReveal({ threshold, rootMargin, delay, disabled })
  const variantClass = MOTION_VARIANT_CLASS[variant] || MOTION_VARIANT_CLASS['fade-up']

  const motionClasses = [
    'motion-reveal',
    variantClass,
    phase === 'hidden' && 'motion-reveal--armed motion-reveal--hidden',
    phase === 'visible' && 'motion-reveal--armed motion-reveal--in',
  ]
    .filter(Boolean)
    .join(' ')

  const Tag = as || 'div'
  const mergedStyle =
    delay > 0 && phase === 'visible'
      ? { ...style, animationDelay: `${delay}s` }
      : style

  return (
    <Tag ref={ref} className={`${motionClasses} ${className}`.trim()} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  )
}
