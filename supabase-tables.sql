-- ECOM KG — таблица для всех заявок и форм сайта
-- Запустить один раз в Supabase → SQL Editor → New query → Run

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null,               -- тип: request / committee / newsletter / membership / broadcast / event ...
  data jsonb not null default '{}',  -- поля формы
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'new',
  created_at timestamptz default now()
);

alter table public.submissions enable row level security;

-- Любой посетитель может ОТПРАВИТЬ заявку/форму
drop policy if exists "anyone can insert submissions" on public.submissions;
create policy "anyone can insert submissions" on public.submissions
  for insert with check (true);

-- ЧИТАТЬ все заявки может только администратор
drop policy if exists "admin reads submissions" on public.submissions;
create policy "admin reads submissions" on public.submissions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Пользователь видит свои заявки
drop policy if exists "user reads own submissions" on public.submissions;
create policy "user reads own submissions" on public.submissions
  for select using (auth.uid() = user_id);

-- Админ может менять статус
drop policy if exists "admin updates submissions" on public.submissions;
create policy "admin updates submissions" on public.submissions
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
