/** URL y anon key compartidos por cliente y rutas API. */

export function getSupabaseUrl() {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  return typeof raw === 'string' ? raw.trim() : ''
}

export function getSupabaseAnonKey() {
  const raw = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return typeof raw === 'string' ? raw.trim() : ''
}

export function hasSupabasePublicConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export function getServiceRoleKey() {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY
  return typeof raw === 'string' ? raw.trim() : ''
}

export function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey())
}

export const SUPABASE_CONFIG_HINT =
  'Falta configurar Supabase: copiá env.local.example a .env.local y completá URL + anon key. Reiniciá npm run dev.'