/**
 * Ancho máximo del contenido principal (home, footer, secciones).
 * Solo utilidades Tailwind (misma escala que antes en globals) para que
 * SSR y cliente generen exactamente el mismo className y evitar hydration mismatch.
 */
export const layoutShellClassName =
  'mx-auto w-full max-w-[80rem] xl:max-w-[90rem] 2xl:max-w-[100rem] min-[1920px]:max-w-[112rem] min-[2560px]:max-w-[min(124rem,94vw)]'
