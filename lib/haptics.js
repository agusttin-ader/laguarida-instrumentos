/**
 * Vibración corta en dispositivos que soportan Vibration API (móviles).
 * No hace nada en desktop.
 */
export function hapticLight() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(10)
    } catch { /* ignore */ }
  }
}
