"use client"

import { track } from '@vercel/analytics'

export function trackWhatsAppClick() {
  try {
    track('whatsapp_click')
  } catch { /* empty */ }
}
