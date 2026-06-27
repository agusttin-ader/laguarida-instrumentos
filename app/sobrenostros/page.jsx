import React from 'react'
import About from '../../components/About'
import { layoutShellClassName } from '../../lib/layoutShell'

export default function Page() {
  return (
    <div className={`${layoutShellClassName} mobile-gutter-x md:px-6 lg:px-8`}>
      <main className="max-md:mt-6 md:mt-12">
        <About />
      </main>
    </div>
  )
}
