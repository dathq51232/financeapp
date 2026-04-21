-- ════════════════════════════════════════════════════
-- CHẠY FILE NÀY TRONG SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/kydhbvytkysmjutfjyss/sql/new
-- ════════════════════════════════════════════════════

-- BƯỚC 1: XOÁ POLICY CŨ (tránh lỗi "already exists")
do $$ begin
  drop policy if exists "own accounts"                  on accounts;
  drop policy if exists "own transactions"              on transactions;
  drop policy if exists "own cards"                     on credit_cards;
  drop policy if exists "own profile"                   on profiles;
  drop policy if exists "Users manage own accounts"     on accounts;
  drop policy if exists "Users manage own transactions" on transactions;
  drop policy if exists "Users manage own credit cards" on credit_cards;
  drop policy if exists "Users see own accounts"        on accounts;
  drop policy if exists "Users see own transactions"    on transactions;
  drop policy if exists "Users see own credit cards"    on credit_cards;
exception when others then null;
end $$;

-- BƯỚC 2: TẠO BẢNG profiles (nếu chưa có)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_color text default '#17d9a1',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table profiles enable row level security;

-- BƯỚC 3: TẠO LẠI POLICY CHO TẤT CẢ BẢNG
create policy "own profile"
  on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "own accounts"
  on accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own transactions"
  on transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own cards"
  on credit_cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- BƯỚC 4: TRIGGER AUTO-CREATE PROFILE KHI ĐĂNG KÝ
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#17d9a1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- BƯỚC 5: TRIGGER AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists accounts_updated_at   on accounts;
drop trigger if exists cards_updated_at       on credit_cards;
drop trigger if exists profiles_updated_at    on profiles;

create trigger accounts_updated_at  before update on accounts     for each row execute function update_updated_at();
create trigger cards_updated_at     before update on credit_cards for each row execute function update_updated_at();
create trigger profiles_updated_at  before update on profiles      for each row execute function update_updated_at();

-- ✅ XONG! Tất cả policy và trigger đã được cập nhật.
select 'Schema fixed successfully! 🎉' as status;
