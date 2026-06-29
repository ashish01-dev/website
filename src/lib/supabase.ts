import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (client) return client
  if (!supabaseUrl || !supabaseKey) return null
  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
