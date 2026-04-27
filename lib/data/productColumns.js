/** Columnas para listados y GET público de `/api/products` — menos egress que `*`. La ficha `/guitars/[slug]` usa `select('*')` en una sola fila (ver `fetchProductBySlug.js`). */

export const PRODUCT_LIST_COLUMNS =
  'id, slug, name, price, currency, description, image_url, images, brand, model, wood, mics, low_cost'
