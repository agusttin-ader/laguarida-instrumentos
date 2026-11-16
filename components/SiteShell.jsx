"use client"

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import Header from './Header'
import PageTransition from './motion/PageTransition'
import SiteShellPathEffects from './site/SiteShellPathEffects'

const Footer = dynamic(() => import('./Footer'), {
  loading: () => <div className="min-h-[12rem] w-full shrink-0" aria-hidden />,
})

const WhatsAppFloatButton = dynamic(() => import('./WhatsAppFloatButton'), { ssr: false })

const ServiceWorkerRegister = dynamic(() => import('./ServiceWorkerRegister'), { ssr: false })

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const isAdmin = typeof pathname === 'string' && pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  const isHome = pathname === '/' || pathname === ''
  const mainTopPad = !isHome ? 'md:pt-0' : 'pt-0'

  const mainMobileBottomPad = 'max-md:pb-[max(3.5rem,calc(2.75rem+env(safe-area-inset-bottom)))]'

  return (
    <>
      <SiteShellPathEffects />
      <Header />
      <main
        className={`min-h-0 w-full min-w-0 max-md:overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom,0px))] ${mainMobileBottomPad} md:pb-0 ${mainTopPad}`}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <WhatsAppFloatButton />
      <ServiceWorkerRegister />
    </>
  )
}