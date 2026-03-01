"use client"

import React from 'react'

/** Sticky CTA bar above bottom nav on mobile (Trip Planner / GoMart style) */
export default function ProductStickyCTA({
  href,
  ariaLabel = 'Contactar por WhatsApp',
  useLiveChat = false,
  productName = '',
}) {
  function openLiveChat() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(
      new CustomEvent('hybrid-chat:open-live', {
        detail: { productName: String(productName || '') },
      })
    )
  }

  return (
    <div className="md:hidden fixed bottom-[68px] left-0 right-0 z-40 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-[#1a1a1c] to-transparent pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2">
        {useLiveChat ? (
          <button
            type="button"
            onClick={openLiveChat}
            aria-label={ariaLabel || `Abrir chat en vivo sobre ${productName || 'este producto'}`}
            className="no-custom-btn flex items-center justify-center gap-2 w-full min-h-[3rem] rounded-xl bg-white text-[#141416] font-semibold text-base shadow-lg border border-white/10 btn-focus"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6.5 7.4A4.4 4.4 0 0 1 10.9 3h4.2a4.4 4.4 0 0 1 4.4 4.4v5.2a4.4 4.4 0 0 1-4.4 4.4h-2.1l-3.6 3v-3H8.9a4.4 4.4 0 0 1-4.4-4.4V7.4Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 9.5h7M9 12.3h5.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
            </svg>
            <span>Consultar en vivo</span>
          </button>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className="flex items-center justify-center gap-2 w-full min-h-[3rem] rounded-xl bg-white text-[#141416] font-semibold text-base shadow-lg border border-white/10 btn-focus"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
            </svg>
            <span>Consultar</span>
          </a>
        )}
        {useLiveChat && href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Continuar por WhatsApp"
            className="no-custom-btn shrink-0 inline-flex items-center justify-center w-12 min-h-[3rem] rounded-xl border border-[#d4a43b]/45 bg-[#d4a43b]/18 text-[#f3d399] btn-focus"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 3.2a8.8 8.8 0 0 0-7.56 13.3L3.2 20.8l4.44-1.16A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.36 8.9c.1-.22.18-.23.34-.24h.28c.1 0 .24.04.3.17.12.26.4 1 .44 1.08.04.08.06.18 0 .28-.06.1-.1.16-.2.24-.1.08-.2.18-.28.24-.1.1-.2.2-.08.4.12.2.54.9 1.16 1.44.8.7 1.46.9 1.66 1 .2.1.32.08.44-.04.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.2.08 1.2.56 1.4.66.2.1.34.14.38.22.04.08.04.5-.12.98-.16.48-.92.92-1.26.98-.34.06-.76.1-1.24-.06-.3-.1-.68-.22-1.18-.44-2.08-.9-3.44-3.02-3.54-3.16-.1-.14-.84-1.12-.84-2.14 0-1.02.54-1.52.74-1.72Z" fill="currentColor" />
            </svg>
          </a>
        ) : null}
      </div>
    </div>
  )
}
