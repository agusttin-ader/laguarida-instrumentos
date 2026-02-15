import React from 'react'
// MiniNav removed from header UI per request
import Image from 'next/image'

export default function Header(){
  return (
    <header className="pt-8 pb-12">
      <div className="flex items-center justify-between container-tight relative">
        <div className="flex items-center">
          {/* left slot (kept empty for layout symmetry) */}
        </div>

        <a href="/" aria-label="Ir al inicio" className="block absolute left-1/2 -top-12 transform -translate-x-1/2 z-10">
          <div className="relative header-logo-wrapper">
            <Image src="/images/logo/logo-fondo-claro.PNG" alt="La Guarida logo claro" width={320} height={96} style={{objectFit:'contain', display:'block'}} className="logo-light w-[220px] md:w-[320px] h-auto" quality={100} sizes="(min-width:768px) 320px, 220px" />
            <Image src="/images/logo/logo-fondo-oscuro.PNG" alt="La Guarida logo oscuro" width={320} height={96} style={{objectFit:'contain', display:'block'}} className="logo-dark w-[220px] md:w-[320px] h-auto" quality={100} sizes="(min-width:768px) 320px, 220px" />
          </div>
        </a>

        <div className="flex items-center gap-4">
          {/* right slot (kept empty for layout symmetry) */}
        </div>
      </div>
    </header>
  )
}
