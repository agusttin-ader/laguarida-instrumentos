"use client"

export function trackWhatsAppClick() {
  try {
    const url = '/api/whatsapp-click'
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(url, new Blob(['{}'], { type: 'application/json' }))
      if (ok) return
    }
    void fetch(url, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }).catch(() => {})
  } catch { /* empty */ }
}
