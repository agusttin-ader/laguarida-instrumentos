import { NextResponse } from 'next/server'

export function proxy(req) {
  const { pathname } = req.nextUrl

  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.next()
  }

  const accessToken = req.cookies.get('sb-access-token')?.value
  const legacySession = req.cookies.get('sb-session')?.value

  if (!accessToken && !legacySession) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
