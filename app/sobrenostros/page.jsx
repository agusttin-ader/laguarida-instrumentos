import React from 'react'
import About from '../../components/About'
import { layoutShellClassName } from '../../lib/layoutShell'

export default function Page() {
  return (
    <div className={`${layoutShellClassName} px-6 lg:px-8`}>
      <main className="mt-12">
        <About />
      </main>
    </div>
  )
}
