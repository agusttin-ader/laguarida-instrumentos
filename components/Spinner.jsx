"use client"
import React from 'react'

export default function Spinner({ size = 36, stroke = 3, className = '' }){
  const s = size
  const r = (s - stroke) / 2
  const cx = s/2
  const cy = s/2
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{width: s, height: s}}>
      <svg className="animate-spin" width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <path d={`M ${cx} ${stroke/2} a ${r} ${r} 0 1 1 0 ${r*2}`} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    </div>
  )
}
