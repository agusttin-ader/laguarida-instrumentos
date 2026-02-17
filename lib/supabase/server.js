import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
  }

  // Use the anon key on the server side (do NOT use the service_role key here).
  // This client is safe for server components and route handlers where
  // you do not need elevated privileges.
  // Rely on the global `fetch` available on Node 18 / Next.js runtime.
  return createClient(supabaseUrl, supabaseAnonKey)
}
