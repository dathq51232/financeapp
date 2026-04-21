import { supabase } from './supabase'

const uid = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ── PROFILES ──────────────────────────────
export const getProfile = async () => {
  const { data, error } = await supabase
    .from('profiles').select('*').single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertProfile = async (updates) => {
  const userId = await uid()
  const { data, error } = await supabase.from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select().single()
  if (error) throw error
  return data
}

// ── ACCOUNTS ──────────────────────────────
export const getAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts').select('*').order('created_at')
  if (error) throw error
  return data ?? []
}
export const createAccount = async (acc) => {
  const { data, error } = await supabase.from('accounts')
    .insert({ ...acc, user_id: await uid() }).select().single()
  if (error) throw error
  return data
}
export const updateAccount = async (id, updates) => {
  const { data, error } = await supabase.from('accounts')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export const deleteAccount = async (id) => {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw error
}

// ── TRANSACTIONS ──────────────────────────
export const getTransactions = async () => {
  const { data, error } = await supabase.from('transactions').select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
export const createTransaction = async ({ account_id, type, amount, category, note, date }) => {
  const userId = await uid()
  const { data, error } = await supabase.from('transactions')
    .insert({ account_id, type, amount, category, note, date, user_id: userId }).select().single()
  if (error) throw error
  const { data: acc } = await supabase.from('accounts').select('balance').eq('id', account_id).single()
  await supabase.from('accounts')
    .update({ balance: acc.balance + (type === 'thu' ? amount : -amount) }).eq('id', account_id)
  return data
}
export const deleteTransaction = async (id, { account_id, type, amount }) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
  const { data: acc } = await supabase.from('accounts').select('balance').eq('id', account_id).single()
  await supabase.from('accounts')
    .update({ balance: acc.balance + (type === 'thu' ? -amount : amount) }).eq('id', account_id)
}

// ── CREDIT CARDS ──────────────────────────
export const getCreditCards = async () => {
  const { data, error } = await supabase.from('credit_cards').select('*').order('created_at')
  if (error) throw error
  return data ?? []
}
export const createCreditCard = async (card) => {
  const { data, error } = await supabase.from('credit_cards')
    .insert({ ...card, user_id: await uid() }).select().single()
  if (error) throw error
  return data
}
export const updateCreditCard = async (id, updates) => {
  const { data, error } = await supabase.from('credit_cards')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export const deleteCreditCard = async (id) => {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id)
  if (error) throw error
}

// ── ROOMS ──────────────────────────────────
export const getRooms = async () => {
  const { data, error } = await supabase.from('rooms').select('*').order('name')
  if (error) throw error
  return data ?? []
}
export const createRoom = async (room) => {
  const { data, error } = await supabase.from('rooms')
    .insert({ ...room, user_id: await uid() }).select().single()
  if (error) throw error
  return data
}
export const updateRoom = async (id, updates) => {
  const { data, error } = await supabase.from('rooms')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export const deleteRoom = async (id) => {
  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) throw error
}

// ── TENANTS ────────────────────────────────
export const getTenants = async () => {
  const { data, error } = await supabase.from('tenants').select('*').order('name')
  if (error) throw error
  return data ?? []
}
export const createTenant = async (tenant) => {
  const { data, error } = await supabase.from('tenants')
    .insert({ ...tenant, user_id: await uid() }).select().single()
  if (error) throw error
  return data
}
export const updateTenant = async (id, updates) => {
  const { data, error } = await supabase.from('tenants')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export const deleteTenant = async (id) => {
  const { error } = await supabase.from('tenants').delete().eq('id', id)
  if (error) throw error
}

// ── METER READINGS ─────────────────────────
export const getMeterReadings = async () => {
  const { data, error } = await supabase.from('meter_readings').select('*')
    .order('year', { ascending: false }).order('month', { ascending: false })
  if (error) throw error
  return data ?? []
}
export const upsertMeterReading = async (reading) => {
  const { data, error } = await supabase.from('meter_readings')
    .upsert({ ...reading, user_id: await uid() }, { onConflict: 'room_id,month,year' })
    .select().single()
  if (error) throw error
  return data
}

// ── INVOICES ───────────────────────────────
export const getInvoices = async () => {
  const { data, error } = await supabase.from('invoices').select('*')
    .order('year', { ascending: false }).order('month', { ascending: false })
  if (error) throw error
  return data ?? []
}
export const createInvoice = async (invoice) => {
  const total = (invoice.rent_amount||0) + (invoice.elec_amount||0) + (invoice.water_amount||0) + (invoice.other_amount||0)
  const { data, error } = await supabase.from('invoices')
    .insert({ ...invoice, total, user_id: await uid() }).select().single()
  if (error) throw error
  return data
}
export const updateInvoice = async (id, updates) => {
  const { data, error } = await supabase.from('invoices')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export const markInvoicePaid = async (id) => {
  return updateInvoice(id, { status: 'paid', paid_date: new Date().toISOString().slice(0,10) })
}
