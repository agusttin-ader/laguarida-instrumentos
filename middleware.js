import { NextResponse } from 'next/server'
import { isSupabaseFullyBlocked } from './lib/supabase/mode'

export function middleware(req) {
  const { pathname } = req.nextUrl

  if (isSupabaseFullyBlocked() && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
