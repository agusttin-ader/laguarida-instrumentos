import { NextResponse } from 'next/server'

/**
 * Convención `middleware.js` (Next 16 aún resuelve el bundle edge en dev como
 * `[project]/middleware.js`). Tener solo `proxy.js` puede disparar "file not found"
 * en Turbopack; no mezclar ambos archivos. Ver:
 * https://nextjs.org/docs/messages/middleware-to-proxy
 */
export function middleware(req) {
  const { pathname } = req.nextUrl

  // Sin Server Component `redirect()`: evita Performance.measure / timestamps negativos en dev (Turbopack).
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/productos/catalogo', req.url))
  }
  if (pathname === '/admin/productos' || pathname === '/admin/productos/') {
    return NextResponse.redirect(new URL('/admin/productos/catalogo', req.url))
  }

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
