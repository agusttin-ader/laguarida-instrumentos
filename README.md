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
- Catálogo: tienda pública (local y producción) usa `data/products-backup.json`; admin usa Supabase. Ver [docs/GUIA-CATALOGO.md](docs/GUIA-CATALOGO.md).
- Imágenes: con catálogo local, Next optimiza `public/images/` vía `/_next/image`.
- Cuando vuelva Supabase remoto: `NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM=true` o `NEXT_ENABLE_IMAGE_OPTIMIZATION=true` (plan Vercel Pro).
- Animaciones y `prefers-reduced-motion` en CSS donde aplica.

## Notas

- Variables de entorno: usar `.env.local` (no commitear secretos).
- La primera vez que corras E2E, ejecutá `npm run test:e2e:install` o `npx playwright install`.
