import { createClient } from '@supabase/supabase-js'

// Supabase public credentials (anon key is safe to expose client-side)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL 
  || 'https://kydhbvytkysmjutfjyss.supabase.co'

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZGhidnl0a3lzbWp1dGZqeXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTEwNjMsImV4cCI6MjA4OTU2NzA2M30.dH3wTNlQHV1u1rDNzHcZDgouUn_FVErEwurgnl54GFw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})
