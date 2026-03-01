-- Push subscriptions for admin Web Push (iOS PWA / desktop)
-- Run in Supabase SQL editor once.
--
-- Env (Vercel + .env.local): VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY.
-- Generar: npx web-push generate-vapid-keys

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_identifier text,
  created_at timestamptz not null default now(),
  unique(endpoint)
);

create index if not exists idx_admin_push_subscriptions_created_at
  on public.admin_push_subscriptions(created_at desc);

alter table public.admin_push_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_push_subscriptions'
      and policyname = 'deny all admin_push_subscriptions'
  ) then
    create policy "deny all admin_push_subscriptions"
    on public.admin_push_subscriptions for all
    using (false)
    with check (false);
  end if;
end $$;
