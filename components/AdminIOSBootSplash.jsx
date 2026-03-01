"use client"

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"

function isIOSDevice() {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent || ""
  const platform = window.navigator.platform || ""
  const touchPoints = window.navigator.maxTouchPoints || 0
  return /iPad|iPhone|iPod/i.test(ua) || (platform === "MacIntel" && touchPoints > 1)
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false
  const iosStandalone = Boolean(window.navigator.standalone)
  const mediaStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches
  return iosStandalone || Boolean(mediaStandalone)
}

export default function AdminIOSBootSplash({ children }) {
  const [phase, setPhase] = useState("hidden") // hidden | visible | fading

  const shouldRun = useMemo(() => {
    if (typeof window === "undefined") return false
    // iOS only; prefer installed/PWA mode to avoid desktop web flash.
    return isIOSDevice() && isStandaloneDisplay()
  }, [])

  useEffect(() => {
    if (!shouldRun) return
    setPhase("visible")
    const toFade = window.setTimeout(() => setPhase("fading"), 1600)
    const toHide = window.setTimeout(() => setPhase("hidden"), 1950)
    return () => {
      window.clearTimeout(toFade)
      window.clearTimeout(toHide)
    }
  }, [shouldRun])

  useEffect(() => {
    if (phase === "hidden") return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [phase])

  return (
    <>
      {children}
      {phase !== "hidden" ? (
        <div
          className={`fixed inset-0 z-[140] transition-opacity duration-300 ${phase === "fading" ? "opacity-0" : "opacity-100"}`}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[#0a0d14]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,164,59,0.12)_0%,rgba(10,13,20,0.96)_55%,rgba(8,10,15,1)_100%)]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl border border-white/12 bg-white/[0.03] shadow-[0_20px_48px_rgba(0,0,0,0.42)] backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <Image
                src="/images/logo/og-pick-icon.PNG"
                alt="La Guarida"
                fill
                className="object-contain p-3"
                priority
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">La Guarida Admin</p>
            <div className="h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-[#d4a43b] animate-pulse" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
