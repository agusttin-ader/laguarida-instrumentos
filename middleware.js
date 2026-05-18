import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Contingency mode: admin locked temporarily.
  // Any /admin route is redirected to home until admin access is re-enabled.
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
