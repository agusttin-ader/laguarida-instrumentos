-- Live chat schema for La Guarida
-- Run this in Supabase SQL editor before using the feature.

create extension if not exists "pgcrypto";

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  status text not null default 'open' check (status in ('open', 'pending', 'closed')),
  source text,
  context_product text,
  last_message_preview text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_visitor_id on public.chat_sessions(visitor_id);
create index if not exists idx_chat_sessions_last_message_at on public.chat_sessions(last_message_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session_id_created_at on public.chat_messages(session_id, created_at);

create or replace function public.chat_set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_chat_sessions_updated_at'
  ) then
    create trigger trg_chat_sessions_updated_at
    before update on public.chat_sessions
    for each row execute function public.chat_set_updated_at_timestamp();
  end if;
end $$;

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Public access is handled by server API routes with service role key.
-- Keep direct table access denied from anon/authenticated clients.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_sessions'
      and policyname = 'deny all chat_sessions'
  ) then
    create policy "deny all chat_sessions"
    on public.chat_sessions for all
    using (false)
    with check (false);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_messages'
      and policyname = 'deny all chat_messages'
  ) then
    create policy "deny all chat_messages"
    on public.chat_messages for all
    using (false)
    with check (false);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_sessions'
  ) then
    alter publication supabase_realtime add table public.chat_sessions;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
