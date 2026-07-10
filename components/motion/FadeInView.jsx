'use client'

import { useRef } from 'react'
import { m, useInView } from 'motion/react'
import { FADE_IN_VIEW, MOTION_DURATION, MOTION_EASE } from '../../lib/motionTokens'

const MOTION_TAGS = {
  div: m.div,
  section: m.section,
  aside: m.aside,
  article: m.article,
  nav: m.nav,
  header: m.header,
}

export default function FadeInView({
  children,
  className = '',
  delay = 0,
  as = 'div',
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  ...rest
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold })
  const Component = MOTION_TAGS[as] ?? m.div

  return (
    <Component
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={FADE_IN_VIEW}
      transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  )
}
