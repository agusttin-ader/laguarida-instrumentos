-- Admin activity log: create/update/delete product events from any device (synced via API)
create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('create', 'update', 'delete')),
  product_id uuid,
  label text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_activity_created_at on public.admin_activity(created_at desc);

alter table public.admin_activity enable row level security;

-- Only authenticated users (admin) can read and insert; no delete/update from client
create policy "admin_activity_select"
  on public.admin_activity for select
  to authenticated
  using (true);

create policy "admin_activity_insert"
  on public.admin_activity for insert
  to authenticated
  with check (true);
