# Backup local de productos

En desarrollo (por defecto) y en contingencia, la app usa `data/products-backup.json`.

Actualizar desde Supabase: `npm run sync:catalog` — también crea `public/images/products/<slug>/`, descarga fotos y renombra sueltas (ver [docs/GUIA-CATALOGO.md](../docs/GUIA-CATALOGO.md)).

## Formato

- Copiá la estructura de `data/products-backup.example.json`.
- Campos clave:
  - `slug`
  - `name`
  - `price`
  - `currency` (`USD` o `ARS`)
  - `listing_status` (`available` o `reserved`)
  - `image_url` y/o `images`

## Imágenes por carpeta de producto

Si en `image_url` o `images` usás solo nombre de archivo (por ejemplo `frente.jpg`), la app lo resuelve automáticamente a:

`/images/products/<slug>/<archivo>`

Entonces guardá tus imágenes en:

`public/images/products/<slug>/`

Ejemplo:

- `public/images/products/fender-stratocaster-1978/principal.jpg`
- `public/images/products/fender-stratocaster-1978/detalle-1.jpg`

También podés usar URLs completas `https://...` o rutas absolutas `/images/...`.

## Variantes livianas (catálogo / ficha)

El sitio **no** usa el Image Optimization on-demand de Vercel. Para reducir peso se generan WebP estáticos:

```bash
npm run images:variants
```

Quedan en `public/images/products/<slug>/variants/`:

- `*.card.webp` — tarjetas y thumbs (~480px)
- `*.main.webp` — foto principal de ficha (~1280px)
- `*.large.webp` — lightbox (~1600px)

Las URLs en `image_url` / `images` **no cambian**; `forDisplay()` apunta a la variante y, si falta el archivo, cae al original.

Correr el script después de agregar o reemplazar fotos (también tras `npm run sync:catalog`).
