'use client'

import { useEffect, useState } from 'react'

/**
 * Calidad JPEG/WebP para next/image según ancho de viewport.
 * Mobile más liviano; desktop mantiene nitidez.
 */
export function useResponsiveImageQuality({
  mobile = 56,
  tablet = 64,
  desktop = 72,
  large = 78,
} = {}) {
  const [quality, setQuality] = useState(mobile)

  useEffect(() => {
    function resolve() {
      const w = window.innerWidth
      if (w >= 1536) setQuality(large)
      else if (w >= 1024) setQuality(desktop)
      else if (w >= 768) setQuality(tablet)
      else setQuality(mobile)
    }
    resolve()
    window.addEventListener('resize', resolve, { passive: true })
    return () => window.removeEventListener('resize', resolve)
  }, [mobile, tablet, desktop, large])

  return quality
}
