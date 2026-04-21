-- ════════════════════════════════════════════════════
-- RENTAL MANAGEMENT — SCHEMA (chạy trong Supabase SQL Editor)
-- ════════════════════════════════════════════════════

-- 1. ROOMS — danh sách phòng
create table if not exists rooms (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,              -- VD: Phòng 101
  floor      int default 1,
  price      bigint not null default 0,  -- giá thuê/tháng
  status     text not null default 'empty' check (status in ('empty','occupied')),
  note       text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TENANTS — khách thuê
create table if not exists tenants (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  room_id       uuid references rooms(id) on delete set null,
  name          text not null,
  phone         text default '',
  id_card       text default '',          -- CMND/CCCD
  move_in_date  date not null default current_date,
  move_out_date date,                     -- null = còn ở
  deposit       bigint default 0,         -- tiền cọc
  monthly_rent  bigint default 0,         -- giá thuê hàng tháng
  note          text default '',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. METER_READINGS — chỉ số điện/nước hàng tháng
create table if not exists meter_readings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  room_id     uuid references rooms(id) on delete cascade not null,
  month       int not null check (month between 1 and 12),
  year        int not null,
  elec_old    int not null default 0,    -- chỉ số điện kỳ trước
  elec_new    int not null default 0,    -- chỉ số điện kỳ này
  water_old   int not null default 0,
  water_new   int not null default 0,
  elec_price  bigint not null default 4000,   -- đơn giá điện/kWh
  water_price bigint not null default 15000,  -- đơn giá nước/m³
  created_at  timestamptz default now(),
  unique(room_id, month, year)
);

-- 4. INVOICES — hóa đơn hàng tháng
create table if not exists invoices (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  room_id       uuid references rooms(id) on delete cascade not null,
  tenant_id     uuid references tenants(id) on delete set null,
  month         int not null check (month between 1 and 12),
  year          int not null,
  rent_amount   bigint not null default 0,   -- tiền phòng
  elec_amount   bigint not null default 0,   -- tiền điện
  water_amount  bigint not null default 0,   -- tiền nước
  other_amount  bigint not null default 0,   -- phí khác
  total         bigint not null default 0,
  status        text not null default 'unpaid' check (status in ('unpaid','paid')),
  paid_date     date,
  note          text default '',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 5. ROW LEVEL SECURITY
alter table rooms            enable row level security;
alter table tenants          enable row level security;
alter table meter_readings   enable row level security;
alter table invoices         enable row level security;

create policy "own rooms"           on rooms           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tenants"         on tenants         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own meter_readings"  on meter_readings  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own invoices"        on invoices        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. AUTO updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger rooms_updated_at    before update on rooms    for each row execute function update_updated_at();
create trigger tenants_updated_at  before update on tenants  for each row execute function update_updated_at();
create trigger invoices_updated_at before update on invoices for each row execute function update_updated_at();

-- ✅ Xong! Chạy file này trong Supabase SQL Editor.
