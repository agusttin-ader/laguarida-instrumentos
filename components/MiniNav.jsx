"use client"

import React, { useState } from 'react'

function ArrowLeftIcon(){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon(){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function MiniNav({ total = 3 }){
  const [index, setIndex] = useState(0)

  function prev(){
    setIndex((i)=> (i - 1 + total) % total)
  }

  function next(){
    setIndex((i)=> (i + 1) % total)
  }

  return (
    <nav className="flex items-center gap-4 text-sm" aria-label="Navegación del catálogo">
      <div className="flex items-center gap-3">
        <button onClick={prev} aria-label="Anterior" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1">
          <ArrowLeftIcon />
          <span className="hidden md:inline">Prev</span>
        </button>
        <button onClick={next} aria-label="Siguiente" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1">
          <span className="hidden md:inline">Next</span>
          <ArrowRightIcon />
        </button>
      </div>

      <div className="h-5 border-l border-gray-200" aria-hidden></div>

      <ul className="flex items-center gap-3" role="tablist" aria-label="Secciones">
        {Array.from({length: total}).map((_,i)=> (
          <li key={i}>
            <button
              role="tab"
              aria-selected={i===index}
              aria-label={`Sección ${i+1}`}
              onClick={()=> setIndex(i)}
              className={`w-3 h-3 rounded-full block transition-colors duration-200 ${i===index? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-500'}`}
            ></button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
