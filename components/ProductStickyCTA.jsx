"use client"

import React from 'react'

/** Sticky CTA bar above bottom nav on mobile (Trip Planner / GoMart style) */
export default function ProductStickyCTA({ href, children = 'Consultar' }) {
  return (
    <div className="md:hidden fixed bottom-[68px] left-0 right-0 z-40 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-[#1a1a1c] to-transparent pointer-events-none">
      <div className="pointer-events-auto">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full min-h-[3rem] rounded-xl bg-white text-[#141416] font-semibold text-base shadow-lg border border-white/10 btn-focus"
        >
          {children}
        </a>
      </div>
    </div>
  )
}
