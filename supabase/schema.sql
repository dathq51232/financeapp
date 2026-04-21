-- ════════════════════════════════════════════════════
-- FINANCE APP — FULL SCHEMA v2 (chạy trong SQL Editor)
-- https://supabase.com/dashboard/project/kydhbvytkysmjutfjyss/sql/new
-- ════════════════════════════════════════════════════

-- 1. Extension
create extension if not exists "uuid-ossp";

-- 2. PROFILES (thông tin user mở rộng)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_color text default '#17d9a1',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 3. ACCOUNTS
create table if not exists accounts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  balance    bigint not null default 0,
  icon       text not null default '🏦',
  color      text not null default '#17d9a1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TRANSACTIONS
create table if not exists transactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  type       text not null check (type in ('thu','chi')),
  amount     bigint not null check (amount > 0),
  category   text not null,
  note       text default '',
  date       date not null default current_date,
  created_at timestamptz default now()
);

-- 5. CREDIT CARDS
create table if not exists credit_cards (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  bank         text default '',
  color        text default '#5b8def',
  credit_limit bigint not null default 0,
  used         bigint not null default 0,
  closing_day  int default 15 check (closing_day between 1 and 31),
  payment_day  int default 5  check (payment_day between 1 and 31),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 6. ROW LEVEL SECURITY
alter table profiles     enable row level security;
alter table accounts     enable row level security;
alter table transactions enable row level security;
alter table credit_cards enable row level security;

-- Profiles: user chỉ xem/sửa profile của mình
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Accounts
create policy "own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Transactions
create policy "own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Credit cards
create policy "own cards" on credit_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 7. AUTO-CREATE PROFILE khi user đăng ký
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#17d9a1')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 8. AUTO updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger accounts_updated_at before update on accounts for each row execute function update_updated_at();
create trigger cards_updated_at before update on credit_cards for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();

-- ✅ Xong! Tất cả bảng đã được tạo với RLS bảo mật đầy đủ.
