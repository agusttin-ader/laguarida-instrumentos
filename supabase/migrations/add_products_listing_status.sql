-- Estado de publicación: solo "available" se lista en la tienda; "reserved" oculta hasta volver a disponible.
alter table public.products
  add column if not exists listing_status text not null default 'available';

alter table public.products
  drop constraint if exists products_listing_status_check;

alter table public.products
  add constraint products_listing_status_check
  check (listing_status in ('available', 'reserved'));
