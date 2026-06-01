import { NextResponse } from 'next/server'
import { SUPABASE_BLOCKED } from './lib/supabase/mode'

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Contingency mode: admin locked temporarily (same switch as lib/supabase/mode.js).
  if (SUPABASE_BLOCKED && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
