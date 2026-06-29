export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animateScrollLeft(el, to, options = {}) {
  const {
    durationMs = 360,
    ease = easeOutCubic,
    instant = false,
  } = options

  if (!el) return Promise.resolve()

  const from = el.scrollLeft
  const delta = to - from

  if (instant || prefersReducedMotion() || Math.abs(delta) < 0.5 || durationMs <= 0) {
    el.scrollLeft = to
    return Promise.resolve()
  }

  const distance = Math.abs(delta)
  const duration = Math.min(460, Math.max(280, durationMs, distance * 0.9))

  return new Promise((resolve) => {
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      el.scrollLeft = from + delta * ease(p)
      if (p < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

export function createScrollAnimator() {
  let cancelled = false
  let rafId = 0

  const cancel = () => {
    cancelled = true
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  const run = (el, to, options = {}) => {
    cancel()
    cancelled = false

    if (!el) return Promise.resolve()

    const {
      durationMs = 360,
      ease = easeOutCubic,
      instant = false,
    } = options

    const from = el.scrollLeft
    const delta = to - from

    if (instant || prefersReducedMotion() || Math.abs(delta) < 0.5 || durationMs <= 0) {
      el.scrollLeft = to
      return Promise.resolve()
    }

    const distance = Math.abs(delta)
    const duration = Math.min(460, Math.max(280, durationMs, distance * 0.9))

    return new Promise((resolve) => {
      const t0 = performance.now()
      const tick = (now) => {
        if (cancelled) {
          resolve()
          return
        }
        const p = Math.min((now - t0) / duration, 1)
        el.scrollLeft = from + delta * ease(p)
        if (p < 1) {
          rafId = requestAnimationFrame(tick)
        } else {
          rafId = 0
          resolve()
        }
      }
      rafId = requestAnimationFrame(tick)
    })
  }

  return { run, cancel }
}
