# La Guarida — Catálogo editorial

Landing / catálogo para instrumentos musicales (Next.js App Router + Tailwind).

## Stack

- Next.js (App Router)
- Tailwind CSS
- Supabase (catálogo / storage cuando aplica)

## Scripts

```bash
npm install
npm run dev          # desarrollo
npm run verify       # lint estricto + build producción (gate de calidad)
npm run lint:strict  # ESLint sin warnings
npm run build        # build optimizado
npm run test:e2e:install  # instala navegadores de Playwright (solo la primera vez)
npm run test:e2e     # pruebas E2E (requiere test:e2e:install antes)
```

## Auditoría final (local / CI)

1. `npm run verify` — debe terminar sin errores ni warnings de ESLint y con build de producción OK.
2. `npm audit` — mantener **0 vulnerabilidades** reportadas (tras dependencias actualizadas).
3. `npm run test:e2e:install && npm run test:e2e` — E2E (requiere binarios de Playwright instalados).

**Node.js:** para evitar avisos `EBADENGINE` en herramientas de ESLint, usá **Node ≥ 22.13** o **≥ 20.19** (LTS).

**Rendimiento / fluidez ya contemplados en el proyecto**

- `reactStrictMode: true` y `removeConsole` en producción (`next.config.js`).
- Imágenes: AVIF/WebP, calidades declaradas, `preconnect`/`dns-prefetch` a Supabase en `app/layout.js`.
- Animaciones y `prefers-reduced-motion` en CSS donde aplica.

## Notas

- Variables de entorno: usar `.env.local` (no commitear secretos).
- La primera vez que corras E2E, ejecutá `npm run test:e2e:install` o `npx playwright install`.
