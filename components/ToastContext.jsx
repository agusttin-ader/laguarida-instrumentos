"use client"

import React, { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { toast: () => {}, toasts: [] }
  return ctx
}

const TOAST_DURATION = 3200

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'default') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, TOAST_DURATION)
    return () => clearTimeout(t)
  }, [])

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
      <div
        className="fixed top-1/2 left-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 w-full max-w-[min(90vw,22rem)] flex flex-col items-center gap-2 pointer-events-none px-4"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`pointer-events-auto w-full rounded-2xl px-5 py-4 shadow-xl border backdrop-blur-md ${
              type === 'success'
                ? 'bg-[#0f1628]/95 dark:bg-[#0d1117]/95 text-white border-[#d4a43b]/40 shadow-[#d4a43b]/15 flex flex-col items-center justify-center text-center'
                : type === 'error'
                  ? 'bg-[rgba(185,28,28,0.95)] text-white border-red-400/30 text-center'
                  : 'bg-[rgba(26,26,28,0.95)] text-white border-white/12 text-center'
            }`}
            style={
              type === 'success'
                ? { boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,164,59,0.12)' }
                : undefined
            }
          >
            {type === 'success' && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d4a43b]/25 text-[#d4a43b] mb-2" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
            )}
            <span className={type === 'success' ? 'text-[0.95rem] font-semibold tracking-wide' : 'text-sm font-medium'}>
              {message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
