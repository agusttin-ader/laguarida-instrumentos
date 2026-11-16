import { NextResponse } from 'next/server'
import {
  hasSupabaseAdminConfig,
  hasSupabasePublicConfig,
  SUPABASE_CONFIG_HINT,
} from '../../../../lib/supabase/server'

export const runtime = 'nodejs'

/** Estado de env para el panel admin (sin secretos). */
export async function GET() {
  const publicOk = hasSupabasePublicConfig()
  return NextResponse.json(
    {
      publicConfigured: publicOk,
      adminConfigured: hasSupabaseAdminConfig(),
      hint: publicOk ? null : SUPABASE_CONFIG_HINT,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}