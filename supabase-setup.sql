-- ECOM KG — настройка авторизации и ролей в Supabase
-- Запустить один раз в Supabase → SQL Editor → New query → Run

-- 1) Таблица профилей с ролью пользователя
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  role text not null default 'client' check (role in ('client','partner','admin')),
  created_at timestamptz default now()
);

-- 2) Включаем защиту на уровне строк (Row Level Security)
alter table public.profiles enable row level security;

-- 3) Пользователь видит и меняет только свой профиль
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4) Автосоздание профиля при регистрации (по умолчанию роль = client)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'client');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Готово. Роли (client / partner / admin) меняются в таблице profiles.
-- Клиент регистрируется сам → роль client.
-- Партнёру/админу вы вручную ставите role = 'partner' или 'admin'
-- (Table Editor → profiles → нужная строка → поле role).
