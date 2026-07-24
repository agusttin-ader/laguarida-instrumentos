'use client'

import { AnimatePresence, m } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MOTION_DURATION, MOTION_EASE, PAGE_TRANSITION } from '../../lib/motionTokens'

/**
 * Primer paint (SSR + hidratación): sin opacity:0, mismo HTML en server/client.
 * Tras montar, las navegaciones cliente sí usan la transición de entrada.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname()
  const [enableEnterAnimation, setEnableEnterAnimation] = useState(false)

  useEffect(() => {
    setEnableEnterAnimation(true)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        className="w-full min-w-0"
        initial={enableEnterAnimation ? PAGE_TRANSITION.initial : false}
        animate={PAGE_TRANSITION.animate}
        exit={enableEnterAnimation ? PAGE_TRANSITION.exit : false}
        transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
