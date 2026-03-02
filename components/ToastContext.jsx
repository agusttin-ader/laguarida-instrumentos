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
        className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-6 md:left-auto md:right-6 md:max-w-sm flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className="pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg border backdrop-blur-md"
            style={{
              background: type === 'error' ? 'rgba(185,28,28,0.95)' : type === 'success' ? 'rgba(21,128,61,0.95)' : 'rgba(26,26,28,0.95)',
              color: '#fff',
              borderColor: type === 'error' ? 'rgba(248,113,113,0.3)' : type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'
            }}
          >
            {message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
