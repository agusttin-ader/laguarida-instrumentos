import { createClient } from '@supabase/supabase-js'
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  getServiceRoleKey,
  hasSupabasePublicConfig,
  hasSupabaseAdminConfig,
  SUPABASE_CONFIG_HINT,
} from './config'
import { isSupabaseFullyBlocked } from './mode'

export { hasSupabasePublicConfig, hasSupabaseAdminConfig, SUPABASE_CONFIG_HINT }

export function getSupabaseServerClient(accessToken = null) {
  if (isSupabaseFullyBlocked()) {
    throw new Error('Supabase blocked by contingency mode')
  }
  if (!hasSupabasePublicConfig()) {
    throw new Error(SUPABASE_CONFIG_HINT)
  }

  const clientOptions = {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  }

  if (accessToken) {
    clientOptions.global = { headers: { Authorization: `Bearer ${accessToken}` } }
  }

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), clientOptions)
}

export function getSupabaseAdminClient() {
  if (isSupabaseFullyBlocked()) {
    throw new Error('Supabase blocked by contingency mode')
  }
  if (!hasSupabaseAdminConfig()) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY (y URL) en .env.local para operaciones de admin en servidor.',
    )
  }
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  })
}