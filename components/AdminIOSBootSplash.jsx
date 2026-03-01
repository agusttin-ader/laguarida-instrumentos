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
    const toHide = window.setTimeout(() => setPhase("hidden"), 2050)
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

  useEffect(() => {
    if (phase === "hidden") return

    const blurActive = () => {
      const ae = document.activeElement
      if (ae && ae instanceof HTMLElement && ae !== document.body) ae.blur()
    }

    // Kill any retained focus so iOS won't pop the keyboard over the splash.
    blurActive()
    const intervalId = window.setInterval(blurActive, 120)

    const onFocusIn = (e) => {
      const target = e.target
      if (target && target instanceof HTMLElement) target.blur()
    }

    document.addEventListener("focusin", onFocusIn, true)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener("focusin", onFocusIn, true)
    }
  }, [phase])

  return (
    <>
      <div
        aria-hidden={phase !== "hidden"}
        className={phase !== "hidden" ? "pointer-events-none select-none" : ""}
        {...(phase !== "hidden" ? { inert: "" } : {})}
      >
        {children}
      </div>
      {phase !== "hidden" ? (
        <div
          className={`fixed inset-0 z-[140] transition-opacity duration-500 ${phase === "fading" ? "opacity-0" : "opacity-100"}`}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[#06080e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,164,59,0.10)_0%,rgba(9,12,19,0.94)_46%,rgba(6,8,14,1)_100%)]" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3.5">
            <div className="relative h-[96px] w-[96px] rounded-[26px] border border-white/12 bg-white/[0.025] shadow-[0_28px_70px_rgba(0,0,0,0.58)] backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 rounded-[26px] border border-white/8" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent" />
              <div className="absolute -inset-10 splash-soft-glow" />
              <Image
                src="/images/logo/og-pick-icon.PNG"
                alt="La Guarida"
                fill
                className="object-contain p-[15px]"
                priority
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/72">La Guarida Admin</p>
          </div>
        </div>
      ) : null}
    </>
  )
}
