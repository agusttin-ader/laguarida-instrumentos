-- Bullets opcionales en la ficha pública (opción “destacados + texto largo”).
alter table public.products
  add column if not exists highlights text[];

comment on column public.products.highlights is 'Lista corta de puntos destacados para la ficha (text[]; máx. ~8 ítems vía API).';
