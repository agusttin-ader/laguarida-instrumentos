-- WhatsApp redirect click counters (public site → admin stats)
-- Run once in Supabase SQL editor.

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_whatsapp_clicks_created_at
  on public.whatsapp_clicks(created_at desc);

alter table public.whatsapp_clicks enable row level security;

-- No direct client access; inserts/reads go through Next.js API with service role.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'whatsapp_clicks'
      and policyname = 'deny all whatsapp_clicks'
  ) then
    create policy "deny all whatsapp_clicks"
      on public.whatsapp_clicks for all
      using (false)
      with check (false);
  end if;
end $$;
