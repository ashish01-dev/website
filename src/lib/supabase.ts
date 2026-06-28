import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (client) return client
  if (!supabaseUrl || !supabaseKey) return null
  client = createClient(supabaseUrl, supabaseKey)
  return client
}
