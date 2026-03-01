import { cookies } from 'next/headers'
import { getSupabaseServerClient } from '../../../lib/supabase/server'

export async function extractAccessToken(req) {
  try {
    const cookieStore = await cookies()
    const tokenCookie = typeof cookieStore.get === 'function' ? cookieStore.get('sb-access-token') : null
    const token = tokenCookie?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null
    if (token) return token
  } catch { /* empty */ }
  return null
}

export async function getAdminUserFromRequest(req) {
  const accessToken = await extractAccessToken(req)
  if (!accessToken) return null
  try {
    const supabase = getSupabaseServerClient(accessToken)
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data?.user || null
  } catch {
    return null
  }
}

export function assertSameOrigin(req) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
