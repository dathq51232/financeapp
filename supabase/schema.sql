-- ════════════════════════════════════════════
-- FINANCE APP — SUPABASE SCHEMA
-- ════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ACCOUNTS ───────────────────────────────
create table if not exists accounts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  balance    bigint not null default 0,  -- stored in VND (integer)
  icon       text not null default '🏦',
  color      text not null default '#17d9a1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── TRANSACTIONS ───────────────────────────
create table if not exists transactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  type       text not null check (type in ('thu', 'chi')),
  amount     bigint not null,
  category   text not null,
  note       text default '',
  date       date not null default current_date,
  created_at timestamptz default now()
);

-- ─── CREDIT CARDS ───────────────────────────
create table if not exists credit_cards (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  bank         text not null default '',
  color        text not null default '#5b8def',
  credit_limit bigint not null default 0,
  used         bigint not null default 0,
  closing_day  int not null default 15 check (closing_day between 1 and 31),
  payment_day  int not null default 5  check (payment_day between 1 and 31),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────
alter table accounts     enable row level security;
alter table transactions enable row level security;
alter table credit_cards enable row level security;

-- Accounts policies
create policy "Users see own accounts"
  on accounts for all using (auth.uid() = user_id);

-- Transactions policies
create policy "Users see own transactions"
  on transactions for all using (auth.uid() = user_id);

-- Credit cards policies
create policy "Users see own credit cards"
  on credit_cards for all using (auth.uid() = user_id);

-- ─── AUTO UPDATE updated_at ─────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger accounts_updated_at
  before update on accounts
  for each row execute function update_updated_at();

create trigger credit_cards_updated_at
  before update on credit_cards
  for each row execute function update_updated_at();
