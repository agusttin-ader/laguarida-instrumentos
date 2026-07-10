'use client'

import { AnimatePresence, m } from 'motion/react'
import { usePathname } from 'next/navigation'
import { MOTION_DURATION, MOTION_EASE, PAGE_TRANSITION } from '../../lib/motionTokens'

export default function PageTransition({ children }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        className="w-full min-w-0"
        initial={PAGE_TRANSITION.initial}
        animate={PAGE_TRANSITION.animate}
        exit={PAGE_TRANSITION.exit}
        transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
