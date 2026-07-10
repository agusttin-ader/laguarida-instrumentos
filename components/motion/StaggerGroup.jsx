'use client'

import { useRef } from 'react'
import { m, useInView } from 'motion/react'
import { FADE_IN_VIEW, MOTION_DURATION, MOTION_EASE } from '../../lib/motionTokens'

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

const staggerItem = {
  hidden: FADE_IN_VIEW.hidden,
  visible: {
    ...FADE_IN_VIEW.visible,
    transition: { duration: MOTION_DURATION.slow, ease: MOTION_EASE },
  },
}

export function StaggerGroup({ children, className = '', as = 'div', ...rest }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -8% 0px', amount: 0.12 })
  const Component = as === 'section' ? m.section : m.div

  return (
    <Component
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      {...rest}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className = '', ...rest }) {
  return (
    <m.div className={className} variants={staggerItem} {...rest}>
      {children}
    </m.div>
  )
}
