# Backup local de productos

Cuando Supabase no responde, la app usa `data/products-backup.json`.

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
