/**
 * Home page section anchors: smooth scroll + hash handling.
 * scroll-margin-top on the target elements (globals.css) offsets fixed/sticky chrome.
 */

export function getHashSectionId() {
  if (typeof window === 'undefined') return null
  const h = window.location.hash
  if (!h || h.length < 2) return null
  try {
    return decodeURIComponent(h.slice(1))
  } catch {
    return h.slice(1)
  }
}

export function scrollToHomeSectionById(id, { behavior = 'smooth' } = {}) {
  if (typeof document === 'undefined' || !id) return false
  const el = document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior, block: 'start' })
  return true
}

/** Retry briefly so layout/hydration can mount the target (e.g. Link to /#section). */
export function scrollToHomeSectionByIdWhenReady(id, { behavior = 'smooth', maxAttempts = 20 } = {}) {
  if (typeof document === 'undefined' || !id) return
  let attempt = 0
  const step = () => {
    if (scrollToHomeSectionById(id, { behavior })) return
    attempt += 1
    if (attempt >= maxAttempts) return
    requestAnimationFrame(step)
  }
  step()
}
