/** Alineado con --motion-ease-fluid en styles/globals.css */
export const MOTION_EASE = [0.32, 0.72, 0, 1]

/** Segundos — equivalente a --motion-fast/base/slow */
export const MOTION_DURATION = {
  fast: 0.09,
  base: 0.14,
  slow: 0.18,
  reveal: 0.52,
  grid: 0.34,
}

/** Usado por PageTransition (motion/react) si se reactiva */
export const FADE_IN_VIEW = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
}
