-- ECOM KG — партнёры, заявки и чат
-- Запустить один раз в Supabase → SQL Editor → New query → Run
-- (после supabase-setup.sql, где создаётся profiles с ролями)

-- 1) Компании-партнёры (каждая привязана к аккаунту партнёра)
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  description text,
  discount text,
  approved boolean not null default false,
  created_at timestamptz default now()
);
alter table public.partners enable row level security;

-- видно: одобренные — всем; свои — владельцу; всё — админу
drop policy if exists "partners select" on public.partners;
create policy "partners select" on public.partners for select using (
  approved = true
  or owner_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);
-- партнёр добавляет свою компанию
drop policy if exists "partners insert" on public.partners;
create policy "partners insert" on public.partners for insert with check (owner_id = auth.uid());
-- редактировать: владелец или админ (админ одобряет)
drop policy if exists "partners update" on public.partners;
create policy "partners update" on public.partners for update using (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- 2) Заявки (тема диалога клиент → компания)
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  subject text,
  status text not null default 'new',
  created_at timestamptz default now()
);
alter table public.requests enable row level security;

-- участник заявки = клиент ИЛИ владелец компании; плюс админ
drop policy if exists "requests select" on public.requests;
create policy "requests select" on public.requests for select using (
  client_id = auth.uid()
  or exists (select 1 from public.partners pt where pt.id = requests.partner_id and pt.owner_id = auth.uid())
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);
drop policy if exists "requests insert" on public.requests;
create policy "requests insert" on public.requests for insert with check (client_id = auth.uid());
drop policy if exists "requests update" on public.requests;
create policy "requests update" on public.requests for update using (
  client_id = auth.uid()
  or exists (select 1 from public.partners pt where pt.id = requests.partner_id and pt.owner_id = auth.uid())
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- 3) Сообщения чата
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;

-- видеть/писать сообщения может участник заявки (клиент или владелец компании) и админ
drop policy if exists "messages select" on public.messages;
create policy "messages select" on public.messages for select using (
  exists (
    select 1 from public.requests r
    left join public.partners pt on pt.id = r.partner_id
    where r.id = messages.request_id
      and (r.client_id = auth.uid() or pt.owner_id = auth.uid()
           or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
  )
);
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.requests r
    left join public.partners pt on pt.id = r.partner_id
    where r.id = messages.request_id
      and (r.client_id = auth.uid() or pt.owner_id = auth.uid())
  )
);

-- 4) Realtime для чата (живые сообщения)
alter publication supabase_realtime add table public.messages;
