"use client"

import React, { useEffect, useMemo, useState } from "react"

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
    if (typeof window.__adminHideSplash === "function") return false
    return isIOSDevice() && isStandaloneDisplay()
  }, [])

  useEffect(() => {
    if (!shouldRun) return
    setPhase("visible")
    const toFade = window.setTimeout(() => setPhase("fading"), 420)
    const toHide = window.setTimeout(() => setPhase("hidden"), 580)
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
          className={`fixed inset-0 z-[140] transition-opacity duration-200 ease-out ${phase === "fading" ? "opacity-0" : "opacity-100"}`}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[#06080e]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            <div className="flex h-[96px] w-[96px] items-center justify-center rounded-[26px] border border-white/12 bg-white/[0.03] p-[15px]">
              <img
                src="/images/logo/og-pick-icon.PNG"
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/72">La Guarida Admin</p>
          </div>
        </div>
      ) : null}
    </>
  )
}
