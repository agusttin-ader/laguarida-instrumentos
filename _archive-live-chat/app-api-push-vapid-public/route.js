export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '../chat/_server'

export async function GET(req) {
  const user = await getAdminUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const key = process.env.VAPID_PUBLIC_KEY
  if (!key) return NextResponse.json({ error: 'Push not configured' }, { status: 503 })
  return NextResponse.json({ publicKey: key })
}
