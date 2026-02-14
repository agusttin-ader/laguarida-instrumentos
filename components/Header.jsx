import React from 'react'
import MiniNav from './MiniNav'

export default function Header(){
  return (
    <header className="pt-8 pb-6">
      <div className="flex items-center justify-between container-tight">
        <div>
          <h1 className="display-xl">La Guarida</h1>
        </div>
        <div className="flex items-center gap-4">
          <MiniNav />
        </div>
      </div>
    </header>
  )
}
