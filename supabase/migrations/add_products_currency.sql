-- Moneda del precio: `products.price` sigue siendo numérico; `currency` es USD o ARS.
-- Ejecutá una vez en Supabase → SQL Editor (antes de desplegar el código que selecciona `currency`).

ALTER TABLE products
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

COMMENT ON COLUMN products.currency IS 'USD o ARS; el monto va en products.price (numérico).';
